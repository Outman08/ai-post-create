import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronRight, ListChecks, Type, Wand2 } from "lucide-react";
import { BioGenerator } from "@/components/instagram-bio/generator";
import { SeoArticle } from "@/components/instagram-bio/seo-article";
import { MoreTools } from "@/components/instagram-bio/more-tools";

const TITLE = "Instagram Bio Generator — Free AI-Style Bio Ideas in Seconds";
const DESCRIPTION =
  "Generate scroll-stopping Instagram bios in seconds. Pick a tone, add your niche and keywords, and copy a bio that fits the 150-character limit.";

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
              name: "What is an Instagram bio generator?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "An Instagram bio generator is a free tool that creates bio ideas based on your description and preferred tone. It helps you quickly produce profile descriptions that fit Instagram's 150-character limit.",
              },
            },
            {
              "@type": "Question",
              name: "Is this Instagram bio generator free?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. The GeeLark Instagram Bio Generator is completely free to use. You can generate, copy, and edit as many bio ideas as you want without signing up.",
              },
            },
            {
              "@type": "Question",
              name: "How does the GeeLark bio generator work?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Enter a short description of yourself or your brand, choose a tone like professional, playful, or bold, and click Create me a bio. The generator instantly returns several bio options you can copy and paste into Instagram.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: InstagramBioPage,
});

const STEPS = [
  {
    icon: Type,
    title: "Describe yourself",
    body: "Add your name, niche, who you help, and a few keywords people actually search for.",
  },
  {
    icon: Wand2,
    title: "Choose a tone",
    body: "Professional, playful, aesthetic, bold, minimal or funny — the wording adapts to each.",
  },
  {
    icon: ListChecks,
    title: "Copy and paste",
    body: "Every option is checked against Instagram's 150-character limit before you copy it.",
  },
];

function InstagramBioPage() {
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
  }, []);

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

  return (
    <div className="min-h-screen font-sans text-foreground">
      <main>
        <section className="relative overflow-hidden">
          <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-12 text-center sm:pt-20">
            <h1 className="mx-auto max-w-3xl font-display text-[56px] font-medium leading-[1.08] tracking-tight text-foreground">
              Instagram bio generator
            </h1>
          </div>
        </section>

        <section id="generator" className="mx-auto max-w-6xl px-5 pb-20">
          <BioGenerator />
        </section>

        <section id="how">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="max-w-xl">
              <h2 className="text-[32px] font-medium">How it works</h2>
            </div>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="rounded-[var(--radius-xl)] border border-border p-6 shadow-[var(--shadow-soft)]"
                >
                  <span className="font-display text-sm font-bold text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-[22px] font-semibold">{step.title}</h3>
                  <p className="mt-2 text-[16px] text-muted-foreground">{step.body}</p>
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
                  q: "What is an Instagram bio generator?",
                  a: "An Instagram bio generator is a free tool that creates bio ideas based on your description and preferred tone. It helps you quickly produce profile descriptions that fit Instagram's 150-character limit.",
                },
                {
                  q: "Is this Instagram bio generator free?",
                  a: "Yes. The GeeLark Instagram Bio Generator is completely free to use. You can generate, copy, and edit as many bio ideas as you want without signing up.",
                },
                {
                  q: "How does the GeeLark bio generator work?",
                  a: "Enter a short description of yourself or your brand, choose a tone like professional, playful, or bold, and click Create me a bio. The generator instantly returns several bio options you can copy and paste into Instagram.",
                },
                {
                  q: "What tones can I choose for my Instagram bio?",
                  a: "You can choose from Professional, Playful, Aesthetic, Bold, Minimal, and Funny. Each tone changes the wording, emojis, and overall feel of the generated bios.",
                },
                {
                  q: "Will the generated bios fit Instagram's 150-character limit?",
                  a: "Yes. Every generated bio is checked against Instagram's 150-character limit. If a suggestion is close to the limit, you'll see the character count so you can decide before copying.",
                },
                {
                  q: "Can I use these bios for business accounts?",
                  a: "Absolutely. The generator works for personal accounts, creators, influencers, small businesses, and brands. Just describe what you do and pick a tone that matches your brand voice.",
                },
                {
                  q: "Do I need to sign up to use the generator?",
                  a: "No. You can use the Instagram Bio Generator without creating an account. You only need a GeeLark account if you want to manage and publish from multiple Instagram profiles on cloud phones.",
                },
                {
                  q: "Can I edit the generated bio before using it?",
                  a: "Yes. The generated bios are starting points. You can copy any option into Instagram and edit the text, emojis, line breaks, and call to action however you like.",
                },
                {
                  q: "How can GeeLark help me manage multiple Instagram accounts?",
                  a: "GeeLark provides cloud phones with unique device fingerprints and proxies, so you can run multiple Instagram accounts securely from one dashboard without needing physical phones.",
                },
                {
                  q: "What makes a good Instagram bio?",
                  a: "A good Instagram bio quickly explains who you are, what you offer, and why someone should follow you. It stays within 150 characters, uses clear formatting, and includes one simple call to action.",
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
              Build bios that convert, then scale them across every account
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-primary-foreground/85">
              Generate your next Instagram bio in seconds, then publish and manage every profile
              from its own GeeLark cloud phone.
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
