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
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <section id="generator">
          <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 md:pt-24">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-[56px] font-medium leading-[1.05] text-foreground">
                Instagram bio generator
              </h1>
            </div>

            <div className="mx-auto mt-10 max-w-5xl rounded-[var(--radius-2xl)] border border-border bg-card p-2 shadow-[var(--shadow-lift)]">
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

        <section id="how">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="max-w-xl">
              <h2 className="text-[32px] font-medium">From bio to published</h2>
            </div>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Describe yourself",
                  body: "Tell us about yourself, your account, or what you do.",
                },
                {
                  n: "02",
                  title: "Generate",
                  body: "With one click, generate multiple Instagram bio options in your chosen tone.",
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
                  q: "How does the Instagram bio generator work?",
                  a: "Add a description of yourself or your account, pick a tone, and our generator will create multiple Instagram bio options optimized for the 150-character limit.",
                },
                {
                  q: "What tones are available for Instagram bios?",
                  a: "Choose from professional, playful, aesthetic, bold, minimal, or funny tones to match your account's personality and brand voice.",
                },
                {
                  q: "How many characters can an Instagram bio be?",
                  a: "Instagram bios are limited to 150 characters. Our generator ensures every option stays within this limit while still being engaging and informative.",
                },
                {
                  q: "Is the Instagram bio generator free?",
                  a: "Yes. Generating Instagram bios is free and needs no account. You only sign up when you want to publish from GeeLark cloud phones.",
                },
                {
                  q: "Can I use these bios for multiple Instagram accounts?",
                  a: "Yes. Generate different bios per account to match each one's unique niche and voice, then publish from the GeeLark cloud phone assigned to that account.",
                },
                {
                  q: "What should I include in my Instagram bio?",
                  a: "A strong Instagram bio usually includes who you are, what you do, why someone should follow you, and a clear call to action — all within the 150-character limit.",
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
