import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { checkRateLimit } from "./rate-limit.server";

const Input = z.object({
  post: z.string().min(1).max(4000),
  tone: z.string().min(1).max(40),
  platform: z.string().min(1).max(40),
  intent: z.string().min(1).max(60),
});

const Schema = z.object({
  comments: z.array(z.string()),
});

export const generateComments = createServerFn({ method: "POST" })
  .validator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    // 1) 限流检查（基于 Upstash Redis，按 IP 维度 5 次/分钟）
    const limit = await checkRateLimit("comment-generator", { max: 5, windowSeconds: 60 });
    if (!limit.ok) {
      const secs = Math.ceil(limit.retryAfterMs / 1000);
      throw new Error(`Too many requests. Please try again in ${secs}s.`);
    }

    // 2) 调用 DeepSeek
    const key = process.env["DEEPSEEK_API_KEY"];
    if (!key) throw new Error("AI is not configured yet.");

    const { createDeepSeekProvider } = await import("./ai-gateway.server");
    const deepseek = createDeepSeekProvider(key);

    const result = await generateText({
      model: deepseek("deepseek-chat"),
      system:
        "You write social media comments that sound human. Never use empty praise like 'Great post!'. Reference a specific idea from the original post, add a genuine perspective, and match the culture of the target platform. No hashtags unless the platform expects them. Return exactly three distinct comments, not three rewordings. Respond with ONLY a JSON object of the form { comments: ['...', '...', '...'] } and no markdown fences.",
      prompt: `Original post to reply to:\n"""${data.post}"""\n\nPlatform: ${data.platform}\nTone: ${data.tone}\nComment type: ${data.intent}\n\nWrite 3 distinct comment options.`,
    });

    const raw = result.text
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "");
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const parsed = Schema.safeParse(
      JSON.parse(start >= 0 && end > start ? raw.slice(start, end + 1) : raw),
    );
    if (!parsed.success || parsed.data.comments.length === 0) {
      throw new Error("The AI returned an unexpected response. Please try again.");
    }
    return { comments: parsed.data.comments.slice(0, 3) };
  });
