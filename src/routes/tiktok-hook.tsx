import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useIframeHeight } from "@/hooks/use-iframe-height";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Copy,
  Smartphone,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { generateHooks, type GeneratedHook } from "@/lib/hooks.functions";
import { ERROR_CODE, isErrorCode, stripErrorCode } from "@/lib/error";
import { cn, copyToClipboard } from "@/lib/utils";

export const Route = createFileRoute("/tiktok-hook")({
  head: () => ({
    meta: [
      { title: "TikTok video hook generator — Free AI hook ideas | GeeLark" },
      {
        name: "description",
        content:
          "Generate scroll-stopping TikTok hooks in seconds. Pick a framework, describe your video, and get opening lines built to win the first 3 seconds.",
      },
      { property: "og:title", content: "TikTok video hook generator | GeeLark" },
      {
        property: "og:description",
        content:
          "Free AI tool that turns your video topic into TikTok hooks proven to stop the scroll and lift watch time.",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
    ],
  }),
  component: HookGeneratorPage,
});

const HOOK_STYLES = [
  "Curiosity Gap 🤔",
  "Controversial Take 🔥",
  "Story Hook 📖",
  "Shocking Fact 😱",
  "Relatable Pain Point 😩",
  "Engaging Question ❓",
  "List Teaser 📝",
  "Secret Reveal 🤫",
  "Before/After 🔄",
];

const TONES = ["Educational", "Funny", "Emotional", "Bold", "Casual"];

const STEPS = [
  {
    n: "01",
    title: "Describe the video",
    body: "Give the AI your topic in a sentence or two. Be specific about the audience and the outcome.",
  },
  {
    n: "02",
    title: "Pick a framework",
    body: "Choose the psychological angle that fits your storyline, then generate a batch of openers.",
  },
  {
    n: "03",
    title: "Post from a cloud phone",
    body: "Test your favourite hooks across accounts, each posting from its own Android cloud phone.",
  },
];

const FAQS = [
  {
    q: "What makes a good TikTok hook?",
    a: "A great hook does three things at once: it interrupts the scroll, promises a payoff, and matches the tone of the feed. Keep it under fifteen words, make it specific, and deliver on the promise in the rest of the video.",
  },
  {
    q: "Why do the first 3 seconds matter so much?",
    a: "TikTok's algorithm is retention-first. It measures how fast viewers swipe away, how long they watch, and whether they rewatch. If people leave in under two seconds, distribution on the For You Page slows down.",
  },
  {
    q: "Is the hook generator free?",
    a: "Yes. Describe your video, pick a framework, and generate as many hooks as you need. No sign-up wall and no credit card.",
  },
  {
    q: "How do I test hooks properly?",
    a: "Pick two or three favourites and run them across different videos with the same content. Layer the hook as a text overlay and say it out loud in the first second, then compare retention.",
  },
  {
    q: "How does GeeLark help after the hook?",
    a: "GeeLark runs each TikTok account on its own Android cloud phone with a unique device fingerprint and proxy, so you can test hooks at scale across many accounts without triggering association risks.",
  },
  {
    q: "Can I use the generated hooks for other short-form platforms?",
    a: "Absolutely. The hooks work for TikTok, Reels, Shorts, and any vertical video format where the first three seconds decide whether the viewer stays.",
  },
  {
    q: "How many hooks should I generate per video?",
    a: "Generate multiple options, then pick the one that sounds most natural in your voice. The best hook is the one you can deliver confidently on camera.",
  },
  {
    q: "What if the hook doesn't match my niche?",
    a: "Add a specific detail about your niche, audience, or product in the topic field. The more context you give, the more tailored the hook ideas become.",
  },
  {
    q: "Should I read the hook out loud or show it as text?",
    a: "Both. Say the hook in the first second and reinforce it with a short text overlay. This covers viewers who scroll with sound off and those who listen first.",
  },
  {
    q: "Do I need a GeeLark account to use the hook generator?",
    a: "No. The generator is free to use. You only need GeeLark if you want to manage multiple TikTok accounts on cloud phones and scale your posting workflow.",
  },
];

const TOOLS = [
  {
    title: "TikTok hashtag generator",
    description:
      "Get a mix of broad, niche and branded TikTok hashtags built around your topic and audience.",
    cta: "Generate TikTok hashtags",
    href: "/tiktok-hashtag",
  },
  {
    title: "AI post creator",
    description:
      "Turn a rough idea into a ready-to-publish post, sized and styled for the platform you're posting to.",
    cta: "Create posts",
    href: "/",
  },
  {
    title: "AI comment generator",
    description:
      "Write comments that read like a real person in the thread, tuned to each subreddit's tone.",
    cta: "Generate comments",
    href: "/comment-generator",
  },
  {
    title: "Instagram bio generator",
    description:
      "Create a clear Instagram bio with the right hook, keywords and call to action for your link.",
    cta: "Generate Instagram bios",
    href: "/instagram-bio",
  },
  {
    title: "Instagram hashtag generator",
    description:
      "Build hashtag sets for Reels, carousels and photos without hitting Instagram's 30-tag limit.",
    cta: "Generate Instagram hashtags",
    href: "/instagram-hashtag",
  },
  {
    title: "Facebook name generator",
    description:
      "Generate unique, memorable name ideas for your Facebook profile or page that match your niche.",
    cta: "Generate Facebook names",
    href: "/facebook-name",
  },
];

function HookGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<string>(HOOK_STYLES[0]!);
  const [tone, setTone] = useState<string>(TONES[0]!);
  const [copied, setCopied] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fn = useServerFn(generateHooks);
  const mutation = useMutation({
    mutationFn: (vars: { topic: string; style: string; tone: string }) => fn({ data: vars }),
  });

  const hooks: GeneratedHook[] = mutation.data?.hooks ?? [];

  useIframeHeight();

  const copy = async (text: string, i: number) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(i);
      setTimeout(() => setCopied(null), 1500);
    }
  };

  return (
    <div
      className="bg-white text-foreground"
      style={{ overflowY: "scroll", scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style>{`
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <main>
        <section id="generator" style={{ paddingBottom: "40px" }}>
          <div className="mx-auto max-w-3xl text-center"></div>

          <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
            <h2 className="text-center text-lg font-medium">What is your video about?</h2>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="e.g. a 30-day test of posting TikToks from 10 cloud phones for a skincare brand"
              className="mt-4 w-full resize-none rounded-2xl bg-secondary px-4 py-3.5 text-sm outline-none ring-primary/40 transition placeholder:text-muted-foreground focus:ring-2"
            />

            <p className="mt-5 text-sm font-semibold">Select hook style</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {HOOK_STYLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    style === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-primary-soft",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            <p className="mt-5 text-sm font-semibold">Tone</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    tone === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-primary-soft",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={topic.trim().length < 3 || mutation.isPending}
              onClick={() => mutation.mutate({ topic: topic.trim(), style, tone })}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition disabled:opacity-45"
            >
              <Sparkles className="size-4" />
              {mutation.isPending ? "Generating hooks…" : "Generate hooks"}
            </button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Pro tip:</span> name the audience and
              the outcome — "freelancers who keep losing clients" beats "business tips".
            </p>

            {mutation.isError &&
              (() => {
                const msg = mutation.error instanceof Error ? mutation.error.message : "";
                const isRateLimit = isErrorCode(msg, ERROR_CODE.RATE_LIMIT);
                return (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>
                      {isRateLimit ? "Usage limit reached" : "Something went wrong"}
                    </AlertTitle>
                    <AlertDescription>
                      {isRateLimit
                        ? stripErrorCode(msg)
                        : "Please try again. If the problem persists, try again later."}
                    </AlertDescription>
                  </Alert>
                );
              })()}

            {hooks.length > 0 && (
              <div className="mt-8 space-y-3 border-t border-border pt-8">
                {hooks.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/60 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <span
                        style={{ backgroundColor: "#e4f1ff" }}
                        className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold text-accent-foreground"
                      >
                        {h.framework}
                      </span>
                      <p className="mt-2 text-[15px] font-medium leading-snug">{h.hook}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copy(h.hook, i)}
                      aria-label="Copy hook"
                      className="shrink-0 rounded-xl border border-border bg-card p-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {copied === i ? <Check className="size-4" /> : <Copy className="size-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
