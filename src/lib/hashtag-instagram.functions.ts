import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { checkRateLimit } from "./rate-limit.server";
import { generateHashtags as generateTemplateHashtags } from "@/components/instagram-hashtag/generator";

const inputSchema = z.object({
  topic: z.string().min(1).max(500),
});

export type HashtagGroup = {
  label: string;
  hint: string;
  tags: string[];
};

export const generateInstagramHashtags = createServerFn({ method: "POST" })
  .validator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<{ groups: HashtagGroup[]; isAI: boolean }> => {
    // 1) 限流检查（基于 Upstash Redis，按 IP 维度 5 次/分钟）
    const limit = await checkRateLimit("instagram-hashtag", { max: 5, windowSeconds: 60 });
    if (!limit.ok) {
      const secs = Math.ceil(limit.retryAfterMs / 1000);
      throw new Error(`Too many requests. Please try again in ${secs}s.`);
    }

    // 2) 检查 DeepSeek API Key
    const key = process.env["DEEPSEEK_API_KEY"];
    if (!key) {
      // 没有 API Key 时回退到模板
      return { groups: generateTemplateHashtags(data.topic), isAI: false };
    }

    try {
      const { createDeepSeekProvider } = await import("./ai-gateway.server");
      const deepseek = createDeepSeekProvider(key);

      const result = await generateText({
        model: deepseek("deepseek-chat"),
        system: `You are an Instagram hashtag strategist. Generate hashtag groups for an Instagram post based on the topic.

Return ONLY a JSON object with this exact shape, no markdown fences:
{
  "groups": [
    { "label": "Niche & specific", "hint": "Lower competition, higher intent — the tags most likely to reach real buyers.", "tags": ["tag1", "tag2", ...] },
    { "label": "Broad & high reach", "hint": "Big, busy tags that add discovery volume on top of your niche set.", "tags": [...] },
    { "label": "Long-tail & community", "hint": "Tags your audience actually follows and browses week to week.", "tags": [...] },
    { "label": "Engagement boosters", "hint": "Save- and share-friendly tags for educational or how-to posts.", "tags": [...] }
  ]
}

RULES:
- Niche & specific: 10 tags, lower competition, high intent
- Broad & high reach: 8 tags, big Instagram tags
- Long-tail & community: 8 tags, community/niche tags
- Engagement boosters: 6 tags, save/share/how-to tags
- All tags as single words or joined words, no # prefix
- Tags must be relevant to the topic
- Stay under Instagram's 30-tag limit total
- No duplicates across groups`,
        prompt: `Generate Instagram hashtag groups for this post topic: "${data.topic}"`,
        temperature: 0.7,
      });

      const raw = result.text
        .trim()
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/, "");
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      const parsed = JSON.parse(start >= 0 && end > start ? raw.slice(start, end + 1) : raw) as {
        groups?: HashtagGroup[];
      };

      const groups = (parsed.groups ?? [])
        .filter((g) => Array.isArray(g.tags) && g.tags.length > 0)
        .map((g) => ({
          label: g.label || "Hashtags",
          hint: g.hint || "",
          tags: g.tags.map((t) => String(t).replace(/^#/, "").trim()).filter((t) => t.length > 0),
        }));

      if (groups.length === 0) {
        // AI 解析失败，回退到模板
        return { groups: generateTemplateHashtags(data.topic), isAI: false };
      }

      return { groups, isAI: true };
    } catch {
      // 任意错误回退到模板
      return { groups: generateTemplateHashtags(data.topic), isAI: false };
    }
  });
