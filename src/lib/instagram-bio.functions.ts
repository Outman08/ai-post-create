import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const Input = z.object({
  description: z.string().min(1).max(500),
  tone: z.string().min(1).max(40),
  count: z.number().optional().default(6),
});

const Schema = z.object({
  bios: z.array(z.string()),
});

// ── 全局实例限流（10 次 / 小时）──────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1小时
const RATE_LIMIT_MAX = 10;
const globalHits: number[] = [];

function checkRateLimit(): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  const freshHits = globalHits.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  globalHits.length = 0;
  globalHits.push(...freshHits);

  if (globalHits.length >= RATE_LIMIT_MAX) {
    const oldest = globalHits[0]!;
    return { ok: false, retryAfterMs: RATE_LIMIT_WINDOW_MS - (now - oldest) };
  }

  globalHits.push(now);
  return { ok: true };
}

// 模板 fallback
const EMOJI: Record<string, string[]> = {
  Professional: ["📊", "💼", "🚀", "📈", "🤝"],
  Playful: ["✨", "🎈", "🌈", "🍭", "🥳"],
  Aesthetic: ["🌙", "🕊️", "🤍", "🌿", "☁️"],
  Bold: ["🔥", "⚡", "💥", "🏆", "🦾"],
  Minimal: ["·", "—", "◦", "/", "•"],
  Funny: ["🙃", "🍕", "🐒", "🤡", "😵‍💫"],
};

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length] as T;
}

function buildTemplateBios(
  description: string,
  tone: string,
  count: number,
  seed: number,
): string[] {
  const desc = description.trim() || "creator sharing daily tips";
  const emojis = EMOJI[tone] || EMOJI["Playful"]!;

  const TAGLINES: Record<string, string[]> = {
    Professional: ["Helping you grow", "Results that matter", "Let's build together"],
    Playful: ["Good vibes only", "Join the fun", "Stay cozy"],
    Aesthetic: ["Less but better", "Soft days, sharp focus", "Curated for you"],
    Bold: ["No fluff. Just results.", "Built different", "Level up"],
    Minimal: ["Link below", "Stay tuned", "More below"],
    Funny: ["Results may vary", "0% serious", "Professional amateur"],
  };

  const taglines = TAGLINES[tone] || TAGLINES["Playful"]!;
  const bios: string[] = [];

  for (let i = 0; i < count; i++) {
    const emoji1 = pick(emojis, seed + i);
    const emoji2 = pick(emojis, seed + i + 3);
    const tagline = pick(taglines, seed + i);
    bios.push(`${emoji1} ${desc}\n${emoji2} ${tagline}`);
  }

  return bios;
}

export const generateBios = createServerFn({ method: "POST" })
  .validator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    // 1) 限流检查
    const limit = checkRateLimit();
    if (!limit.ok) {
      const secs = Math.ceil(limit.retryAfterMs / 1000);
      const mins = Math.ceil(secs / 60);
      throw new Error(`已达到使用限制！每小时最多生成${RATE_LIMIT_MAX}次，请${mins}分钟后再试。`);
    }

    // 2) 尝试 DeepSeek
    const key = process.env["DEEPSEEK_API_KEY"];
    if (key) {
      try {
        const { createDeepSeekProvider } = await import("./ai-gateway.server");
        const deepseek = createDeepSeekProvider(key);

        const result = await generateText({
          model: deepseek("deepseek-chat"),
          system: `You are a professional Instagram bio generator. Generate ${data.count} high-quality Instagram bios.

CRITICAL RULES:
1. Each bio must be suitable for Instagram (max 150 characters)
2. Tone must be ${data.tone}
3. Include relevant emojis
4. Make it engaging and personal
5. Separate each bio with exactly "---BIO_SEPARATOR---"
6. Do not use JSON, no arrays, no code blocks
7. Keep within 150 characters per bio
8. No extra text before or after the bios
9. Each bio should have line breaks where appropriate for readability`,
          prompt: `Generate ${data.count} ${data.tone} Instagram bios based on this description: "${data.description}". Separate each bio with exactly "---BIO_SEPARATOR---".`,
          temperature: 0.7,
        });

        let bios = result.text
          .split("---BIO_SEPARATOR---")
          .map((p) => p.trim())
          .filter((p) => p.length > 0)
          .slice(0, data.count);

        // 如果分割失败，尝试用双换行分割
        if (bios.length === 0) {
          bios = result.text
            .split("\n\n")
            .map((p) => p.trim())
            .filter((p) => p.length > 0)
            .slice(0, data.count);
        }

        if (bios.length > 0) {
          return { bios, isTemplate: false };
        }
      } catch {
        // AI 失败时回退到模板
      }
    }

    // 3) 模板 fallback
    const seed = Date.now();
    const bios = buildTemplateBios(data.description, data.tone, data.count || 6, seed);
    return { bios, isTemplate: true };
  });
