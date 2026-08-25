import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useIframeHeight } from "@/hooks/use-iframe-height";
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
import { copyToClipboard } from "@/lib/utils";

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
    console.log("run 函数被调用");
    const value = topic.trim();
    console.log("输入值:", value);
    if (!value) return;
    setCopied(null);
    console.log("调用 mutation.mutate");
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
    <div className="min-h-screen bg-white text-foreground">
      <main>
        <section id="generator">
          <div>
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
      </main>
    </div>
  );
}
