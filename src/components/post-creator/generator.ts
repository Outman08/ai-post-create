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
    const withTags = platform.id === "linkedin" ? `${post}\n\n${tags}` : `${post}\n\n${tags}`;
    bodies.push(
      withTags.length > platform.limit
        ? `${withTags.slice(0, Math.max(0, platform.limit - 1)).trimEnd()}…`
        : withTags,
    );
  }

  return bodies;
}

export async function generatePosts(
  topic: string,
  platform: Platform,
  tone: Tone,
  count = 3,
): Promise<string[]> {
  try {
    // 判断是否在本地开发（localhost）
    const isLocalhost =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    if (isLocalhost) {
      console.log("📍 本地开发：直接调用 DeepSeek API");

      const apiKey = import.meta.env["VITE_DEEPSEEK_API_KEY"];
      if (!apiKey) {
        console.log("No API key found, using template posts");
        return generateTemplatePosts(topic, platform, tone, count);
      }

      console.log("Calling DeepSeek API...");

      // 使用 DeepSeek API 直接调用
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `You are a professional social media post generator. Generate ${count} high-quality social media posts.

CRITICAL RULES:
1. Each post must be suitable for ${platform.name}
2. Tone must be ${tone}
3. Include relevant hashtags
4. Make content engaging and shareable
5. Separate each post with exactly "---POST_SEPARATOR---"
6. Do not use JSON, no arrays, no code blocks
7. Keep within platform character limits (${platform.limit} max)
8. No extra text before or after the posts`,
            },
            {
              role: "user",
              content: `Generate ${count} ${tone} social media posts about "${topic}" for ${platform.name}. Separate each post with exactly "---POST_SEPARATOR---".`,
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiContent = data.choices[0]?.message?.content || "";

      console.log("AI Response received:", aiContent);

      // 使用分隔符分割帖子
      let posts = aiContent
        .split("---POST_SEPARATOR---")
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 0)
        .slice(0, count);

      console.log("Parsed posts:", posts);

      // 如果分割失败，尝试用双换行分割
      if (posts.length === 0) {
        posts = aiContent
          .split("\n\n")
          .map((p: string) => p.trim())
          .filter((p: string) => p.length > 0)
          .slice(0, count);
      }

      // 如果还是没有帖子，使用模板
      if (posts.length === 0) {
        console.log("No valid posts from AI, using templates");
        return generateTemplatePosts(topic, platform, tone, count);
      }

      // 如果帖子不够，用模板补充
      while (posts.length < count) {
        const templatePosts = generateTemplatePosts(topic, platform, tone, count - posts.length);
        posts = posts.concat(templatePosts);
      }

      return posts.slice(0, count);
    } else {
      console.log("🚀 Vercel 环境：调用 Edge Function");

      // Vercel 部署：调用 Edge Function
      const response = await fetch("/api/generate-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          platform: platform.name,
          tone,
          count,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("API 响应收到：", data);

      return data.posts || generateTemplatePosts(topic, platform, tone, count);
    }
  } catch (error) {
    console.error("生成帖子时出错：", error);
    // 错误时使用模板
    return generateTemplatePosts(topic, platform, tone, count);
  }
}
