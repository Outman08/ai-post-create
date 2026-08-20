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
        <section className="relative overflow-hidden">
          <div className="relative mx-auto max-w-6xl rounded-2xl border border-border/50 bg-background px-5 pb-10 pt-5 text-center shadow-soft sm:pt-20">
            <h1 className="mx-auto max-w-3xl font-display text-[56px] font-medium leading-[1.08] tracking-tight text-foreground">
              Facebook name generator
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <NameGenerator />
        </section>

        <section id="how">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="max-w-xl">
              <h2 className="text-[32px] font-medium">How it works</h2>
              <p className="mt-3 text-muted-foreground">
                Describe your project, pick a surface and style, then scan the ranked list of name
                ideas until one sticks.
              </p>
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

        {/* Educational / SEO content */}
        <section id="guide" className="mx-auto max-w-3xl px-5 py-20">
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            What the Facebook name generator does
          </h2>
          <p className="mt-4 text-muted-foreground">
            Finding the right Facebook name is harder than it looks. A good name has to survive
            Facebook's naming policies, feel natural in conversation, fit inside display limits, and
            still stand out in a crowded feed. Our generator does the creative heavy lifting by
            analyzing your keywords, niche, and audience signals, then producing Page names, Group
            names, display names, and username ideas you can actually use.
          </p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              Facebook Page names for businesses, creators, nonprofits, podcasts, and media brands.
            </li>
            <li>
              Facebook Group names for communities, local groups, fan clubs, and niche interests.
            </li>
            <li>
              Display names for personal profiles that still follow Facebook's real-name policy.
            </li>
            <li>Usernames and vanity URLs that match your brand and are easy to share offline.</li>
            <li>
              Messenger and Marketplace handles that stay consistent across the Meta ecosystem.
            </li>
          </ul>

          <h3 className="mt-12 font-display text-xl font-semibold">
            Facebook name rules you need to know
          </h3>
          <p className="mt-3 text-muted-foreground">
            Before you pick a name, it helps to understand the guardrails Facebook enforces. The
            generator follows these rules automatically, but knowing them helps you choose
            confidently.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Page name length:</span> Facebook Page
              names should stay under 75 characters. Shorter names rank and display better on
              mobile.
            </li>
            <li>
              <span className="font-medium text-foreground">Group name length:</span> Group names
              can run longer, but anything over 50 characters gets truncated in previews and
              sidebars.
            </li>
            <li>
              <span className="font-medium text-foreground">Vanity URL requirements:</span> A custom
              username must be at least 5 characters, contain only letters, numbers, and periods,
              and be unique across all of Facebook.
            </li>
            <li>
              <span className="font-medium text-foreground">No special characters:</span> Emojis,
              ALL CAPS in unusual places, symbols, and unnecessary punctuation are blocked or cause
              review flags.
            </li>
            <li>
              <span className="font-medium text-foreground">Real-name policy:</span> Your personal
              display name must be the name you go by in daily life. Nicknames are allowed if they
              are variants of your real first or last name.
            </li>
            <li>
              <span className="font-medium text-foreground">No misleading branding:</span> You
              cannot use the name of a public figure, business, or trademark you don't represent.
            </li>
            <li>
              <span className="font-medium text-foreground">Generic terms are discouraged:</span>{" "}
              Pages named only after a generic product category (for example, just "Plumbing") often
              get rejected or restricted.
            </li>
          </ul>

          <h3 className="mt-12 font-display text-xl font-semibold">
            Naming styles the generator supports
          </h3>
          <p className="mt-3 text-muted-foreground">
            Pick the style that matches where and how the name will live. Each style follows a
            different formula for memorability, searchability, and tone.
          </p>

          <h4 className="mt-6 font-display text-lg font-semibold">Local business style</h4>
          <p className="mt-2 text-muted-foreground">
            Local business Page names pair a brand word with a location or service so customers
            searching in Facebook or Google find you instantly. Examples include "Maple Street
            Bakery", "Austin Mobile Tire", or "Brooklyn Coffee Roasters". This style balances
            discoverability with personality and works especially well for service businesses,
            restaurants, and retail shops that depend on local reach.
          </p>

          <h4 className="mt-6 font-display text-lg font-semibold">
            Community and niche Group style
          </h4>
          <p className="mt-2 text-muted-foreground">
            Groups live or die by how clearly the name communicates the vibe inside. The generator
            crafts Group names that include a topic, an audience, and often a location or shared
            identity. Examples include "Denver Freelance Designers", "New Mom Survival Club", or
            "Vintage Vinyl Collectors UK". Clear Group names drive more join requests and better
            post engagement.
          </p>

          <h4 className="mt-6 font-display text-lg font-semibold">
            Content creator and personal brand style
          </h4>
          <p className="mt-2 text-muted-foreground">
            Creators, coaches, and thought leaders usually run a Page under a personal name paired
            with a niche descriptor. Examples include "Sara Lin Fitness", "Chef Marco Cooks", or
            "Tech With Jamal". This style builds a recognizable creator identity that travels well
            across Reels, Lives, and cross-posting to Instagram.
          </p>

          <h4 className="mt-6 font-display text-lg font-semibold">Brand and startup style</h4>
          <p className="mt-2 text-muted-foreground">
            For product companies, SaaS brands, and modern startups, the generator produces short
            invented names, blends, and evocative words that feel premium and ownable. Examples
            include "Lumenly", "Nestwork", or "Brightmint". Pair these with a tagline-style subtitle
            if your category is not obvious.
          </p>

          <h4 className="mt-6 font-display text-lg font-semibold">
            Nonprofit, cause, and movement style
          </h4>
          <p className="mt-2 text-muted-foreground">
            Cause-driven Pages and Groups benefit from names that are emotionally clear and
            action-oriented. Examples include "Fund A Reader", "Every Kid Eats", or "Rewild The
            Valley". This style drives higher share rates and more organic word-of-mouth.
          </p>

          <h3 className="mt-12 font-display text-xl font-semibold">
            How to use the Facebook name generator
          </h3>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-muted-foreground">
            <li>
              Describe your project in one or two sentences. Mention what you do, who it is for, and
              any keyword you want included.
            </li>
            <li>Pick the surface: Page, Group, display name, or vanity URL.</li>
            <li>Choose a style from local business, community, creator, brand, or cause.</li>
            <li>Set the tone: friendly, professional, playful, premium, or bold.</li>
            <li>Generate and scan the suggestions. Regenerate as many times as you like.</li>
            <li>
              Check availability on Facebook and, ideally, on Instagram, TikTok, and the matching
              .com domain.
            </li>
            <li>
              Lock in your vanity URL once you pass 25 Page likes or create a Group, so nobody else
              claims it.
            </li>
          </ol>

          <h3 className="mt-12 font-display text-xl font-semibold">Use cases</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              Local businesses launching a new Page and wanting a name that ranks for "[service]
              near me" searches.
            </li>
            <li>
              Community organizers building private or public Groups where a clear, specific name
              drives higher join rates.
            </li>
            <li>Page rebrands where an old name no longer reflects what the business does.</li>
            <li>
              Messenger bots and customer support handles that need to match a brand across DM,
              comments, and stories.
            </li>
            <li>Marketplace sellers who want a trustworthy shop name buyers recognize.</li>
            <li>
              Creators and influencers who need a name that fits a Page, a handle, and a future
              podcast or merch line.
            </li>
            <li>Nonprofits and campaigns launching mission-driven Pages and fundraising Groups.</li>
            <li>
              Agencies spinning up client Pages, white-label Groups, or testing naming directions
              for pitches.
            </li>
          </ul>

          <h3 className="mt-12 font-display text-xl font-semibold">
            Best practices for Facebook names
          </h3>
          <p className="mt-3 text-muted-foreground">
            <span className="font-medium text-foreground">Know the Page vs Group distinction.</span>{" "}
            A Page is a public broadcasting surface for a brand, business, creator, or public
            figure. A Group is a discussion space for members around a shared interest. Name them
            accordingly: Pages lean on brand, Groups lean on topic and audience.
          </p>
          <p className="mt-3 text-muted-foreground">
            <span className="font-medium text-foreground">Match the vanity URL to the brand.</span>{" "}
            Keep the username identical, or as close as possible, to the public name. Avoid numbers,
            underscores, or "official" suffixes unless absolutely necessary.
          </p>
          <p className="mt-3 text-muted-foreground">
            <span className="font-medium text-foreground">Stay consistent across Meta.</span> Reuse
            the same handle on Instagram, Threads, and WhatsApp Business so cross-posting and
            tagging work cleanly.
          </p>
          <p className="mt-3 text-muted-foreground">
            <span className="font-medium text-foreground">Leave room for growth.</span> Don't box
            yourself in with a hyper-specific product or city if you plan to expand later.
          </p>
          <p className="mt-3 text-muted-foreground">
            <span className="font-medium text-foreground">Check pronunciation.</span> If people hear
            your name in a podcast or video, can they spell it correctly on the first try?
          </p>
          <p className="mt-3 text-muted-foreground">
            <span className="font-medium text-foreground">Search before you commit.</span> Look up
            the name on Facebook, Google, and the US trademark database to avoid collisions.
          </p>
          <p className="mt-3 text-muted-foreground">
            <span className="font-medium text-foreground">Test it in a post.</span> Write a sample
            caption using the name and read it out loud. Awkward names reveal themselves fast.
          </p>

          <h3 className="mt-12 font-display text-xl font-semibold">
            Find a Facebook name that fits the rules
          </h3>
          <p className="mt-3 text-muted-foreground">
            Naming a Page or Group within Facebook's 75-character limit and real-name policy can be
            surprisingly difficult. Use the GeeLark Facebook Name Generator to create personalized
            name ideas based on your account type, category, and preferred style.
          </p>
          <p className="mt-3 text-muted-foreground">
            Choose from local business, community, creator, brand, or cause styles, generate several
            options, and copy the one that best fits your profile — each one ships with a matching
            vanity URL you can claim right away.
          </p>
        </section>

        {/* FAQ */}
        <section id="faq">
          <div className="mx-auto max-w-3xl px-5 py-20">
            <h2 className="text-3xl font-medium md:text-4xl">Frequently asked questions</h2>
            <Accordion type="single" collapsible className="mt-8">
              {FAQS.map((item) => (
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

        {/* Other tools */}
        <section id="tools">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              More free tools for creators
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS.map((tool) => (
                <Link
                  key={tool.title}
                  to={tool.href}
                  className="group flex flex-col justify-between rounded-xl border border-border p-6 shadow-soft transition-shadow hover:shadow-lift"
                >
                  <div>
                    <h3 className="font-display text-base font-semibold">{tool.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {tool.body}
                    </p>
                  </div>
                  <span className="mt-5 ml-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {tool.cta} <ArrowUpRight className="size-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="overflow-hidden rounded-[var(--radius-3xl)] border border-border bg-[image:var(--gradient-primary)] px-8 py-14 text-center shadow-[var(--shadow-lift)]">
            <h2 className="text-3xl font-medium text-primary-foreground md:text-4xl">
              Pick the perfect name, then scale it across every account
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-primary-foreground/85">
              Generate your next Facebook name in seconds, then publish and manage every Page and
              Group from its own GeeLark cloud phone.
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
