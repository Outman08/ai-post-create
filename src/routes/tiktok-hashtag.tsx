import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useIframeHeight } from "@/hooks/use-iframe-height";
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Hash,
  ArrowUpRight,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { copyToClipboard } from "@/lib/utils";

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fn = useServerFn(generateTikTokHashtags);
  const mutation = useMutation({
    mutationFn: (vars: { topic: string }) => fn({ data: vars }),
    onSuccess: () => setErrorMsg(null),
    onError: (err) =>
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again."),
  });

  const groups = mutation.data?.groups ?? [];

  useIframeHeight();

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
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1600);
    }
  }

  return (
    <div className="bg-white text-foreground" style={{ paddingBottom: "40px" }}>
      <main>
        {/* Hero + generator */}
        <section id="generator">
          <div className="mx-auto max-w-6xl ">
            <div className="mx-auto max-w-4xl text-center"></div>

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
                    maxLength={500}
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
                  {errorMsg && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Usage limit reached</AlertTitle>
                      <AlertDescription>{errorMsg}</AlertDescription>
                    </Alert>
                  )}
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
      </main>
    </div>
  );
}
