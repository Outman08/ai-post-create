import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  try {
    // ---------- 1. Referer 验证 ----------
    const referer = request.headers.get("referer");
    const host = request.headers.get("host");

    // 允许的域名列表
    const allowedOrigins = [
      "geelark.com",
      "geelark.", // 覆盖所有子域名
      "localhost:", // 本地开发
      "127.0.0.1:", // 本地开发
    ];

    const isAllowed = allowedOrigins.some(
      (origin) => referer?.includes(origin) || host?.includes(origin),
    );

    if (!isAllowed) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ---------- 2. 获取请求数据 ----------
    const { description, tone, count = 6 } = await request.json();

    if (!description || !tone) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ---------- 3. 检查 API Key ----------
    const apiKey = process.env["DEEPSEEK_API_KEY"];

    if (!apiKey) {
      // 没有 API Key 时返回预设模板
      const templateBios = generateTemplateBios(description, tone, count);
      return new Response(JSON.stringify({ bios: templateBios }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ---------- 4. 调用 DeepSeek API ----------
    const deepseek = createOpenAICompatible({
      name: "deepseek",
      baseURL: "https://api.deepseek.com/v1",
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const { text } = await generateText({
      model: deepseek("deepseek-chat"),
      system: `You are a professional Instagram bio generator. Generate ${count} high-quality Instagram bios.

CRITICAL RULES:
1. Each bio must be suitable for Instagram (max 150 characters)
2. Tone must be ${tone}
3. Include relevant emojis
4. Make it engaging and personal
5. Separate each bio with exactly "---BIO_SEPARATOR---"
6. Do not use JSON, no arrays, no code blocks
7. Keep within 150 characters per bio
8. No extra text before or after the bios
9. Each bio should have line breaks where appropriate for readability`,
      prompt: `Generate ${count} ${tone} Instagram bios based on this description: "${description}". Separate each bio with exactly "---BIO_SEPARATOR---".`,
      temperature: 0.7,
    });

    // ---------- 5. 解析结果 ----------
    let bios = text
      .split("---BIO_SEPARATOR---")
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .slice(0, count);

    // 解析失败时用模板补充
    if (bios.length === 0) {
      bios = generateTemplateBios(description, tone, count);
    }

    // 帖子不够时用模板补充
    while (bios.length < count) {
      const templateBios = generateTemplateBios(description, tone, count - bios.length);
      bios = bios.concat(templateBios);
    }

    return new Response(JSON.stringify({ bios: bios.slice(0, count) }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // 出错时返回模板
    let description = "creator sharing daily tips";
    let tone = "Playful";
    let count = 6;

    try {
      const body = await request.json().catch(() => ({}));
      description = body.description || description;
      tone = body.tone || tone;
      count = body.count || count;
    } catch {
      // 忽略解析错误
    }

    const templateBios = generateTemplateBios(description, tone, count);
    return new Response(JSON.stringify({ bios: templateBios }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// 预设模板生成（备份方案）
function generateTemplateBios(description: string, tone: string, count: number) {
  const desc = description.trim() || "creator sharing daily tips";

  const EMOJI: Record<string, string[]> = {
    Professional: ["📊", "💼", "🚀", "📈", "🤝"],
    Playful: ["✨", "🎈", "🌈", "🍭", "🥳"],
    Aesthetic: ["🌙", "🕊️", "🤍", "🌿", "☁️"],
    Bold: ["🔥", "⚡", "💥", "🏆", "🦾"],
    Minimal: ["·", "—", "◦", "/", "•"],
    Funny: ["🙃", "🍕", "🐒", "🤡", "😵‍💫"],
  };

  const taglines: Record<string, string[]> = {
    Professional: ["Helping you grow", "Results that matter", "Let's build together"],
    Playful: ["Good vibes only", "Join the fun", "Stay cozy"],
    Aesthetic: ["Less but better", "Soft days, sharp focus", "Curated for you"],
    Bold: ["No fluff. Just results.", "Built different", "Level up"],
    Minimal: ["Link below", "Stay tuned", "More below"],
    Funny: ["Results may vary", "0% serious", "Professional amateur"],
  };

  function pick<T>(arr: T[], seed: number): T {
    return arr[Math.abs(seed) % arr.length] as T;
  }

  const e = EMOJI[tone] || EMOJI.Playful;
  const t = taglines[tone] || taglines.Playful;
  const em = (i: number, seed: number) => `${pick(e, seed + i)} `;

  const bios: string[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 7;
    bios.push(`${em(i * 2, seed)}${desc}\n${em(i * 2 + 1, seed)}${pick(t, seed + i)}`);
  }

  return bios;
}
