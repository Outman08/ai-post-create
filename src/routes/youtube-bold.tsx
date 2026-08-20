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
        <section className="relative overflow-hidden">
          <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-5 text-center sm:pt-5">
            <h1 className="mx-auto max-w-none whitespace-nowrap font-display text-[7.2vw] font-medium leading-[1.08] tracking-tight text-foreground sm:text-[56px]">
              YouTube bold text generator
            </h1>
          </div>
        </section>

        <section id="generator" className="mx-auto max-w-6xl px-5 pb-20">
          <BoldTextGenerator />
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
                  className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
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

        <section id="placements">
          <div className="mx-auto max-w-6xl px-5 pb-20">
            <h2 className="text-[32px] font-medium">Where Unicode bold works on YouTube</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Unicode bold text works everywhere on YouTube because it is treated as plain text, not
              formatting. The most useful placements include:
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PLACEMENTS.map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
                >
                  <h3 className="font-display text-base font-semibold">{item.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="guide" className="mx-auto max-w-3xl px-5 py-20">
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            What Unicode Bold Text Actually Is
          </h2>
          <p className="mt-4 text-muted-foreground">
            Unicode bold text is not a font in the traditional sense. It is a set of separate
            characters inside the Unicode standard that happen to look like bold letters. When you
            type a normal letter &ldquo;A&rdquo; your keyboard sends the code point U+0041. When you
            use a Unicode bold generator, that letter is swapped for the mathematical bold character
            &ldquo;𝐀&rdquo; at code point U+1D400.
          </p>
          <p className="mt-4 text-muted-foreground">
            Because these glyphs are part of Unicode itself, they travel with your text across any
            platform that supports the standard — including YouTube's title field, description box,
            comments, community posts and channel name.
          </p>
          <p className="mt-4 text-muted-foreground">
            The important distinction is that Unicode bold is text data, not styling metadata. Copy
            a bold string from the generator, paste it anywhere, and it stays bold. No CSS, no
            markdown, no rich text editor needed. That is why the approach works even in the places
            where YouTube offers zero native formatting controls.
          </p>

          <h3 className="mt-12 font-display text-xl font-semibold">
            How YouTube's Native Formatting Actually Works
          </h3>
          <p className="mt-3 text-muted-foreground">
            YouTube does provide a limited markdown-style formatting system, but it only applies in
            specific locations and has important restrictions:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              Video descriptions support bold using asterisks, italic with underscores and
              strikethrough with hyphens.
            </li>
            <li>Community posts support the same asterisk-based bold markdown.</li>
            <li>Comments also accept asterisk bold, underscore italic and hyphen strikethrough.</li>
            <li>
              Video titles, channel names, playlist titles and the About tab do NOT accept asterisk
              formatting — asterisks appear literally instead of triggering bold.
            </li>
          </ul>
          <p className="mt-4 text-muted-foreground">
            This is the central reason a bold text generator is valuable for creators. The places
            where native formatting fails are exactly the places where bold visual weight has the
            most impact on clicks and browsing. Titles are the single biggest lever on click-through
            rate, channel names appear in search results and recommended sidebars, and playlist
            titles show up on your channel homepage.
          </p>

          <h3 className="mt-12 font-display text-xl font-semibold">Mobile vs Desktop Rendering</h3>
          <p className="mt-3 text-muted-foreground">
            Because Unicode bold is a character set and not a visual effect, it renders the same on
            the YouTube mobile app, the YouTube website, YouTube TV, embedded players and
            third-party previews on social platforms. Most system fonts on iOS, Android, Windows and
            macOS include full Unicode coverage, so your bold string is extremely unlikely to show
            missing-glyph boxes.
          </p>

          <h3 className="mt-12 font-display text-xl font-semibold">
            Use Cases for YouTube Creators
          </h3>
          <h4 className="mt-6 font-display text-lg font-semibold">Click-Worthy Video Titles</h4>
          <p className="mt-2 text-muted-foreground">
            A single bold word can draw the eye to the most important part of your title. If your
            video is &ldquo;5 Morning Habits That Changed My Life&rdquo;, making
            &ldquo;Changed&rdquo; bold pulls attention to the transformation promise. Use this
            sparingly — one or two bold words per title, otherwise the effect flattens out.
          </p>

          <h4 className="mt-6 font-display text-lg font-semibold">Scannable Descriptions</h4>
          <p className="mt-2 text-muted-foreground">
            Long descriptions become scannable when each section has a bold label. Try labels like
            𝐂𝐡𝐚𝐩𝐭𝐞𝐫𝐬, 𝐑𝐞𝐬𝐨𝐮𝐫𝐜𝐞𝐬, 𝐌𝐲 𝐂𝐚𝐦𝐞𝐫𝐚 𝐒𝐞𝐭𝐮𝐩 or 𝐒𝐩𝐨𝐧𝐬𝐨𝐫𝐬. Viewers jump to the section they need
            instead of bouncing.
          </p>

          <h4 className="mt-6 font-display text-lg font-semibold">
            Community Posts That Stand Out
          </h4>
          <p className="mt-2 text-muted-foreground">
            Community posts compete with Shorts, videos and other posts in the subscriber feed. A
            bold opening line gives your post a visual edge. Keep the bold portion short — around
            three to six words — so it reads as emphasis rather than shouting.
          </p>

          <h4 className="mt-6 font-display text-lg font-semibold">
            Playlist, Channel Name and About Page
          </h4>
          <p className="mt-2 text-muted-foreground">
            Channels with many playlists can bold the series name and leave the episode descriptor
            plain so visitors scan categories faster. Bolding your brand name while leaving a
            tagline plain creates hierarchy, and bold About-page subheadings for &ldquo;Business
            Inquiries&rdquo;, &ldquo;Upload Schedule&rdquo; or &ldquo;My Story&rdquo; help sponsors
            and new subscribers find what they need.
          </p>

          <h3 className="mt-12 font-display text-xl font-semibold">
            Best Practices for Bold Text on YouTube
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
            <li>
              Use bold as emphasis, not decoration. When every word is bold, nothing is bold — one
              or two bold elements per field is the sweet spot.
            </li>
            <li>
              Respect accessibility. Screen readers may announce Unicode bold as &ldquo;mathematical
              bold capital A&rdquo;, so keep critical information in plain text and use bold only
              for decorative emphasis.
            </li>
            <li>
              Check search behaviour. Bold glyphs are different code points, so keep the searchable
              keyword in normal text at least once in your title and description.
            </li>
            <li>
              Avoid overdoing emoji plus bold. A title stuffed with both looks spammy and can
              depress trust.
            </li>
            <li>
              Stay consistent across videos. Pick a pattern and apply it across your catalog so your
              channel feels intentional.
            </li>
            <li>
              Do not sacrifice CTR testing. Test a bold title against a normal one and keep
              whichever wins.
            </li>
          </ul>
        </section>

        <section id="faq">
          <div className="mx-auto max-w-3xl px-5 py-20">
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <Accordion type="single" collapsible className="mt-8">
              {FAQS.map((faq) => (
                <AccordionItem key={faq.q} value={faq.q}>
                  <AccordionTrigger className="text-left text-base">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-[16px] text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section id="tools">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              More free tools for creators
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS.map((tool) => (
                <Link
                  key={tool.name}
                  to={tool.href}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
                >
                  <div>
                    <h3 className="font-display text-base font-semibold">{tool.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {tool.body}
                    </p>
                  </div>
                  <span className="mt-5 flex items-center justify-end gap-1 text-sm font-medium text-primary">
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
              Style your titles, then publish them at scale
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-primary-foreground/85">
              Generate bold YouTube text in seconds, then manage and publish every channel from its
              own GeeLark cloud phone.
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
