import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Sparkles, Copy, Check, RefreshCw, Hash, ArrowUpRight, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { flatten } from "@/components/tiktok-hashtag/generator";
import { generateTikTokHashtags } from "@/lib/hashtag-tiktok.functions";
import { SeoArticle } from "@/components/tiktok-hashtag/seo-article";
import { MoreTools } from "@/components/tiktok-hashtag/more-tools";

const TITLE = "Free TikTok Hashtag Generator | GeeLark";
const DESCRIPTION =
  "Generate TikTok hashtags in seconds. Describe your video, get a curated hashtag set built for the For You Page, then publish from real GeeLark cloud phones.";

export const Route = createFileRoute("/tiktok-hashtag")({
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
          mainEntity: [
            {
              "@type": "Question",
              name: "Do hashtags still work on TikTok?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Hashtags are a key way TikTok surfaces content to viewers. They help with discovery, increase your chances of appearing on the For You Page, and signal your content's topic to the algorithm.",
              },
            },
            {
              "@type": "Question",
              name: "How many hashtags should I use on TikTok?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Most creators use 3–5 hashtags per post. It's better to choose targeted, relevant hashtags than to overload your caption with generic or unrelated ones.",
              },
            },
            {
              "@type": "Question",
              name: "Are these hashtags based on real posting trends?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Hashtags are built from common TikTok usage patterns rather than live TikTok data. They're designed to suggest relevant, high-performing tags across popular and niche content. For even better results, review the list and combine it with any specific hashtags you know perform well in your space.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: HashtagGeneratorPage,
});

function HashtagGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const fn = useServerFn(generateTikTokHashtags);
  const mutation = useMutation({
    mutationFn: (vars: { topic: string }) => fn({ data: vars }),
  });

  const groups = mutation.data?.groups ?? [];

  // Send scroll height to parent window
  useEffect(() => {
    const sendHeight = () => {
      const height = document.body.scrollHeight;
      window.parent.postMessage(
        {
          type: "setIframeHeight",
          height: height,
        },
        "*",
      );
      window.parent.postMessage(
        {
          type: "iframe-height",
          height: height,
        },
        "*",
      );
    };

    sendHeight();
    const resizeObserver = new ResizeObserver(sendHeight);
    resizeObserver.observe(document.body);

    const mutationObserver = new MutationObserver(sendHeight);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    window.addEventListener("resize", sendHeight);
    return () => {
      window.removeEventListener("resize", sendHeight);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [groups.length, mutation.isPending]);

  // Handle link clicks in iframe
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (link && !link.href.startsWith("#") && link.target !== "_blank") {
        e.preventDefault();
        window.parent.location.href = link.href;
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  function run() {
    const value = topic.trim();
    if (!value) return;
    setCopied(null);
    mutation.mutate({ topic: value });
  }

  async function copy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        {/* Hero + generator */}
        <section id="generator">
          <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 md:pt-24">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-[56px] font-medium leading-[1.05] text-foreground">
                TikTok hashtag generator
              </h1>
            </div>

            {/* Composer */}
            <div className="mx-auto mt-10 max-w-5xl rounded-[var(--radius-2xl)] border border-border bg-card p-2 shadow-[var(--shadow-lift)]">
              <div className="rounded-[var(--radius-xl)] bg-card p-4 md:p-5">
                <h2 className="text-center text-[20px] font-medium">
                  What's your TikTok video about?
                </h2>
                <div className="relative mt-3">
                  <Textarea
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Tell us what your video is about, a general topic, or paste your full caption here"
                    className="min-h-48 resize-none border-0 bg-muted/60 pb-14 text-[16px] focus-visible:ring-1"
                  />
                  <div className="absolute bottom-3 right-3">
                    <Button
                      onClick={run}
                      disabled={!topic.trim() || mutation.isPending}
                      className="rounded-lg px-6"
                    >
                      {mutation.isPending ? (
                        <RefreshCw className="size-4 animate-spin" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                      {mutation.isPending ? "Generating…" : "Generate hashtags"}
                    </Button>
                  </div>
                </div>

                <p className="mt-3 text-center text-[16px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Pro tip:</span> The more detail
                  you provide about your video, the more relevant your hashtag recommendations will
                  be.
                </p>
              </div>
            </div>

            {/* Results */}
            {mutation.data && !mutation.isPending && (
              <div className="mx-auto mt-14 max-w-5xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">Your hashtag set</h2>
                    {mutation.data.isAI ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        ✨ AI generated
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        📋 Template fallback
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => mutation.mutate({ topic: topic.trim() })}
                      className="rounded-full"
                    >
                      <RefreshCw className="size-4" />
                      Regenerate
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-full"
                      onClick={() => copy(flatten(groups), "all")}
                    >
                      {copied === "all" ? (
                        <Check className="size-4" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                      {copied === "all" ? "Copied" : "Copy all"}
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  {groups.map((group) => (
                    <article
                      key={group.label}
                      className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-[18px] font-semibold">{group.label}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{group.hint}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 shrink-0 rounded-full px-3"
                          onClick={() =>
                            copy(group.tags.map((t) => `#${t}`).join(" "), group.label)
                          }
                        >
                          {copied === group.label ? (
                            <Check className="size-4" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </Button>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {group.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-sm text-foreground"
                          >
                            <Hash className="size-3.5 text-primary" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* How it works */}
        <section id="how">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="max-w-xl">
              <h2 className="text-[32px] font-medium">From hashtags to published</h2>
            </div>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Describe your video",
                  body: "Tell us what your video is about.",
                },
                {
                  n: "02",
                  title: "Generate",
                  body: "With one click, generate engaging, TikTok-ready hashtag suggestions for your content.",
                },
                {
                  n: "03",
                  title: "Publish",
                  body: "Post from real GeeLark cloud phones — every TikTok account on its own Android device.",
                },
              ].map((s) => (
                <li
                  key={s.n}
                  className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
                >
                  <span className="font-display text-sm font-bold text-primary">{s.n}</span>
                  <h3 className="mt-3 text-[22px] font-semibold">{s.title}</h3>
                  <p className="mt-2 text-[16px] text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <SeoArticle />

        {/* FAQ */}
        <section id="faq">
          <div className="mx-auto max-w-3xl px-5 py-20">
            <h2 className="text-3xl font-medium md:text-4xl">Frequently asked questions</h2>
            <Accordion type="single" collapsible className="mt-8">
              {[
                {
                  q: "Do hashtags still work on TikTok?",
                  a: "Yes. Hashtags are a key way TikTok surfaces content to viewers. They help with discovery, increase your chances of appearing on the For You Page, and signal your content's topic to the algorithm.",
                },
                {
                  q: "How many hashtags should I use on TikTok?",
                  a: "Most creators use 3–5 hashtags per post. It's better to choose targeted, relevant hashtags than to overload your caption with generic or unrelated ones.",
                },
                {
                  q: "Are these hashtags based on real posting trends?",
                  a: "Hashtags are built from common TikTok usage patterns rather than live TikTok data. They're designed to suggest relevant, high-performing tags across popular and niche content. For even better results, review the list and combine it with any specific hashtags you know perform well in your space.",
                },
                {
                  q: "Is this really free?",
                  a: "Yes, 100%. No sign-up and no catch. You only create a GeeLark account when you want to publish from cloud phones.",
                },
                {
                  q: "Can I use this for TikTok business accounts?",
                  a: "Absolutely. Whether you're a creator, brand, or small business, this tool is designed to help you grow on TikTok with better hashtags.",
                },
                {
                  q: "Where should I put hashtags — caption or comments?",
                  a: "Put them in the caption. TikTok reads the caption when classifying your video, and hashtags added later in a comment carry far less weight for discovery.",
                },
                {
                  q: "Should I use trending hashtags that aren't related to my video?",
                  a: "No. Irrelevant trending tags attract viewers who swipe away quickly, which sends a negative signal. Only use a trend when your video genuinely fits it.",
                },
                {
                  q: "How do I know if my hashtags are working?",
                  a: "Check the analytics for each video: traffic sources, search queries, and average watch time. Change one part of your hashtag set at a time so you can attribute the difference.",
                },
                {
                  q: "Can I reuse the same hashtag set on every video?",
                  a: "Keep two or three evergreen tags for your niche, but swap the rest to match each video's specific topic. Identical blocks on every upload make your content harder to differentiate.",
                },
                {
                  q: "Do hashtags help older videos get more views?",
                  a: "They can. TikTok resurfaces older videos through search and topic feeds, so accurate hashtags plus a keyword-rich caption keep a video discoverable long after it's posted.",
                },
              ].map((item) => (
                <AccordionItem key={item.q} value={item.q}>
                  <AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-[16px] text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <MoreTools />

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="overflow-hidden rounded-[var(--radius-3xl)] border border-border bg-[image:var(--gradient-primary)] px-8 py-14 text-center shadow-[var(--shadow-lift)]">
            <h2 className="text-3xl font-medium text-primary-foreground md:text-4xl">
              Grow your social presence with confidence
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-primary-foreground/85">
              Spin up your first GeeLark cloud phone in under a minute and publish your next TikTok
              today.
            </p>
            <Button variant="secondary" className="mt-7 rounded-lg px-7 text-[16px]">
              Start free
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
