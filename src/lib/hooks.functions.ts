import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { checkRateLimit, RATE_LIMIT_MESSAGE } from "./rate-limit.server";

const inputSchema = z.object({
  topic: z.string().min(3).max(500),
  style: z.string().min(2).max(60),
  tone: z.string().min(2).max(40),
});

export type GeneratedHook = { framework: string; hook: string };

export const generateHooks = createServerFn({ method: "POST" })
  .validator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<{ hooks: GeneratedHook[] }> => {
    // 1) 限流检查（基于 Upstash Redis，按 IP 维度 5 次/分钟）
    const limit = await checkRateLimit("tiktok-hook", { max: 5, windowSeconds: 60 });
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
        "You write scroll-stopping TikTok video hooks: the spoken or on-screen opening line of a short-form video. Hooks must be under 15 words, casual and TikTok-native, specific, and never generic. Return JSON only.",
      prompt: `Topic: ${data.topic}\nPreferred hook style: ${data.style}\nTone: ${data.tone}\n\nReturn exactly 8 hooks as JSON: {"hooks":[{"framework":"<framework name>","hook":"<the opening line>"}]}. Use the preferred style for most of them, and mix in 2 other proven frameworks (Curiosity Gap, Bold Claim, Question, Contrarian Take, Relatable Pain, Before and After Reveal).`,
    });

    const raw = result.text
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "");
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    const parsed = JSON.parse(start >= 0 && end > start ? raw.slice(start, end + 1) : raw) as {
      hooks?: GeneratedHook[];
    };
    const hooks = (parsed.hooks ?? [])
      .filter((h) => typeof h?.hook === "string" && h.hook.trim().length > 0)
      .map((h) => ({ framework: h.framework || "Hook", hook: h.hook.trim() }));

    if (hooks.length === 0) {
      throw new Error("The AI returned an unexpected response. Please try again.");
    }
    return { hooks };
  });
