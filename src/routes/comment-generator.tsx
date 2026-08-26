import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useIframeHeight } from "@/hooks/use-iframe-height";
import { Check, Copy, Sparkles, ArrowRight, ArrowUpRight, ChevronLeft } from "lucide-react";
import { generateComments } from "@/lib/comments.functions";
import { cn, copyToClipboard } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const TITLE = "AI Comment Generator — GeeLark";
const DESCRIPTION =
  "Draft thoughtful, on-brand replies for every major platform in seconds, then post them from real Android cloud phones.";

const FAQS = [
  {
    q: "Is the AI comment generator free to try?",
    a: "Yes. Generate comments right on this page without a credit card. A GeeLark account unlocks saved voice profiles, multi-account commenting and cloud phones for every profile.",
  },
  {
    q: "Will my comments sound like AI?",
    a: "Not if you use it as a drafting partner. Give it context, generate a few options, and tweak the winner. The result sounds like you on a good day, not like a generic bot.",
  },
  {
    q: "Can I use it for multiple social accounts?",
    a: "Absolutely. The generator is platform-aware, so you can switch between a polished LinkedIn profile, a witty X handle and a playful Instagram account without losing consistency.",
  },
  {
    q: "Does it work in languages other than English?",
    a: "Yes. You can generate replies in most major languages, and the model will mirror the language of the post you paste in.",
  },
  {
    q: "How does GeeLark keep accounts safe?",
    a: "Every profile runs on its own Android cloud phone with a distinct device fingerprint and proxy, so commenting across dozens of accounts doesn't share a browser, IP or device signature.",
  },
  {
    q: "Is there a limit on how many comments I can generate?",
    a: "The free tool has fair-use limits to keep it fast for everyone. Signed-in workspaces get higher limits for daily engagement routines.",
  },
  {
    q: "Can I edit the comments before posting them?",
    a: "Yes — every generated reply is fully editable. Treat the drafts as a starting point: tweak the wording, add a personal detail, then copy it into the app where you'll post it.",
  },
  {
    q: "How long does it take to generate comments?",
    a: "Usually a few seconds. The model returns three distinct options at once, so you can pick the strongest, refine it, and move on without breaking your flow.",
  },
  {
    q: "What if the comments don't match my brand voice?",
    a: "Choose a tone and comment type that fits, paste a post that reflects your style, and regenerate if the first batch isn't quite right. Saved voice profiles in a GeeLark workspace lock in a consistent voice across accounts.",
  },
  {
    q: "Does the generator support threads and reply chains?",
    a: "Yes. Paste the full thread or the specific comment you want to reply to, and the generator reads the context to write a reply that fits the conversation rather than just the original post.",
  },
];

const TOOLS = [
  {
    title: "AI Post Creator",
    description:
      "Turn a rough idea into a ready-to-publish post, sized and styled for the platform you are posting to.",
    href: "/",
    cta: "Create posts",
  },
  {
    title: "TikTok Hashtag Generator",
    description:
      "Get a mix of broad, niche and branded TikTok hashtags built around your topic and audience.",
    href: "/tiktok-hashtag",
    cta: "Generate TikTok hashtags",
  },
  {
    title: "TikTok Video Hook Generator",
    description:
      "Create attention-grabbing opening lines for your TikTok videos that stop the scroll and boost views.",
    href: "/tiktok-hook",
    cta: "Generate TikTok hooks",
  },
  {
    title: "Instagram Hashtag Generator",
    description:
      "Build hashtag sets for Reels, carousels and photos without hitting Instagram's 30-tag limit.",
    href: "/instagram-hashtag",
    cta: "Generate Instagram hashtags",
  },
  {
    title: "Instagram Bio Generator",
    description:
      "Create a clear Instagram bio with the right hook, keywords and call to action for your link.",
    href: "/instagram-bio",
    cta: "Generate Instagram bios",
  },
  {
    title: "YouTube Bold Text Generator",
    description:
      "Convert regular text into bold Unicode characters that stand out in YouTube titles, comments and descriptions.",
    href: "/youtube-bold",
    cta: "Generate bold text for YouTube",
  },
];

