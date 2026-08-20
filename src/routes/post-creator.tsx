import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Heart,
  MessageCircle,
  Repeat2,
  Smartphone,
  ChevronRight,
  ArrowUpRight,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  PLATFORMS,
  TONES,
  generatePosts,
  type Platform,
  type Tone,
} from "@/components/post-creator/generator";

const TITLE = "Free AI Social Media Post Creator | GeeLark";
const DESCRIPTION =
  "Generate scroll-stopping posts for TikTok, Instagram, X, LinkedIn and Facebook in seconds — then publish them from real cloud phones with GeeLark.";

const FAQ_DATA = [
  {
    q: "Is the post creator free?",
    a: "Yes. Generating drafts is free and needs no account. You only sign up when you want to publish from GeeLark cloud phones.",
  },
  {
    q: "Which platforms are supported?",
    a: "Drafts are tuned for TikTok, Instagram, X, LinkedIn, Facebook and all other social platforms.",
  },
  {
    q: "Will the posts sound generic?",
    a: "The more specific your prompt — product, audience, angle — the sharper the drafts. Treat them as a strong first pass and add your own voice.",
  },
  {
    q: "How does GeeLark keep accounts safe?",
    a: "Every profile runs on its own cloud Android phone with an isolated device fingerprint, so activity never overlaps between accounts.",
  },
  {
    q: "Do I need to sign up to use the post creator?",
    a: "No. You can generate as many drafts as you like without creating an account. Signup is only needed when you want to publish from GeeLark cloud phones.",
  },
  {
    q: "Can I use the generated posts for commercial accounts?",
    a: "Yes. The drafts are yours to use, edit, and publish however you want. We recommend reviewing them for brand voice and accuracy before posting.",
  },
  {
    q: "What makes GeeLark different from other social media tools?",
    a: "Most tools help you write or schedule. GeeLark also provides a real cloud Android phone for each account, so platforms see each profile as a separate, legitimate user.",
  },
  {
    q: "How do I publish posts from a cloud phone?",
    a: "After you create a GeeLark account, you can spin up cloud Android phones, install the apps you need, and log into each account on its own device. Then you post just like you would on a normal phone.",
  },
  {
    q: "Is there a limit on how many posts I can generate?",
    a: "There is no hard limit in the free creator. Generate, refine, and copy as many drafts as you need.",
  },
];

export const Route = createFileRoute("/post-creator")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_DATA.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.a,
            },
          })),
        }),
      },
    ],
  }),
  component: PostCreatorPage,
});

