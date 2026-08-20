import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Sparkles, RefreshCw } from "lucide-react";

const TONES = ["Professional", "Playful", "Aesthetic", "Bold", "Minimal", "Funny"] as const;
type Tone = (typeof TONES)[number];

const EMOJI: Record<Tone, string[]> = {
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

export type BioInput = {
  description: string;
  tone: Tone;
};

function buildBios(input: BioInput, seed: number): string[] {
  const desc = input.description.trim() || "creator sharing daily tips";
  const tone = input.tone;
  const e = EMOJI[tone];
  const em = (i: number) => `${pick(e, seed + i)} `;

  const taglines: Record<Tone, string[]> = {
    Professional: ["Helping you grow", "Results that matter", "Let's build together"],
    Playful: ["Good vibes only", "Join the fun", "Stay cozy"],
    Aesthetic: ["Less but better", "Soft days, sharp focus", "Curated for you"],
    Bold: ["No fluff. Just results.", "Built different", "Level up"],
    Minimal: ["Link below", "Stay tuned", "More below"],
    Funny: ["Results may vary", "0% serious", "Professional amateur"],
  };

  const t = taglines[tone];
  return [
    `${em(0)}${desc}\n${em(1)}${pick(t, seed)}`,
    `${em(2)}${desc}\n${em(3)}${pick(t, seed + 1)}`,
    `${em(4)}${desc}\n${em(5)}${pick(t, seed + 2)}`,
    `${em(6)}${desc}\n${em(7)}${pick(t, seed + 3)}`,
    `${em(8)}${desc}\n${em(9)}${pick(t, seed + 4)}`,
    `${em(10)}${desc}\n${em(11)}${pick(t, seed + 5)}`,
  ];
}

export function BioGenerator() {
  const [input, setInput] = useState<BioInput>({
    description: "",
    tone: "Playful",
  });
  const [seed, setSeed] = useState(1);
  const [results, setResults] = useState<string[] | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof BioInput>(key: K, value: BioInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const fetchBios = useCallback(
    async (description: string, tone: Tone, count = 6) => {
      // 前端限流：每小时最多10次
      const RATE_LIMIT = 10;
      const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1小时
      const RATE_KEYS = [
        "bio_generator_rate_limit",
        "bio_generator_rate_limit_backup",
        "_gl_bg_rl",
      ];

      const now = Date.now();
      let rateData = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

      // 从多个存储位置读取，取最大的计数
      let maxCount = 0;
      let latestResetTime = now + RATE_LIMIT_WINDOW;

      for (const key of RATE_KEYS) {
        try {
          const storedLocal = localStorage.getItem(key);
          if (storedLocal) {
            const data = JSON.parse(storedLocal);
            if (now <= data.resetTime && data.count > maxCount) {
              maxCount = data.count;
              latestResetTime = data.resetTime;
            }
          }

          const storedSession = sessionStorage.getItem(key);
          if (storedSession) {
            const data = JSON.parse(storedSession);
            if (now <= data.resetTime && data.count > maxCount) {
              maxCount = data.count;
              latestResetTime = data.resetTime;
            }
          }
        } catch (e) {
          // 读取失败，忽略
        }
      }

      if (maxCount > 0) {
        rateData = { count: maxCount, resetTime: latestResetTime };
      }

      if (rateData.count >= RATE_LIMIT) {
        const remainingMinutes = Math.ceil((rateData.resetTime - now) / 60000);
        alert(`已达到使用限制！每小时最多生成${RATE_LIMIT}次，请${remainingMinutes}分钟后再试。`);
        return;
      }

      // 更新计数到多个存储位置
      rateData.count += 1;
      for (const key of RATE_KEYS) {
        try {
          localStorage.setItem(key, JSON.stringify(rateData));
          sessionStorage.setItem(key, JSON.stringify(rateData));
        } catch (e) {
          // 写入失败，忽略
        }
      }

      // 还可以尝试写入 cookie（1小时过期）
      try {
        document.cookie = `${RATE_KEYS[0]}=${encodeURIComponent(JSON.stringify(rateData))}; max-age=${RATE_LIMIT_WINDOW / 1000}; path=/`;
      } catch (e) {
        // cookie 写入失败，忽略
      }

      setLoading(true);
      try {
        // 判断是否在本地开发（localhost）
        const isLocalhost =
          window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

        if (isLocalhost) {
          console.log("📍 本地开发：直接调用 DeepSeek API");

          const apiKey = import.meta.env["VITE_DEEPSEEK_API_KEY"];
          if (!apiKey) {
            console.log("No API key found, using template bios");
            setLoading(false);
            return;
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
                  content: `You are a professional Instagram bio generator. Generate ${count} high-quality Instagram bios.

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
                },
                {
                  role: "user",
                  content: `Generate ${count} ${tone} Instagram bios based on this description: "${description}". Separate each bio with exactly "---BIO_SEPARATOR---".`,
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
          let bios = aiContent
            .split("---BIO_SEPARATOR---")
            .map((p: string) => p.trim())
            .filter((p: string) => p.length > 0)
            .slice(0, count);

          console.log("Parsed bios:", bios);

          // 如果分割失败，尝试用双换行分割
          if (bios.length === 0) {
            bios = aiContent
              .split("\n\n")
              .map((p: string) => p.trim())
              .filter((p: string) => p.length > 0)
              .slice(0, count);
          }

          // 如果还是没有帖子，使用模板
          if (bios.length === 0) {
            console.log("No valid bios from AI, using templates");
            return;
          }

          // 如果帖子不够，用模板补充
          while (bios.length < count) {
            const templateBios = buildBios({ description, tone }, seed);
            bios = bios.concat(templateBios.slice(0, count - bios.length));
          }

          setResults(bios.slice(0, count));
        } else {
          console.log("🚀 Vercel 环境：调用 Edge Function");

          // Vercel 部署：调用 Edge Function
          const response = await fetch("/api/generate-bio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              description,
              tone,
              count,
            }),
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const data = await response.json();
          console.log("API 响应收到：", data);

          setResults(data.bios || buildBios({ description, tone }, seed));
        }
      } catch (error) {
        console.error("生成 bio 时出错：", error);
        // 错误时使用模板
        setResults(buildBios({ description, tone }, seed));
      } finally {
        setLoading(false);
      }
    },
    [seed],
  );

  const generate = (nextSeed = seed) => {
    setSeed(nextSeed);
    fetchBios(input.description, input.tone, 6).catch(() => {
      // 如果 API 调用失败，使用模板
      setResults(buildBios(input, nextSeed));
    });
  };

  const copy = async (text: string, i: number) => {
    await navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6">
      <div className="rounded-xl border border-border p-6 shadow-soft sm:p-8">
        <form
          className="grid gap-5"
          onSubmit={(ev) => {
            ev.preventDefault();
            if (!input.description.trim()) return;
            generate(seed + 1);
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="description">Describe yourself</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Mia Reyes — pilates coach helping busy moms with mobility and 10-minute workouts"
              value={input.description}
              onChange={(ev) => set("description", ev.target.value)}
            />
          </div>

          <div className="grid gap-3">
            <Label>Tone</Label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => set("tone", tone)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    input.tone === tone
                      ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border bg-background text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!input.description.trim() || loading}
            className={`w-full justify-center gap-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              input.description.trim()
                ? "bg-[#3B82F6] hover:bg-[#2563EB]"
                : "bg-[#93C5FD] hover:bg-[#93C5FD]/90"
            }`}
          >
            {loading ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {loading ? "Creating bios..." : "Create me a bio"}
          </Button>
        </form>
      </div>

      <div className="grid content-start gap-4">
        {results !== null && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{results.length} bios ready to copy</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generate(seed + 1)}
                disabled={loading}
              >
                <RefreshCw /> Regenerate
              </Button>
            </div>
            {results.map((bio, i) => {
              const length = bio.replace(/\n/g, "").length;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-border p-5 shadow-soft transition-shadow hover:shadow-lift"
                >
                  <p className="whitespace-pre-line text-[15px] leading-relaxed">{bio}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`text-xs ${
                        length > 150 ? "text-destructive" : "text-muted-foreground"
                      }`}
                    >
                      {length}/150 characters
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => copy(bio, i)}>
                      {copied === i ? <Check /> : <Copy />}
                      {copied === i ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
