import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
} from "lucide-react";

import { generateHooks, type GeneratedHook } from "@/lib/hooks.functions";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: "setIframeHeight", height: height }, "*");
    };

    sendHeight();
    const observer = new ResizeObserver(() => sendHeight());
    observer.observe(document.body);
    window.addEventListener("resize", sendHeight);
    window.addEventListener("load", sendHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sendHeight);
      window.removeEventListener("load", sendHeight);
    };
  }, []);

  useEffect(() => {
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: "setIframeHeight", height: height }, "*");
    };
    sendHeight();
  }, [hooks.length, openFaq]);

  const copy = async (text: string, i: number) => {
    await navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div
      className="min-h-screen bg-white text-foreground"
      style={{ overflowY: "scroll", scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style>{`
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="mx-auto max-w-6xl px-5 py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to tools
        </Link>
      </div>

      <main>
        <section id="generator" className="px-5 pb-16 pt-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-[56px] font-medium leading-tight">TikTok video hook generator</h1>
          </div>

          <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
            <h2 className="text-center text-lg font-medium">What is your video about?</h2>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
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

            {mutation.isError && (
              <p className="mt-4 text-center text-sm text-destructive">
                {(mutation.error as Error).message}
              </p>
            )}

            {hooks.length > 0 && (
              <div className="mt-8 space-y-3 border-t border-border pt-8">
                {hooks.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/60 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="inline-block rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-accent-foreground">
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

        <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-3xl font-medium md:text-4xl">From idea to first three seconds</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <span className="text-sm font-bold text-primary">{s.n}</span>
                <h3 className="mt-3 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="guide" className="mx-auto max-w-6xl px-5 py-20">
          <article className="mx-auto max-w-3xl">
            <h2 className="text-[32px] font-medium">How to Write Better Hooks for TikTok Videos</h2>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>On TikTok, you don't have much time to convince someone to keep watching.</p>
              <p>
                A TikTok hook is the opening of your video—the words, visuals, actions, or sounds
                designed to capture attention and give viewers a reason to stay. A hook might be a
                question, surprising statement, relatable problem, bold claim, visual
                transformation, or preview of what's coming next.
              </p>
              <p>
                TikTok recommends prioritizing the hook during the first 6 seconds of a video and
                introducing the content proposition within the first 3 seconds. That means your
                opening needs to communicate value quickly.
              </p>
              <p>
                The GeeLark TikTok Video Hook Generator helps you create hook ideas based on your
                topic, audience, and video goal. Generate multiple options, choose the strongest
                angle, and adapt it to your own voice before filming.
              </p>
            </div>

            <h3 className="mt-10 text-[22px] font-semibold">What Is a TikTok Hook?</h3>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>
                A TikTok hook is the opening element of a video that encourages viewers to stop
                scrolling and continue watching.
              </p>
              <p>
                It can be something you say, something you show, text displayed on screen, or a
                combination of all three.
              </p>
              <p>For example, imagine you're creating a TikTok about common skincare mistakes.</p>
              <p>You could start with:</p>
              <p>
                <em>Today I'm going to share some skincare tips.</em>
              </p>
              <p>But a stronger hook might be:</p>
              <p>
                <em>
                  If your skin still feels dry after moisturizing, you might be making this mistake.
                </em>
              </p>
              <p>
                The second opening immediately identifies a problem and gives the right viewer a
                reason to continue watching.
              </p>
              <p>
                A good TikTok hook doesn't just attract attention. It also sets an expectation for
                what comes next.
              </p>
            </div>

            <h3 className="mt-10 text-[22px] font-semibold">
              Why Are the First Few Seconds Important on TikTok?
            </h3>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>
                TikTok is a fast-moving, short-form video platform. Viewers can move to the next
                video with a single swipe, so your opening has to establish relevance quickly.
              </p>
              <p>
                TikTok's own creative guidance recommends a simple three-part video structure:{" "}
                <strong>Hook → Body → Close</strong>.
              </p>
              <p>The hook captures attention.</p>
              <p>
                The body delivers the main message, story, demonstration, or value promised by the
                opening.
              </p>
              <p>The close gives the viewer a conclusion or next step.</p>
              <p>
                Your hook therefore shouldn't be treated as an isolated trick. It should lead
                naturally into the rest of your video.
              </p>
              <p>For example:</p>
              <p>
                <strong>Hook:</strong> Here's why your houseplants keep dying even though you're
                watering them.
              </p>
              <p>
                <strong>Body:</strong> Explain how overwatering affects the roots and show what to
                look for.
              </p>
              <p>
                <strong>Close:</strong> Check the soil before your next watering and save this for
                later.
              </p>
              <p>
                The opening creates curiosity, but the rest of the video fulfills that curiosity.
              </p>
            </div>

            <h3 className="mt-10 text-[22px] font-semibold">How to Write a Good TikTok Hook</h3>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>
                There isn't one perfect formula for every TikTok video. The right hook depends on
                your topic, audience, and content style.
              </p>
              <p>However, several approaches can give you a useful starting point.</p>
            </div>

            <h4 className="mt-8 text-[18px] font-semibold">1. Start With a Problem</h4>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>Call out a problem your target viewer recognizes.</p>
              <p>For example:</p>
              <ul className="space-y-2.5 pl-5">
                <li className="list-disc">
                  Your TikTok videos aren't necessarily boring—your intros might just be too slow.
                </li>
                <li className="list-disc">
                  If your makeup looks great in person but terrible on camera, try this.
                </li>
                <li className="list-disc">
                  Struggling to get your sourdough to rise? Check this first.
                </li>
              </ul>
              <p>
                Problem-based hooks work because they quickly help the viewer decide, "This video is
                relevant to me."
              </p>
              <p>The more specific the problem, the easier that decision becomes.</p>
              <p>Instead of:</p>
              <p>
                <em>Having trouble with social media?</em>
              </p>
              <p>Try:</p>
              <p>
                <em>Posting TikToks consistently but still getting almost no watch time?</em>
              </p>
              <p>The second hook describes a much clearer situation.</p>
            </div>

            <h4 className="mt-8 text-[18px] font-semibold">2. Ask a Question</h4>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>
                A question can create curiosity when the viewer genuinely wants to know the answer.
              </p>
              <p>For example:</p>
              <ul className="space-y-2.5 pl-5">
                <li className="list-disc">
                  Why do some TikTok videos look professional even when they're filmed on a phone?
                </li>
                <li className="list-disc">Which of these three outfits would you actually wear?</li>
                <li className="list-disc">
                  Did you know you're probably cleaning your coffee machine incorrectly?
                </li>
              </ul>
              <p>
                Avoid questions with an obvious answer or questions that exist only as clickbait.
              </p>
              <p>
                The question should naturally lead into information the video actually provides.
              </p>
            </div>

            <h4 className="mt-8 text-[18px] font-semibold">3. Promise Something Useful</h4>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>Tell viewers what they will learn or gain from watching.</p>
              <p>For example:</p>
              <ul className="space-y-2.5 pl-5">
                <li className="list-disc">
                  Here's how to make your product photos look better using just a window.
                </li>
                <li className="list-disc">Three ways to make a small bedroom feel bigger.</li>
                <li className="list-disc">
                  Here's the easiest way I've found to plan a week of content in 20 minutes.
                </li>
              </ul>
              <p>Specificity makes these hooks stronger.</p>
              <p>Compare:</p>
              <p>
                <em>Here's a useful marketing tip.</em>
              </p>
              <p>With:</p>
              <p>
                <em>Here's how to turn one customer question into five TikTok ideas.</em>
              </p>
              <p>The second gives viewers a much clearer reason to continue.</p>
            </div>

            <h4 className="mt-8 text-[18px] font-semibold">4. Create a Curiosity Gap</h4>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>
                You can reveal enough information to make the viewer interested without immediately
                giving away the answer.
              </p>
              <p>For example:</p>
              <ul className="space-y-2.5 pl-5">
                <li className="list-disc">
                  I changed one thing in my morning routine for 30 days. This was the result.
                </li>
                <li className="list-disc">
                  There's one setting I always change before filming on my phone.
                </li>
                <li className="list-disc">
                  I thought the expensive version would win. I was wrong.
                </li>
              </ul>
              <p>The important part is payoff.</p>
              <p>
                If your hook creates curiosity, the video should resolve that curiosity. Don't imply
                that something surprising happened if the video doesn't actually support the claim.
              </p>
            </div>

            <h4 className="mt-8 text-[18px] font-semibold">5. Lead With the Result</h4>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>
                Sometimes the strongest opening is to show viewers the outcome before explaining how
                you got there.
              </p>
              <p>For example:</p>
              <ul className="space-y-2.5 pl-5">
                <li className="list-disc">This is what the room looked like three hours ago.</li>
                <li className="list-disc">I made this entire dinner for under $15.</li>
                <li className="list-disc">
                  We cut our editing time in half with one workflow change.
                </li>
              </ul>
              <p>
                You can combine the statement with a visual showing the transformation or result.
              </p>
              <p>This works particularly well for:</p>
              <ul className="space-y-2.5 pl-5">
                <li className="list-disc">Before-and-after videos</li>
                <li className="list-disc">Tutorials</li>
                <li className="list-disc">DIY content</li>
                <li className="list-disc">Beauty content</li>
                <li className="list-disc">Fitness content</li>
                <li className="list-disc">Recipes</li>
                <li className="list-disc">Product demonstrations</li>
                <li className="list-disc">Case studies</li>
              </ul>
              <p>
                Showing the payoff first gives viewers context for why they should care about the
                process.
              </p>
            </div>

            <h4 className="mt-8 text-[18px] font-semibold">6. Call Out Your Target Audience</h4>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>
                Instead of trying to attract everyone, speak directly to the people the video is
                for.
              </p>
              <p>For example:</p>
              <ul className="space-y-2.5 pl-5">
                <li className="list-disc">If you're a freelance designer, save this.</li>
                <li className="list-disc">
                  Small business owners: stop doing this with your Instagram content.
                </li>
                <li className="list-disc">
                  If you're visiting Tokyo for the first time, you need to know this.
                </li>
                <li className="list-disc">New runners, don't make the mistake I made.</li>
              </ul>
              <p>This can make the content immediately relevant to the right audience.</p>
              <p>
                Keep the audience specific enough to be meaningful. Generic openings such as
                "Attention everyone!" rarely provide the same context.
              </p>
            </div>

            <h4 className="mt-8 text-[18px] font-semibold">7. Challenge a Common Assumption</h4>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>
                If your content genuinely disagrees with conventional advice, that disagreement can
                become the hook.
              </p>
              <p>For example:</p>
              <ul className="space-y-2.5 pl-5">
                <li className="list-disc">
                  You don't need to post on TikTok three times a day to improve your content.
                </li>
                <li className="list-disc">Expensive camera gear won't fix this problem.</li>
                <li className="list-disc">More hashtags aren't always better.</li>
              </ul>
              <p>Then explain why.</p>
              <p>
                Contrarian hooks work best when you have a real argument or evidence behind them.
                Don't manufacture controversy simply to increase curiosity.
              </p>
            </div>

            <h4 className="mt-8 text-[18px] font-semibold">8. Start in the Middle of the Action</h4>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>Not every TikTok hook needs to be a sentence.</p>
              <p>Sometimes the visual itself should do the work.</p>
              <p>Instead of beginning with:</p>
              <p>
                <em>
                  Hey guys! Welcome back to my TikTok. So today I wanted to make a quick video
                  because I've been getting a few questions recently...
                </em>
              </p>
              <p>
                You could open by showing the damaged table immediately, cutting to the finished
                result, and saying:
              </p>
              <p>
                <em>I found this on the side of the road yesterday.</em>
              </p>
              <p>
                TikTok encourages creators and advertisers to think visually, using movement,
                people, captions, and text overlays to capture attention quickly.
              </p>
              <p>The visual hook and spoken hook can work together.</p>
            </div>

            <h3 className="mt-10 text-[22px] font-semibold">TikTok Hook Formulas You Can Adapt</h3>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>When you're stuck, a reusable formula can help you find an angle.</p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Problem Hook",
                  body: "If you're struggling with [problem], try this. Example: If your TikToks get views but no profile visits, check this.",
                },
                {
                  title: "Mistake Hook",
                  body: "Stop doing [common mistake] if you want [result]. Example: Stop starting every product video with your logo.",
                },
                {
                  title: "Question Hook",
                  body: "Why does [surprising situation] happen? Example: Why do your videos look darker after you upload them?",
                },
                {
                  title: "List Hook",
                  body: "[Number] things I wish I knew before [activity]. Example: 5 things I wish I knew before starting a YouTube channel.",
                },
                {
                  title: "How-to Hook",
                  body: "Here's how to [desired result] without [common obstacle]. Example: Here's how to film better product videos without buying another camera.",
                },
                {
                  title: "Result Hook",
                  body: "I [action] for [time period]. Here's what happened. Example: I posted one TikTok every day for 30 days. Here's what I learned.",
                },
                {
                  title: "Warning Hook",
                  body: "Before you [action], check this. Example: Before you buy another microphone, check this setting.",
                },
                {
                  title: "Audience Hook",
                  body: "If you're a [specific audience], you need to know this. Example: If you're a new Etsy seller, you need to know this.",
                },
                {
                  title: "Comparison Hook",
                  body: "I tested [A] vs. [B] to see which actually [result]. Example: I tested natural light vs. a $200 studio light to see which looked better.",
                },
                {
                  title: "Secret or Discovery Hook",
                  body: "I just discovered [useful or surprising thing]. Example: I just discovered a much faster way to add captions to my videos.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
                >
                  <h4 className="font-bold">{f.title}</h4>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>
                These formulas aren't rules. Use them as starting points and rewrite them to sound
                natural for your content.
              </p>
            </div>

            <h3 className="mt-10 text-[22px] font-semibold">
              TikTok Hook Examples for Different Types of Videos
            </h3>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>The best hook depends heavily on what you're creating.</p>
            </div>

            <h4 className="mt-8 text-[18px] font-semibold">TikTok Hooks for Business</h4>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>
                Business content works better when the hook focuses on a customer's problem or
                desired result rather than simply announcing the company.
              </p>
              <p>Instead of:</p>
              <p>
                <em>Check out our new skincare product!</em>
              </p>
              <p>Try:</p>
              <p>
                <em>
                  If your moisturizer disappears five minutes after you apply it, your skin might
                  need this.
                </em>
              </p>
              <p>Or:</p>
              <p>
                <em>We designed this bag for people who carry their entire office everywhere.</em>
              </p>
              <p>Lead with the audience's reason to care, then introduce the product naturally.</p>
            </div>

            <h4 className="mt-8 text-[18px] font-semibold">TikTok Hooks for Product Videos</h4>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>
                Product videos can start by demonstrating the product, highlighting a problem, or
                showing the result.
              </p>
              <ul className="space-y-2.5 pl-5">
                <li className="list-disc">I didn't expect this tiny vacuum to pick THAT up.</li>
                <li className="list-disc">
                  If your desk always looks like this, watch what this does.
                </li>
                <li className="list-disc">
                  Three things I didn't know this coffee machine could do.
                </li>
                <li className="list-disc">I tested the viral $20 version against the $100 one.</li>
              </ul>
              <p>
                Avoid spending several seconds introducing your company before showing viewers why
                the product matters.
              </p>
            </div>

            <h4 className="mt-8 text-[18px] font-semibold">TikTok Hooks for Educational Videos</h4>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>Educational TikToks should make the value of the lesson obvious.</p>
              <ul className="space-y-2.5 pl-5">
                <li className="list-disc">
                  Here's the easiest way to remember the difference between these two terms.
                </li>
                <li className="list-disc">
                  You're probably using this Excel formula the hard way.
                </li>
                <li className="list-disc">
                  Three interview mistakes that are surprisingly easy to fix.
                </li>
                <li className="list-disc">
                  If you're learning Spanish, stop translating this phrase literally.
                </li>
              </ul>
              <p>Give viewers a clear reason to invest their time in learning from you.</p>
            </div>

            <h4 className="mt-8 text-[18px] font-semibold">TikTok Hooks for Storytelling Videos</h4>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>
                Storytelling hooks create an unanswered question that encourages viewers to hear
                what happened next.
              </p>
              <ul className="space-y-2.5 pl-5">
                <li className="list-disc">This was supposed to be a normal client meeting.</li>
                <li className="list-disc">
                  I knew something was wrong the moment I opened the email.
                </li>
                <li className="list-disc">Six months ago, we almost cancelled this project.</li>
                <li className="list-disc">
                  I made one terrible decision on my first day as a freelancer.
                </li>
              </ul>
              <p>
                The opening should introduce tension or curiosity without giving away the entire
                story.
              </p>
            </div>

            <h4 className="mt-8 text-[18px] font-semibold">TikTok Hooks for UGC Videos</h4>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>
                UGC-style content often works best when it feels conversational rather than like a
                traditional advertisement.
              </p>
              <ul className="space-y-2.5 pl-5">
                <li className="list-disc">
                  Okay, I finally tried the thing everyone keeps talking about.
                </li>
                <li className="list-disc">I wasn't going to buy another one of these, but...</li>
                <li className="list-disc">
                  Here's what this actually looks like after two weeks of use.
                </li>
                <li className="list-disc">
                  If you're wondering whether this is actually worth it, here's my experience.
                </li>
              </ul>
              <p>
                If you're creating sponsored or promotional content, make sure your claims are
                accurate and disclose commercial relationships when required.
              </p>
            </div>

            <h4 className="mt-8 text-[18px] font-semibold">TikTok Hooks for Tutorials</h4>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>Tutorial hooks should quickly establish the outcome.</p>
              <ul className="space-y-2.5 pl-5">
                <li className="list-disc">
                  Here's how to remove the background from a photo in less than a minute.
                </li>
                <li className="list-disc">If you can draw a circle, you can make this.</li>
                <li className="list-disc">
                  Here's the shortcut I wish someone had shown me years ago.
                </li>
                <li className="list-disc">Turn this ordinary photo into this in three steps.</li>
              </ul>
              <p>
                Showing the final result while delivering the hook can make the benefit immediately
                visible.
              </p>
            </div>

            <h3 className="mt-10 text-[22px] font-semibold">What Makes a Bad TikTok Hook?</h3>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>A weak hook often delays the reason to watch.</p>
              <p>For example:</p>
              <p>
                <em>
                  Hey guys! Welcome back to my TikTok. So today I wanted to make a quick video
                  because I've been getting a few questions recently...
                </em>
              </p>
              <p>The viewer still doesn't know what the video is about.</p>
              <p>You could instead start with the question:</p>
              <p>
                <em>Here's why your videos look blurry after you upload them to TikTok.</em>
              </p>
              <p>Other common problems include:</p>
              <ul className="space-y-2.5 pl-5">
                <li className="list-disc">Long introductions</li>
                <li className="list-disc">Generic statements</li>
                <li className="list-disc">Hooks unrelated to the actual video</li>
                <li className="list-disc">Vague promises</li>
                <li className="list-disc">Excessive clickbait</li>
                <li className="list-disc">Copying viral hooks without adapting them</li>
                <li className="list-disc">Trying to explain too much at once</li>
                <li className="list-disc">Starting with branding instead of value</li>
              </ul>
              <p>Your hook should make the next few seconds feel worth watching.</p>
            </div>

            <h3 className="mt-10 text-[22px] font-semibold">
              Should You Say "Stop Scrolling" in a TikTok Hook?
            </h3>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>You can, but you don't need to.</p>
              <p>Phrases such as:</p>
              <ul className="space-y-2.5 pl-5">
                <li className="list-disc">Stop scrolling!</li>
                <li className="list-disc">Wait!</li>
                <li className="list-disc">You need to see this!</li>
              </ul>
              <p>
                attempt to command attention, but they don't explain why someone should keep
                watching.
              </p>
              <p>A more specific hook usually communicates more value.</p>
              <p>Instead of:</p>
              <p>
                <em>Stop scrolling if you love skincare!</em>
              </p>
              <p>Try:</p>
              <p>
                <em>If your sunscreen pills under makeup, try applying it this way.</em>
              </p>
              <p>
                The second version identifies both the audience and the reason to watch without
                explicitly telling anyone to stop scrolling.
              </p>
            </div>

            <h3 className="mt-10 text-[22px] font-semibold">How Long Should a TikTok Hook Be?</h3>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>There isn't one required hook length for every TikTok.</p>
              <p>
                What's more important is how quickly the viewer understands why they should continue
                watching.
              </p>
              <p>
                TikTok recommends prioritizing the hook during the first 6 seconds, with the content
                proposition introduced within the first 3 seconds.
              </p>
              <p>
                That doesn't mean every spoken hook needs to last exactly three or six seconds. A
                visual could communicate the idea almost instantly, while a spoken opening might
                take slightly longer.
              </p>
              <p>Aim to establish the core reason to watch as early as you reasonably can.</p>
            </div>

            <h3 className="mt-10 text-[22px] font-semibold">Use Visual Hooks, Not Just Words</h3>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>A TikTok hook isn't only a script.</p>
              <p>
                TikTok is a visual platform, so consider what the viewer sees during the opening as
                well as what they hear.
              </p>
              <p>Visual hooks can include:</p>
              <ul className="space-y-2.5 pl-5">
                <li className="list-disc">Showing the final result first</li>
                <li className="list-disc">An unexpected movement</li>
                <li className="list-disc">A close-up of the product</li>
                <li className="list-disc">A before-and-after comparison</li>
                <li className="list-disc">A person reacting to something</li>
                <li className="list-disc">On-screen text</li>
                <li className="list-disc">Starting a demonstration immediately</li>
                <li className="list-disc">An unusual object or setting</li>
                <li className="list-disc">A quick camera movement or transition</li>
              </ul>
              <p>For example, if your spoken hook is:</p>
              <p>
                <em>This $10 tool fixed the most annoying thing about my desk.</em>
              </p>
              <p>show the tool—or the annoying problem—at the same time.</p>
              <p>
                Your spoken hook, visual hook, and on-screen text should reinforce the same idea,
                not compete for attention.
              </p>
            </div>

            <h3 className="mt-10 text-[22px] font-semibold">Don't Confuse a Hook With Clickbait</h3>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>
                A strong TikTok hook creates curiosity about something the video actually delivers.
              </p>
              <p>Clickbait creates an expectation the content doesn't satisfy.</p>
              <p>For example:</p>
              <p>
                <em>This one trick will GUARANTEE you go viral overnight.</em>
              </p>
              <p>makes an unrealistic promise.</p>
              <p>A more credible version might be:</p>
              <p>
                <em>This change improved the watch time on our last five videos.</em>
              </p>
              <p>
                The second hook can still create curiosity without promising an outcome you cannot
                guarantee.
              </p>
              <p>
                Your goal isn't simply to get someone through the first three seconds. It's to make
                the rest of the video worth their attention.
              </p>
            </div>

            <h3 className="mt-10 text-[22px] font-semibold">How to Test Different TikTok Hooks</h3>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>You don't have to guess which opening will work best.</p>
              <p>For an important video concept, write several hooks before filming.</p>
              <p>For example, the same productivity video could begin with:</p>
              <p>
                <strong>Problem:</strong> Your to-do list might be making you less productive.
              </p>
              <p>
                <strong>Question:</strong> Why do you still feel behind after finishing your to-do
                list?
              </p>
              <p>
                <strong>Personal experience:</strong> I stopped making daily to-do lists for a week.
              </p>
              <p>
                <strong>How-to:</strong> Here's a simpler way to decide what to work on today.
              </p>
              <p>
                <strong>Contrarian:</strong> A longer to-do list isn't better planning.
              </p>
              <p>These are five different creative angles for essentially the same topic.</p>
              <p>
                Test different approaches over time and use your actual content performance to learn
                which hooks resonate with your audience. TikTok itself recommends continuous testing
                and learning rather than treating creative best practices as fixed rules.
              </p>
            </div>

            <h3 className="mt-10 text-[22px] font-semibold">Generate TikTok Hooks in Seconds</h3>
            <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-foreground">
              <p>You don't need to start every TikTok script with a blank page.</p>
              <p>
                Use the GeeLark TikTok Video Hook Generator to create attention-grabbing hook ideas
                based on your video topic, audience, and content style.
              </p>
              <p>
                Enter what your TikTok is about, choose the type of hook you want, and generate
                multiple opening ideas for:
              </p>
              <ul className="space-y-2.5 pl-5">
                <li className="list-disc">Educational TikToks</li>
                <li className="list-disc">Product videos</li>
                <li className="list-disc">UGC content</li>
                <li className="list-disc">Tutorials</li>
                <li className="list-disc">Storytelling videos</li>
                <li className="list-disc">Business TikToks</li>
                <li className="list-disc">Promotional videos</li>
                <li className="list-disc">Reviews and comparisons</li>
                <li className="list-disc">How-to videos</li>
              </ul>
              <p>
                Choose your favorite hook, personalize it to match your voice, and make sure the
                rest of your video delivers what the opening promises.
              </p>
              <p>A good TikTok hook doesn't need to shout "Stop scrolling."</p>
              <p>It needs to give the right viewer a reason not to.</p>
            </div>
          </article>
        </section>

        <section id="faq" className="mx-auto max-w-3xl px-5 pb-24">
          <h2 className="text-3xl font-medium md:text-4xl">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-border">
            {FAQS.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={f.q} className="py-5">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-medium text-foreground">{f.q}</span>
                    <ChevronDown
                      className={cn(
                        "ml-4 size-5 shrink-0 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-3xl font-medium md:text-4xl">More free tools for creators</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <Link
                key={tool.title}
                to={tool.href}
                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
              >
                <div>
                  <h3 className="text-base font-semibold">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {tool.description}
                  </p>
                </div>
                <span className="mt-5 ml-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {tool.cta} <ArrowUpRight className="size-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="overflow-hidden rounded-[var(--radius-3xl)] border border-border bg-[image:var(--gradient-primary)] px-8 py-14 text-center shadow-[var(--shadow-lift)]">
            <h2 className="text-3xl font-medium text-primary-foreground md:text-4xl">
              Write it here. Post it from anywhere.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-primary-foreground/85">
              Spin up your first GeeLark cloud phone in under a minute and publish your new video
              today.
            </p>
            <a
              href="https://www.geelark.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-secondary px-7 py-2 text-[16px] font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80"
            >
              Start free <ChevronRight className="size-4" />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
