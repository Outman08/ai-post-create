import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Sparkles, Copy, Check, RefreshCw, Hash, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { flatten } from "@/components/instagram-hashtag/generator";
import { generateInstagramHashtags } from "@/lib/hashtag-instagram.functions";
import { SeoArticle } from "@/components/instagram-hashtag/seo-article";
import { MoreTools } from "@/components/instagram-hashtag/more-tools";

const TITLE = "Free Instagram Hashtag Generator | GeeLark";
const DESCRIPTION =
  "Generate relevant Instagram hashtags in seconds. Describe your post, get a curated hashtag set, then publish from real GeeLark cloud phones.";

export const Route = createFileRoute("/instagram-hashtag")({
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
              name: "How does the Instagram hashtag generator work?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Add a topic, describe your post, or paste in a ready-to-go post and our Instagram hashtag generator will create a curated list of relevant hashtags optimised for reach and engagement, based on the focus of your post.",
              },
            },
            {
              "@type": "Question",
              name: "Are these hashtags based on real posting trends?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Hashtags are built from common Instagram usage patterns rather than live Instagram data. They're designed to suggest relevant, high-performing tags across popular and niche content. For even better results, review the list and combine it with any specific hashtags you know perform well in your space.",
              },
            },
            {
              "@type": "Question",
              name: "How many hashtags should I use on a post?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Mix a handful of niche tags with a few broader ones instead of maxing out the limit. Our sets are grouped so you can pull a balanced selection from each category.",
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

  const fn = useServerFn(generateInstagramHashtags);
  const mutation = useMutation({
    mutationFn: (vars: { topic: string }) => fn({ data: vars }),
  });

  const groups = mutation.data?.groups ?? [];

  // Send scroll height to parent window
  useEffect(() => {
    const sendHeight = () => {
      window.parent.postMessage(
        {
          type: "setIframeHeight",
          height: document.body.scrollHeight,
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
    console.log("run 函数被调用");
    const value = topic.trim();
    console.log("输入值:", value);
    if (!value) return;
    setCopied(null);
    console.log("调用 mutation.mutate");
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
        <section id="generator">
          <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 md:pt-24">
            <div className="mx-auto max-w-4xl text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                ← Back to tools
              </Link>
              <h1 className="text-[56px] font-medium leading-[1.05] text-foreground">
                Instagram hashtag generator
              </h1>
            </div>

            <div className="mx-auto mt-10 max-w-5xl rounded-[var(--radius-2xl)] border border-border bg-card p-2 shadow-[var(--shadow-lift)]">
              <div className="rounded-[var(--radius-xl)] bg-card p-4 md:p-5">
                <h3 className="text-center text-[20px] font-medium">
                  What's your Instagram post about?
                </h3>
                <div className="relative mt-3">
                  <Textarea
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Tell us what your post is about, a general topic, or paste the full post here"
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

                {mutation.isError && (
                  <p className="mt-3 text-center text-sm text-destructive">
                    {(mutation.error as Error).message}
                  </p>
                )}

                <p className="mt-3 text-center text-[16px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Pro tip:</span> The more detail
                  you provide about your post, the more relevant your hashtag recommendations will
                  be.
                </p>
              </div>
            </div>

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

        <section id="how">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="max-w-xl">
              <h2 className="text-[32px] font-medium">From hashtags to published</h2>
            </div>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Describe your post",
                  body: "Tell us what your post is about, a general topic, or paste the full post below.",
                },
                {
                  n: "02",
                  title: "Generate",
                  body: "With one click, generate engaging, Instagram-ready hashtag suggestions for your content.",
                },
                {
                  n: "03",
                  title: "Publish",
                  body: "Post from real GeeLark cloud phones — every account on its own Android device.",
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

        <section id="faq">
          <div className="mx-auto max-w-3xl px-5 py-20">
            <h2 className="text-3xl font-medium md:text-4xl">Frequently asked questions</h2>
            <Accordion type="single" collapsible className="mt-8">
              {[
                {
                  q: "How does the Instagram hashtag generator work?",
                  a: "Add a topic, describe your post, or paste in a ready-to-go post and our Instagram hashtag generator will create a curated list of relevant hashtags optimised for reach and engagement, based on the focus of your post.",
                },
                {
                  q: "Are these hashtags based on real posting trends?",
                  a: "Hashtags are built from common Instagram usage patterns rather than live Instagram data. They're designed to suggest relevant, high-performing tags across popular and niche content. For even better results, review the list and combine it with any specific hashtags you know perform well in your space.",
                },
                {
                  q: "How many hashtags should I use on a post?",
                  a: "Mix a handful of niche tags with a few broader ones instead of maxing out the limit. Our sets are grouped so you can pull a balanced selection from each category.",
                },
                {
                  q: "Can I rely solely on this tool for my hashtag strategy?",
                  a: "This tool is a great way to speed up and simplify your hashtag ideation. For the best results, use it alongside your own research or analytics, especially if you track which hashtags perform best in your existing campaigns.",
                },
                {
                  q: "Is the hashtag generator free?",
                  a: "Yes. Generating hashtags is free and needs no account. You only sign up when you want to publish from GeeLark cloud phones.",
                },
                {
                  q: "Where should I put my hashtags — caption or first comment?",
                  a: "Both work the same way for reach, so pick whichever keeps your caption readable. If the tags would clutter your hook, post them in a comment immediately after publishing.",
                },
                {
                  q: "How many hashtags does Instagram allow?",
                  a: "Up to 30 per post, plus 30 more in a comment. That's a ceiling, not a recommendation — most accounts do better with a smaller, tightly relevant set.",
                },
                {
                  q: "Do hashtags still work on Instagram?",
                  a: "They still help Instagram categorise your post and make it findable in search, but they're one signal among many now. Pair them with keyword-rich captions and a consistent niche.",
                },
                {
                  q: "Can I use the same hashtag set on every post?",
                  a: "It's better to rotate. Tailor each set to what's actually in the post, and avoid pasting one identical block across every upload or every account you manage.",
                },
                {
                  q: "Can I use this for multiple Instagram accounts?",
                  a: "Yes. Generate a different set per account so each one keeps its own niche angle, then publish from the GeeLark cloud phone assigned to that account.",
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

        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="overflow-hidden rounded-[var(--radius-3xl)] border border-border bg-[image:var(--gradient-primary)] px-8 py-14 text-center shadow-[var(--shadow-lift)]">
            <h2 className="text-3xl font-medium text-primary-foreground md:text-4xl">
              Grow your Instagram presence with confidence
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-primary-foreground/85">
              Spin up your first GeeLark cloud phone in under a minute and publish your next post
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
