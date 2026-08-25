import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useIframeHeight } from "@/hooks/use-iframe-height";
import { Sparkles, Copy, Check, RefreshCw, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { generateBios } from "@/lib/instagram-bio.functions";
import { SeoArticle } from "@/components/instagram-bio/seo-article";
import { MoreTools } from "@/components/instagram-bio/more-tools";
import { copyToClipboard } from "@/lib/utils";

const TITLE = "Free Instagram Bio Generator | GeeLark";
const DESCRIPTION =
  "Generate Instagram-ready bios in seconds. Describe yourself, pick a style, get multiple bio options, then publish from real GeeLark cloud phones.";

export const Route = createFileRoute("/instagram-bio")({
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
              name: "How does the Instagram bio generator work?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Add a description of yourself or your account, pick a tone, and our generator will create multiple Instagram bio options optimized for the 150-character limit.",
              },
            },
            {
              "@type": "Question",
              name: "What tones are available for Instagram bios?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Choose from professional, playful, aesthetic, bold, minimal, or funny tones to match your account's personality and brand voice.",
              },
            },
            {
              "@type": "Question",
              name: "How many characters can an Instagram bio be?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Instagram bios are limited to 150 characters. Our generator ensures every option stays within this limit while still being engaging and informative.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: InstagramBioPage,
});

function InstagramBioPage() {
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState("Playful");
  const [results, setResults] = useState<string[] | null>(null);
  const [isTemplate, setIsTemplate] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fn = useServerFn(generateBios);
  const mutation = useMutation({
    mutationFn: (vars: { description: string; tone: string }) => fn({ data: vars }),
    onSuccess: (data) => {
      setResults(data.bios);
      setIsTemplate(data.isTemplate || false);
    },
  });

  const TONES = ["Professional", "Playful", "Aesthetic", "Bold", "Minimal", "Funny"];

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
    const value = description.trim();
    if (!value) return;
    setCopied(null);
    mutation.mutate({ description: value, tone: tone });
  }

  async function copy(text: string, index: number) {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(index);
      window.setTimeout(() => setCopied(null), 1600);
    }
  }

  return (
    <div className="min-h-screen bg-white text-foreground">
      <main>
        <section id="generator">
          <div>
            <div className="mx-auto max-w-5xl rounded-[var(--radius-2xl)] border border-border bg-card p-2 shadow-[var(--shadow-lift)]">
              <div className="rounded-[var(--radius-xl)] bg-card p-4 md:p-5">
                <h3 className="text-center text-[20px] font-medium">
                  Describe yourself or your account
                </h3>
                <div className="mt-3">
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us about yourself, what you do, who you help, or what your account is about"
                    className="min-h-32 resize-none border-0 bg-muted/60 text-[16px] focus-visible:ring-1"
                  />
                </div>

                <div className="mt-4">
                  <div className="text-[14px] font-medium text-foreground">Choose a tone</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {TONES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTone(t)}
                        className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
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

                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={run}
                    disabled={!description.trim() || mutation.isPending}
                    className="rounded-lg px-6"
                  >
                    {mutation.isPending ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    {mutation.isPending ? "Generating bios…" : "Create me a bio"}
                  </Button>
                </div>

                {mutation.isError && (
                  <p className="mt-3 text-center text-sm text-destructive">
                    {(mutation.error as Error).message}
                  </p>
                )}

                <p className="mt-3 text-center text-[16px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Pro tip:</span>
                  The more specific you are, the more tailored your bio options will be.
                </p>
              </div>
            </div>

            {mutation.data && !mutation.isPending && (
              <div className="mx-auto mt-14 max-w-5xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold">Your bio options</h2>
                    {isTemplate ? (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        📋 Template fallback
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        ✨ AI generated
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => mutation.mutate({ description, tone })}
                    disabled={mutation.isPending}
                    className="rounded-full"
                  >
                    <RefreshCw className={`size-4 ${mutation.isPending ? "animate-spin" : ""}`} />
                    Regenerate
                  </Button>
                </div>

                <div className="mt-5 grid gap-5">
                  {mutation.data.bios.map((bio, i) => {
                    const length = bio.replace(/\n/g, "").length;
                    return (
                      <article
                        key={i}
                        className="rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copy(bio, i)}
                            className="rounded-full"
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
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