function PostCreatorPage() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>(PLATFORMS[0] as Platform);
  const [tone, setTone] = useState<Tone>("Friendly");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [posts, setPosts] = useState<string[]>([]);
  const [regenerateKey, setRegenerateKey] = useState(0);

  const fetchPosts = useCallback(
    async (currentTopic: string, currentPlatform: Platform, currentTone: Tone) => {
      // 前端限流：每小时最多10次
      const RATE_LIMIT = 10;
      const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1小时
      const RATE_KEYS = [
        "post_generator_rate_limit",
        "post_generator_rate_limit_backup",
        "_gl_pg_rl",
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
        const generatedPosts = await generatePosts(currentTopic, currentPlatform, currentTone);
        setPosts(generatedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  function run(next?: string) {
    const value = (next ?? topic).trim();
    if (!value) return;
    setTopic(value);
    setCopied(null);
    setSubmitted(value);
  }

  function regenerate() {
    if (!submitted) return;
    setRegenerateKey((k) => k + 1);
    fetchPosts(submitted, platform, tone);
  }

  useEffect(() => {
    if (submitted) {
      fetchPosts(submitted, platform, tone);
    }
  }, [submitted, platform, tone, fetchPosts]);

  async function copy(text: string, index: number) {
    await navigator.clipboard.writeText(text);
    setCopied(index);
    window.setTimeout(() => setCopied(null), 1600);
  }
  // 发送页面高度给父窗口
  useEffect(() => {
    document.documentElement.style.overflowY = "visible";
    document.body.style.overflowY = "visible";

    function sendHeight() {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage(
        {
          type: "setIframeHeight",
          height: height,
        },
        "*",
      );
    }

    // 页面加载、窗口resize、dom变化都上报高度
    window.addEventListener("load", sendHeight);
    window.addEventListener("resize", sendHeight);
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);

    return () => {
      window.removeEventListener("load", sendHeight);
      window.removeEventListener("resize", sendHeight);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="bg-white text-foreground">
      <main>
        {/* Hero + creator */}
        <section id="creator" className="">
          <div className="mx-auto max-w-6xl px-5 pb-20 pt-5">
            {/* <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-[56px] font-medium leading-[1.05] text-foreground md:text-[56px]">
                AI post creator
              </h1>
            </div> */}

            {/* Composer */}
            <div className="mx-auto mt-10 max-w-5xl rounded-[var(--radius-2xl)] border border-border bg-card p-2 shadow-[var(--shadow-lift)]">
              <div className="rounded-[var(--radius-xl)] bg-card p-4 md:p-5">
                <h3 className="text-center text-[20px] font-medium">What is your post about?</h3>
                <div className="relative mt-3">
                  <Textarea
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. launching our new multi-account cloud phone plan for TikTok sellers"
                    className="min-h-32 resize-none border-0 bg-muted/60 text-[16px] focus-visible:ring-1"
                  />
                </div>

                <div className="mt-4">
                  <div className="text-[14px] font-medium text-foreground">Platform</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlatform(p)}
                        className={`rounded-full px-4 py-2 text-[14px] transition-colors ${
                          platform.id === p.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-[14px] font-medium text-foreground">Tone</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {TONES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTone(t)}
                        className={`rounded-full px-4 py-2 text-[14px] transition-colors ${
                          tone === t
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex">
                  <Button
                    onClick={() => run()}
                    disabled={!topic.trim() || loading}
                    className="w-full rounded-[8px] px-6 text-[16px]"
                  >
                    {loading ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    {loading ? "Writing…" : "Generate post"}
                  </Button>
                </div>

                <p className="mt-3 text-center text-[16px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Pro tip:</span> Include the
                  platform, key points, your target audience and your desired outcome for this post.
                </p>
              </div>
            </div>

            {/* Results */}
            {submitted ? (
              <div className="mx-auto mt-14 max-w-5xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">3 drafts for {platform.name}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={regenerate}
                    disabled={loading}
                    className="rounded-full"
                  >
                    <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                    Regenerate
                  </Button>
                </div>

                {loading ? (
                  <div className="mt-5 grid gap-5 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <article
                        key={i}
                        className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-gray-200 animate-pulse" />
                          <div className="space-y-2">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                          <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
                          <div className="h-3 w-4/6 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 grid gap-5 md:grid-cols-3">
                    {posts.map((post, i) => (
                      <article
                        key={`${i}-${regenerateKey}`}
                        className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-[image:var(--gradient-primary)]" />
                          <div className="leading-tight">
                            <p className="text-sm font-semibold">GeeLark</p>
                            <p className="text-xs text-muted-foreground">{platform.handleLabel}</p>
                          </div>
                        </div>
                        <p className="mt-4 flex-1 whitespace-pre-line text-sm leading-relaxed">
                          {post}
                        </p>
                        <div className="mt-auto flex items-center gap-5 border-t border-border pt-3 pb-1 text-muted-foreground">
                          <span className="flex items-center gap-1.5 text-xs">
                            <Heart className="size-4" /> 128
                          </span>
                          <span className="flex items-center gap-1.5 text-xs">
                            <MessageCircle className="size-4" /> 24
                          </span>
                          <span className="flex items-center gap-1.5 text-xs">
                            <Repeat2 className="size-4" /> 9
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-8 rounded-full px-3"
                            onClick={() => copy(post, i)}
                          >
                            {copied === i ? (
                              <Check className="size-4" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                            {copied === i ? "Copied" : "Copy"}
                          </Button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