const TONES = [
  "Casual",
  "Professional",
  "Conversational",
  "Friendly",
  "Humorous",
  "Authoritative",
  "Sarcastic",
  "Inspirational",
];

const PLATFORMS = ["LinkedIn", "X", "Instagram", "TikTok", "Reddit", "Facebook", "YouTube"];

const INTENTS = [
  "Engagement / supportive",
  "Value-add insight",
  "Question",
  "Soft promotion",
  "Humor & personality",
  "Customer service",
];

const STEPS = [
  {
    title: "Paste the post",
    body: "Drop in the post you want to reply to, pick the platform, tone and comment type. You get three distinct replies, not three rewordings.",
  },
  {
    title: "Pick and polish",
    body: "Copy the strongest draft, add a human detail — a name, a quick story, a platform-native phrase — before you send it.",
  },
  {
    title: "Reply from a cloud phone",
    body: "Each account comments from its own Android cloud phone with a unique fingerprint and proxy, so volume never looks like a bot farm.",
  },
];

export const Route = createFileRoute("/comment-generator")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
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
  component: CommentGenerator,
});

function CommentGenerator() {
  const [post, setPost] = useState("");
  const [tone, setTone] = useState(TONES[0]!);
  const [platform, setPlatform] = useState(PLATFORMS[0]!);
  const [intent, setIntent] = useState(INTENTS[0]!);
  const [copied, setCopied] = useState<number | null>(null);

  useIframeHeight();

  const run = useServerFn(generateComments);
  const mutation = useMutation({
    mutationFn: () => run({ data: { post, tone, platform, intent } }),
  });

  const copy = async (text: string, i: number) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(i);
      setTimeout(() => setCopied(null), 1600);
    }
  };

  return (
    <div className="bg-white">
      <main>
        <section id="generator">
          <div className="mx-auto max-w-4xl text-center"></div>
          <div className="mx-auto mt-12 max-w-4xl rounded-3xl border border-border bg-card p-6 pb-[44px] shadow-card sm:p-8 sm:pb-[52px]">
            <h2 className="text-center text-xl font-medium">What post do you want to reply to?</h2>
            <textarea
              value={post}
              onChange={(e) => setPost(e.target.value)}
              rows={5}
              placeholder="Paste the original post here — e.g. 'Most teams don't have a content problem, they have a distribution problem. Here's what changed for us...'"
              className="mt-5 w-full resize-none rounded-2xl bg-surface p-4 text-sm outline-none ring-brand/40 transition placeholder:text-muted-foreground focus:ring-2"
            />

            <ChipRow label="Tone" options={TONES} value={tone} onChange={setTone} />
            <ChipRow label="Comment type" options={INTENTS} value={intent} onChange={setIntent} />

            <button
              onClick={() => mutation.mutate()}
              disabled={!post.trim() || mutation.isPending}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3.5 font-bold text-brand-foreground transition hover:opacity-90 disabled:opacity-45"
            >
              <Sparkles className="size-4" />
              {mutation.isPending ? "Writing comments…" : "Generate comment"}
            </button>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Pro tip:</span> paste the full post
              and add one line about your angle — better input, better replies.
            </p>

            {mutation.isError && (
              <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-center text-sm text-destructive">
                {(mutation.error as Error).message || "Something went wrong. Try again."}
              </p>
            )}

            {mutation.data && (
              <div className="mt-8 space-y-3">
                {mutation.data.comments.map((c, i) => (
                  <div
                    key={i}
                    className="group rounded-2xl border border-border bg-surface p-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm leading-relaxed whitespace-pre-line">{c}</p>
                      <button
                        onClick={() => copy(c, i)}
                        aria-label="Copy comment"
                        className="shrink-0 rounded-lg border border-border bg-card p-2 text-muted-foreground transition hover:text-foreground"
                      >
                        {copied === i ? <Check className="size-4" /> : <Copy className="size-4" />}
                      </button>
                    </div>
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

function ChipRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-5">
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition",
              value === o
                ? "bg-brand text-brand-foreground"
                : "bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
