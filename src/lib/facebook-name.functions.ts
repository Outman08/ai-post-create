import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const Input = z.object({
  description: z.string().min(1).max(500),
  accountType: z.string().min(1).max(40),
  category: z.string().optional(),
  style: z.string().min(1).max(40),
  tone: z.string().min(1).max(40),
});

const Schema = z.object({
  names: z.array(z.string()),
});

// ── 全局实例限流（5 次 / 分钟）──────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 5;
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

// 模板 fallback（复用原来的逻辑）
const LOCATIONS = [
  "Austin",
  "Brooklyn",
  "Denver",
  "Riverside",
  "Lakeside",
  "Downtown",
  "Northside",
  "Sunset",
  "Highland",
  "Oakwood",
  "Maplewood",
  "Harborview",
  "Westend",
  "Greenfield",
  "Portland",
  "Nashville",
  "Seattle",
  "Brookline",
];
const STREETS = [
  "Maple Street",
  "Sunset",
  "Highland",
  "Oakwood",
  "Riverside",
  "Lakeside",
  "Park Avenue",
  "Birch Lane",
  "Cedar",
  "Harbor",
  "Pine",
];
const SUFFIXES = [
  "Bakery",
  "Roasters",
  "Studio",
  "Co",
  "Collective",
  "House",
  "Shop",
  "Works",
  "Lab",
  "Loft",
  "Space",
  "Hub",
  "Co.",
];
const ADJECTIVES = [
  "Cozy",
  "Bright",
  "Warm",
  "Local",
  "Modern",
  "Fresh",
  "Bold",
  "Clever",
  "Charming",
  "Nifty",
  "Neat",
  "Prime",
  "Smart",
  "Cute",
  "Happy",
  "Sunny",
  "Warm",
  "Cheerful",
];

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
  const templates = STYLE_TEMPLATES[style] || STYLE_TEMPLATES["Local business"]!;
  const modifiers = TONE_MODIFIERS[tone] || TONE_MODIFIERS["Friendly"]!;

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

    name = name.slice(0, 75);
    names.push(name);
  }

  return names;
}

function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const generateFacebookNames = createServerFn({ method: "POST" })
  .validator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    // 1) 限流检查
    const limit = checkRateLimit();
    if (!limit.ok) {
      const secs = Math.ceil(limit.retryAfterMs / 1000);
      throw new Error(`Too many requests. Please try again in ${secs}s.`);
    }

    // 2) 尝试 DeepSeek
    const key = process.env["DEEPSEEK_API_KEY"];
    if (key) {
      try {
        const { createDeepSeekProvider } = await import("./ai-gateway.server");
        const deepseek = createDeepSeekProvider(key);

        const result = await generateText({
          model: deepseek("deepseek-chat"),
          system: `You are a professional Facebook name generator. Generate 8 high-quality Facebook names.

CRITICAL RULES:
1. Each name must be suitable for Facebook (max 75 characters)
2. Style must be ${data.style}
3. Tone must be ${data.tone}
4. Account type is ${data.accountType}${
            data.accountType === "Business" && data.category
              ? ` and category is ${data.category}`
              : ""
          }
5. Make it memorable, easy to spell, and brand-appropriate
6. Separate each name with exactly "---NAME_SEPARATOR---"
7. Do not use JSON, no arrays, no code blocks
8. Keep within 75 characters per name
9. No extra text before or after the names
10. No emojis in the names (keep it clean for Facebook)
11. For business accounts, include relevant keywords if possible
12. For personal accounts, keep it professional yet approachable`,
          prompt: `Generate 8 ${data.tone} Facebook names in ${
            data.style
          } style for a ${data.accountType} account${
            data.accountType === "Business" && data.category
              ? ` in the ${data.category} category`
              : ""
          } based on this description: "${
            data.description
          }". Separate each name with exactly "---NAME_SEPARATOR---".`,
          temperature: 0.7,
        });

        const names = result.text
          .split("---NAME_SEPARATOR---")
          .map((p) => p.trim())
          .filter((p) => p.length > 0)
          .slice(0, 8);

        if (names.length > 0) {
          return { names, isAI: true };
        }
      } catch {
        // AI 失败时回退到模板
      }
    }

    // 3) 模板 fallback
    const names = generateTemplateNames(
      data.description,
      data.style,
      data.tone,
      data.accountType,
      data.category,
      8,
    );
    return { names, isAI: false };
  });
