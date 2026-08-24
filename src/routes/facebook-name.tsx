import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import { NameGenerator } from "@/components/facebook-name/generator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const TITLE = "Facebook Name Generator — Free AI Name Ideas in Seconds | GeeLark";
const DESCRIPTION =
  "Generate catchy, memorable Facebook Page, Group, profile and vanity URL names in seconds. Describe what you do, pick a style, and copy names that follow Facebook's naming rules.";

const STEPS = [
  {
    title: "Describe your project",
    body: "Add what you do, who it is for, and any keyword you want included in the name.",
  },
  {
    title: "Pick a surface and style",
    body: "Choose Page or Group, then a style: local business, community, creator, brand or cause.",
  },
  {
    title: "Copy and claim",
    body: "Every suggestion stays under Facebook's 75-character Page name limit and ships with a vanity URL.",
  },
];

const TOOLS = [
  {
    title: "AI post creator",
    body: "Turn a rough idea into a ready-to-publish post, sized and styled for the platform you are posting to.",
    href: "/post-creator",
    cta: "Create posts",
  },
  {
    title: "AI comment generator",
    body: "Write comments that read like a real person in the thread, tuned to each subreddit's tone.",
    href: "/comment-generator",
    cta: "Generate comments",
  },
  {
    title: "TikTok hashtag generator",
    body: "Get a mix of broad, niche and branded TikTok hashtags built around your topic and audience.",
    href: "/tiktok-hashtag",
    cta: "Generate TikTok hashtags",
  },
  {
    title: "TikTok video hook generator",
    body: "Create attention-grabbing opening lines for your TikTok videos that stop the scroll and boost views.",
    href: "/tiktok-hook",
    cta: "Generate TikTok hooks",
  },
  {
    title: "Instagram hashtag generator",
    body: "Build hashtag sets for Reels, carousels and photos without hitting Instagram's 30-tag limit.",
    href: "/instagram-hashtag",
    cta: "Generate Instagram hashtags",
  },
  {
    title: "Instagram bio generator",
    body: "Create a clear Instagram bio with the right hook, keywords and call to action for your link.",
    href: "/instagram-bio",
    cta: "Generate Instagram bios",
  },
];

const FAQS = [
  {
    q: "Is the Facebook name generator free?",
    a: "Yes. The generator is free to use, with no sign-up required for basic generations. You can run as many name ideas as you need.",
  },
  {
    q: "Will Facebook approve the names it suggests?",
    a: "The generator follows Facebook's public naming guidelines, but final approval is always up to Meta. Avoid trademarked terms you don't own, misleading geographic claims, and generic single-word category names.",
  },
  {
    q: "Can I change my Facebook Page name later?",
    a: "Yes. Admins can request a Page name change from Settings. Facebook reviews the request manually and usually responds within a few days. Expect stricter review if the new name is very different from the current one.",
  },
  {
    q: "How do I claim a Facebook vanity URL?",
    a: "Go to your Page settings, open Username, and enter a handle that's at least 5 characters long and not already taken. Once claimed, your Page becomes accessible at facebook.com/yourusername.",
  },
  {
    q: "What is the difference between a display name and a username?",
    a: "The display name is the human-readable name people see on your profile or Page. The username is the short unique handle used in your URL and in @mentions.",
  },
  {
    q: "Can I use the generator for Facebook Groups?",
    a: "Absolutely. Choose the Community group style and the tool will produce names that emphasize topic clarity, audience, and shared identity — the three things that drive strong Group discovery.",
  },
  {
    q: "What naming styles can I choose?",
    a: "Local business, Community group, Creator, Brand, and Cause. Each style follows a different formula for memorability, searchability, and tone, and you can combine it with a tone like friendly, professional, playful, premium, or bold.",
  },
  {
    q: "Do I need to sign up to use the generator?",
    a: "No. You can use the Facebook Name Generator without creating an account. You only need a GeeLark account if you want to manage and publish from multiple Facebook profiles on cloud phones.",
  },
  {
    q: "How can GeeLark help me manage multiple Facebook accounts?",
    a: "GeeLark provides cloud phones with unique device fingerprints and proxies, so you can run multiple Facebook accounts securely from one dashboard without needing physical phones.",
  },
  {
    q: "What makes a good Facebook name?",
    a: "A good Facebook name is clear, easy to spell, fits the 75-character Page limit, follows the real-name policy for personal profiles, and works across Messenger, Instagram, and Threads. It should read well in the News Feed and survive a quick spoken-aloud test.",
  },
];

export const Route = createFileRoute("/facebook-name")({
  head: () => ({
    meta: [{ title: TITLE }, { name: "description", content: DESCRIPTION }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Facebook Name Generator",
          applicationCategory: "UtilitiesApplication",
          description: DESCRIPTION,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: FacebookNamePage,
});

function FacebookNamePage() {
  return (
    <div className="min-h-screen bg-white text-foreground">
      <main>
        <section className="relative overflow-hidden"></section>
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <NameGenerator />
        </section>
      </main>
    </div>
  );
}
