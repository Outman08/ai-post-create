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
    const { description, style, tone, accountType, category, count = 8 } = await request.json();

    if (!description || !style || !tone || !accountType) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ---------- 3. 检查 API Key ----------
    const apiKey = process.env["DEEPSEEK_API_KEY"];

    if (!apiKey) {
      // 没有 API Key 时返回预设模板
      const templateNames = generateTemplateNames(
        description,
        style,
        tone,
        accountType,
        category,
        count,
      );
      return new Response(JSON.stringify({ names: templateNames }), {
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
      system: `You are a professional Facebook name generator. Generate ${count} high-quality Facebook names.

CRITICAL RULES:
1. Each name must be suitable for Facebook (max 75 characters)
2. Style must be ${style}
3. Tone must be ${tone}
4. Account type is ${accountType}${category ? ` and category is ${category}` : ""}
5. Make it memorable, easy to spell, and brand-appropriate
6. Separate each name with exactly "---NAME_SEPARATOR---"
7. Do not use JSON, no arrays, no code blocks
8. Keep within 75 characters per name
9. No extra text before or after the names
10. No emojis in the names (keep it clean for Facebook)
11. For business accounts, include relevant keywords if possible
12. For personal accounts, keep it professional yet approachable`,
      prompt: `Generate ${count} ${tone} Facebook names in ${style} style for a ${accountType} account${category ? ` in the ${category} category` : ""} based on this description: "${description}". Separate each name with exactly "---NAME_SEPARATOR---".`,
      temperature: 0.7,
    });

    // ---------- 5. 解析结果 ----------
    let names = text
      .split("---NAME_SEPARATOR---")
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .slice(0, count);

    // 解析失败时用模板补充
    if (names.length === 0) {
      names = generateTemplateNames(description, style, tone, accountType, category, count);
    }

    // 名字不够时用模板补充
    while (names.length < count) {
      const templateNames = generateTemplateNames(
        description,
        style,
        tone,
        accountType,
        category,
        count - names.length,
      );
      names = names.concat(templateNames);
    }

    return new Response(JSON.stringify({ names: names.slice(0, count) }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // 出错时返回模板
    let description = "business offering quality services";
    let style = "Local business";
    let tone = "Friendly";
    let accountType = "Business";
    let category: string | undefined;
    let count = 8;

    try {
      const body = await request.json().catch(() => ({}));
      description = body.description || description;
      style = body.style || style;
      tone = body.tone || tone;
      accountType = body.accountType || accountType;
      category = body.category;
      count = body.count || count;
    } catch {
      // 忽略解析错误
    }

    const templateNames = generateTemplateNames(
      description,
      style,
      tone,
      accountType,
      category,
      count,
    );
    return new Response(JSON.stringify({ names: templateNames }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// 预设模板生成（备份方案）
function generateTemplateNames(
  description: string,
  style: string,
  tone: string,
  accountType: string,
  category: string | undefined,
  count: number,
) {
  const desc = description.trim() || "business offering quality services";
  const cat = category?.trim();

  // 从描述中提取关键词
  const keywords = desc
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 2 &&
        !["the", "a", "an", "and", "or", "for", "of", "to", "in", "on", "with"].includes(w),
    );

  const mainKeyword = keywords[0] || "studio";
  const secondKeyword = keywords[1] || "co";

  const STYLE_TEMPLATES: Record<string, string[]> = {
    "Local business": [
      "{keyword} & Co",
      "{keyword} Studio",
      "The {keyword} Shop",
      "{keyword} Local",
      "Downtown {keyword}",
      "{keyword} House",
    ],
    "Community group": [
      "{keyword} Lovers",
      "{keyword} Community",
      "{keyword} Fans United",
      "{keyword} Hub",
      "{keyword} Collective",
      "{keyword} Circle",
    ],
    Creator: [
      "{keyword} By {name}",
      "{keyword} Create",
      "{keyword} Craft",
      "{keyword} Studio",
      "{keyword} Works",
      "Made by {keyword}",
    ],
    Brand: [
      "{keyword} Co",
      "{keyword} Brand",
      "{keyword} Lab",
      "{keyword} Studio",
      "{keyword} & Co",
      "{keyword} Official",
    ],
    Cause: [
      "{keyword} Initiative",
      "{keyword} Project",
      "{keyword} Foundation",
      "{keyword} Movement",
      "{keyword} Action",
      "{keyword} Fund",
    ],
  };

  const TONE_MODIFIERS: Record<string, string[]> = {
    Friendly: ["", "Happy ", "Lovely ", "Sunny ", "Warm ", "Cheerful "],
    Professional: ["", "Premium ", "Elite ", "Executive ", "Pro ", "Expert "],
    Playful: ["", "Fun ", "Joy ", "Play ", "Wonder ", "Magic "],
    Premium: ["", "Luxury ", "Premium ", "Exclusive ", "Signature ", "Couture "],
    Bold: ["", "Power ", "Prime ", "Vibe ", "Pulse ", "Edge "],
  };

  const names: string[] = [];
  const templates = (STYLE_TEMPLATES[style] || STYLE_TEMPLATES["Local business"])!;
  const modifiers = (TONE_MODIFIERS[tone] || TONE_MODIFIERS["Friendly"])!;

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length]!;
    const modifier = modifiers[i % modifiers.length]!;
    const keyword = i % 2 === 0 ? mainKeyword : secondKeyword;
    let name = template
      .replace(/{keyword}/g, capitalizeFirst(keyword))
      .replace(/{name}/g, capitalizeFirst(keyword));

    if (modifier && i % 3 === 0) {
      name = modifier + name;
    }

    // 确保不超过75字符
    name = name.slice(0, 75);
    names.push(name);
  }

  return names;
}

function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
