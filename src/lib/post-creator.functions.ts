import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { checkRateLimit, RATE_LIMIT_MESSAGE } from "./rate-limit.server";

export type PlatformId = "tiktok" | "instagram" | "x" | "linkedin" | "facebook";

export type Platform = {
  id: PlatformId;
  name: string;
  handleLabel: string;
  limit: number;
};

export const PLATFORMS: Platform[] = [
  { id: "tiktok", name: "TikTok", handleLabel: "@geelark", limit: 2200 },
  { id: "instagram", name: "Instagram", handleLabel: "@geelark", limit: 2200 },
  { id: "x", name: "X", handleLabel: "@GeeLark", limit: 280 },
  { id: "linkedin", name: "LinkedIn", handleLabel: "GeeLark", limit: 3000 },
  { id: "facebook", name: "Facebook", handleLabel: "GeeLark", limit: 63206 },
];

export const TONES = ["Friendly", "Professional", "Bold", "Playful", "Informative"] as const;
export type Tone = (typeof TONES)[number];

const Input = z.object({
  topic: z.string().min(1).max(500),
  platformId: z.enum(["tiktok", "instagram", "x", "linkedin", "facebook"]),
  tone: z.enum(["Friendly", "Professional", "Bold", "Playful", "Informative"]),
  count: z.number().optional().default(3),
});

const HASHTAGS: Record<PlatformId, string[]> = {
  tiktok: ["#cloudphone", "#antidetect", "#socialmediagrowth", "#geelark"],
  instagram: ["#cloudphone", "#creatorworkflow", "#socialmedia", "#geelark"],
  x: ["#automation", "#growth"],
  linkedin: ["#growthmarketing", "#operations", "#automation"],
  facebook: ["#socialmedia", "#smallbusiness"],
};

const OPENERS: Record<Tone, string[]> = {
  Friendly: ["Here's the easy way to", "Quick tip if you want to", "Let's talk about how to"],
  Professional: ["A practical approach to", "How modern teams", "What it really takes to"],
  Bold: ["Stop wasting hours on", "Nobody tells you this about", "The hard truth about"],
  Playful: ["Plot twist:", "POV: you finally figured out", "Not to brag, but"],
  Informative: ["Three things to know about", "A short breakdown of", "Here's how it works:"],
};

const CLOSERS: Record<Tone, string[]> = {
  Friendly: ["Save this for later 💾", "Tell me if you try it 👇", "Hope this helps!"],
  Professional: [
    "Full breakdown in the comments.",
    "Happy to share the workflow.",
    "Curious how your team handles this.",
  ],
  Bold: ["Run it. Thank me later.", "Your competitors already do this.", "No excuses now."],
  Playful: ["You're welcome 😌", "Go on, try it 🚀", "It's giving efficiency ✨"],
  Informative: [
    "Sources and setup steps below.",
    "Bookmark for your next launch.",
    "Questions? Drop them below.",
  ],
};

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length] as T;
}

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return h;
}

function clean(topic: string) {
  const t = topic.trim().replace(/\s+/g, " ");
  return t.charAt(0).toLowerCase() + t.slice(1);
}

function generateTemplatePosts(
  topic: string,
  platform: Platform,
  tone: Tone,
  count: number,
): string[] {
  const base = clean(topic) || "running multiple social accounts without getting flagged";
  const tags = HASHTAGS[platform.id].join(" ");
  const bodies: string[] = [];

  for (let i = 0; i < count; i++) {
    const seed = hash(`${base}|${platform.id}|${tone}|${i}`);
    const post = `${pick(OPENERS[tone], seed)} ${base}.\n\nGeeLark spins up real cloud Android phones, each with its own device fingerprint, so every account looks and behaves like a separate person. No extra hardware, no juggling SIMs.\n\n${pick(CLOSERS[tone], seed)}`;
    const withTags = `${post}\n\n${tags}`;
    bodies.push(
      withTags.length > platform.limit
        ? `${withTags.slice(0, Math.max(0, platform.limit - 1)).trimEnd()}…`
        : withTags,
    );
  }

  return bodies;
}

export const generatePosts = createServerFn({ method: "POST" })
  .validator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    // 1) 限流检查（基于 Upstash Redis，按 IP 维度 10 次/小时）
    const limit = await checkRateLimit("post-creator");
    if (!limit.ok) {
      throw new Error(RATE_LIMIT_MESSAGE);
    }

    const platform = PLATFORMS.find((p) => p.id === data.platformId) || PLATFORMS[0]!;

    // 2) 尝试 DeepSeek
    const key = process.env["DEEPSEEK_API_KEY"];
    if (key) {
      try {
        const { createDeepSeekProvider } = await import("./ai-gateway.server");
        const deepseek = createDeepSeekProvider(key);

        const result = await generateText({
          model: deepseek("deepseek-chat"),
          system: `You are a professional social media post generator. Generate ${data.count} high-quality social media posts.

CRITICAL RULES:
1. Each post must be suitable for ${platform.name}
2. Tone must be ${data.tone}
3. Include relevant hashtags
4. Make content engaging and shareable
5. Separate each post with exactly "---POST_SEPARATOR---"
6. Do not use JSON, no arrays, no code blocks
7. Keep within platform character limits (${platform.limit} max)
8. No extra text before or after the posts`,
          prompt: `Generate ${data.count} ${data.tone} social media posts about "${data.topic}" for ${platform.name}. Separate each post with exactly "---POST_SEPARATOR---".`,
          temperature: 0.7,
        });

        let posts = result.text
          .split("---POST_SEPARATOR---")
          .map((p) => p.trim())
          .filter((p) => p.length > 0)
          .slice(0, data.count);

        // 如果分割失败，尝试用双换行分割
        if (posts.length === 0) {
          posts = result.text
            .split("\n\n")
            .map((p) => p.trim())
            .filter((p) => p.length > 0)
            .slice(0, data.count);
        }

        if (posts.length > 0) {
          return { posts, isTemplate: false };
        }
      } catch {
        // AI 失败时回退到模板
      }
    }

    // 3) 模板 fallback
    const posts = generateTemplatePosts(data.topic, platform, data.tone, data.count || 3);
    return { posts, isTemplate: true };
  });
