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
    const { topic, platform, tone, count = 3 } = await request.json();

    if (!topic || !platform || !tone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // ---------- 3. 检查 API Key ----------
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      // 没有 API Key 时返回预设模板
      const templatePosts = generateTemplatePosts(topic, platform, tone, count);
      return new Response(JSON.stringify({ posts: templatePosts }), {
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
      system: `You are a professional social media post generator. Generate ${count} high-quality social media posts.

CRITICAL RULES:
1. Each post must be suitable for ${platform}
2. Tone must be ${tone}
3. Include relevant hashtags
4. Make content engaging and shareable
5. Separate each post with exactly "---POST_SEPARATOR---"
6. Do not use JSON, no arrays, no code blocks
7. Keep within platform character limits
8. No extra text before or after the posts`,
      prompt: `Generate ${count} ${tone} social media posts about "${topic}" for ${platform}. Separate each post with exactly "---POST_SEPARATOR---".`,
      temperature: 0.7,
    });

    // ---------- 5. 解析结果 ----------
    let posts = text
      .split("---POST_SEPARATOR---")
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .slice(0, count);

    // 解析失败时用模板补充
    if (posts.length === 0) {
      posts = generateTemplatePosts(topic, platform, tone, count);
    }

    // 帖子不够时用模板补充
    while (posts.length < count) {
      const templatePosts = generateTemplatePosts(topic, platform, tone, count - posts.length);
      posts = posts.concat(templatePosts);
    }

    return new Response(JSON.stringify({ posts: posts.slice(0, count) }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // 出错时返回模板
    let topic = "running multiple social accounts";
    let platform = "TikTok";
    let tone = "Friendly";
    let count = 3;

    try {
      const body = await request.json().catch(() => ({}));
      topic = body.topic || topic;
      platform = body.platform || platform;
      tone = body.tone || tone;
      count = body.count || count;
    } catch {
      // 忽略解析错误
    }

    const templatePosts = generateTemplatePosts(topic, platform, tone, count);
    return new Response(JSON.stringify({ posts: templatePosts }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// 预设模板生成（备份方案）
function generateTemplatePosts(topic: string, platform: string, tone: string, count: number) {
  const cleanTopic = topic.trim().replace(/\s+/g, " ") || "running multiple social accounts";

  const openers = {
    Friendly: [
      `Here's the easy way to ${cleanTopic}`,
      `Quick tip if you want to ${cleanTopic}`,
      `Let's talk about how to ${cleanTopic}`,
    ],
    Professional: [
      `A practical approach to ${cleanTopic}`,
      `How modern teams handle ${cleanTopic}`,
      `What it really takes to ${cleanTopic}`,
    ],
    Bold: [
      `Stop wasting hours on ${cleanTopic}`,
      `Nobody tells you this about ${cleanTopic}`,
      `The hard truth about ${cleanTopic}`,
    ],
    Playful: [
      `Plot twist: ${cleanTopic}`,
      `POV: you finally figured out ${cleanTopic}`,
      `Not to brag, but ${cleanTopic}`,
    ],
    Informative: [
      `Three things to know about ${cleanTopic}`,
      `A short breakdown of ${cleanTopic}`,
      `Here's how it works: ${cleanTopic}`,
    ],
  };

  const closers = {
    Friendly: [
      "Save this for later 💾",
      "Tell me if you try it 👇",
      "Hope this helps!",
    ],
    Professional: [
      "Full breakdown in the comments.",
      "Happy to share the workflow.",
      "Curious how your team handles this.",
    ],
    Bold: [
      "Run it. Thank me later.",
      "Your competitors already do this.",
      "No excuses now.",
    ],
    Playful: [
      "You're welcome 😌",
      "Go on, try it 🚀",
      "It's giving efficiency ✨",
    ],
    Informative: [
      "Sources and setup steps below.",
      "Bookmark for your next launch.",
      "Questions? Drop them below.",
    ],
  };

  const toneOpeners = openers[tone as keyof typeof openers] || openers.Friendly;
  const toneClosers = closers[tone as keyof typeof closers] || closers.Friendly;

  const posts: string[] = [];
  for (let i = 0; i < count; i++) {
    const opener = toneOpeners[i % toneOpeners.length];
    const closer = toneClosers[i % toneClosers.length];
    posts.push(
      `${opener}.\n\nGeeLark spins up real cloud Android phones, each with its own device fingerprint, so every account looks and behaves like a separate person. No extra hardware, no juggling SIMs.\n\n${closer}`,
    );
  }

  return posts;
}
