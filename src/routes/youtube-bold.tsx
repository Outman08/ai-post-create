import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BoldTextGenerator } from "@/components/youtube-bold/generator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowUpRight, ChevronRight, ClipboardCopy, Type, Sparkles, ArrowLeft } from "lucide-react";
import { useEffect } from "react";

const TITLE = "YouTube Bold Text Generator — Free Unicode Bold for Titles";
const DESCRIPTION =
  "Convert normal text into Unicode bold letters you can paste into YouTube titles, descriptions, community posts, channel names and playlists. Free, instant, no sign-up.";

const STEPS = [
  {
    icon: Type,
    title: "Type or paste your text",
    body: "Drop in a video title, description header, channel name or playlist title — anything you want to emphasize.",
  },
  {
    icon: Sparkles,
    title: "Pick a bold style",
    body: "The tool instantly produces bold, bold sans, bold italic, script and fraktur versions of your text.",
  },
  {
    icon: ClipboardCopy,
    title: "Copy and paste to YouTube",
    body: "Click copy and paste the Unicode string anywhere on YouTube. It stays bold with no markdown needed.",
  },
];

const PLACEMENTS = [
  {
    name: "Video titles",
    body: "Adding a single bold keyword can make a title pop in search and suggested feeds.",
  },
  {
    name: "Channel name",
    body: "A partial bold treatment — brand word bold, the rest normal — improves recognition.",
  },
  {
    name: "Playlist titles",
    body: "Helps visitors scan your channel home and find the playlist they actually want.",
  },
  {
    name: "About tab",
    body: "Useful for emphasizing your value proposition, contact headers or upload schedule.",
  },
  {
    name: "Video descriptions",
    body: "Create clean section headers like Timestamps, Gear, Links or Sponsors that stand out more than asterisk bold.",
  },
  {
    name: "Community posts",
    body: "Bold the hook so the first line grabs attention in the subscriber feed.",
  },
];

const FAQS = [
  {
    q: "Does YouTube allow bold text in titles?",
    a: "YouTube does not offer native bold formatting in titles, and asterisks render as literal asterisks. Unicode bold characters from this generator are treated as plain text and display as bold in every YouTube surface, including titles.",
  },
  {
    q: "Will Unicode bold text hurt my SEO on YouTube?",
    a: "Unicode bold characters are different code points from regular letters, so YouTube search may not treat them as identical to normal text. Use bold sparingly and keep the key searchable phrase in normal text somewhere in your title or description.",
  },
  {
    q: "Can I use this tool for YouTube Shorts titles?",
    a: "Yes. Shorts titles accept the same Unicode characters as regular video titles, so bold text works identically.",
  },
  {
    q: "Does bold text work in YouTube comments?",
    a: "Yes, though comments also support native asterisk bold. Unicode bold has the advantage of keeping visible asterisks out of the final text.",
  },
  {
    q: "Is this tool free?",
    a: "Yes, the YouTube Bold Text Generator is completely free with no sign-up, no limits and no watermarks.",
  },
  {
    q: "Will my bold text look right on mobile?",
    a: "Yes. Unicode bold is rendered by the system font on iOS and Android, which support the full mathematical bold range, so it looks the same in the YouTube app as on desktop.",
  },
  {
    q: "Can I combine bold with italic?",
    a: "Unicode also includes bold italic characters. This generator offers bold italic and bold sans italic alongside plain bold so you can mix and match.",
  },
];

const TOOLS = [
  {
    name: "AI post creator",
    body: "Turn a rough idea into a ready-to-publish post, sized and styled for the platform you are posting to.",
    href: "/post-creator",
    cta: "Create posts",
  },
  {
    name: "AI comment generator",
    body: "Write comments that read like a real person in the thread, tuned to each subreddit's tone.",
    href: "/comment-generator",
    cta: "Generate comments",
  },
  {
    name: "TikTok hashtag generator",
    body: "Get a mix of broad, niche and branded TikTok hashtags built around your topic and audience.",
    href: "/tiktok-hashtag",
    cta: "Generate TikTok hashtags",
  },
  {
    name: "TikTok video hook generator",
    body: "Create attention-grabbing opening lines for your TikTok videos that stop the scroll and boost views.",
    href: "/tiktok-hook",
    cta: "Generate TikTok hooks",
  },
  {
    name: "Instagram hashtag generator",
    body: "Build hashtag sets for Reels, carousels and photos without hitting Instagram's 30-tag limit.",
    href: "/instagram-hashtag",
    cta: "Generate Instagram hashtags",
  },
  {
    name: "Instagram bio generator",
    body: "Create a clear Instagram bio with the right hook, keywords and call to action for your link.",
    href: "/instagram-bio",
    cta: "Generate Instagram bios",
  },
];

export const Route = createFileRoute("/youtube-bold")({
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
          "@type": "WebApplication",
          name: "YouTube Bold Text Generator",
          applicationCategory: "UtilitiesApplication",
          description: DESCRIPTION,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: YouTubeBoldPage,
});

function YouTubeBoldPage() {
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
      window.parent.postMessage(
        {
          type: "iframe-height",
          height: height,
        },
        "*",
      );
    }

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
    <div className="min-h-screen font-sans text-foreground bg-white">
      <main>
        <section id="generator" className="mx-auto max-w-6xl px-5 py-5">
          <BoldTextGenerator />
        </section>
      </main>
    </div>
  );
}
