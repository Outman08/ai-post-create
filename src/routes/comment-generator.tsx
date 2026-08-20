import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Check, Copy, Sparkles, ArrowRight, ArrowUpRight, ChevronLeft } from "lucide-react";
import { generateComments } from "@/lib/comments.functions";
import { cn } from "@/lib/utils";
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

  // iframe 高度自适应
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

  const run = useServerFn(generateComments);
  const mutation = useMutation({
    mutationFn: () => run({ data: { post, tone, platform, intent } }),
  });

  const copy = async (text: string, i: number) => {
    await navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-5 pt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to all tools
        </Link>
      </div>

      <main>
        <section id="generator" className="px-5 pt-12 pb-20">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-[56px] font-medium leading-tight tracking-tight">
              AI comment generator
            </h1>
          </div>

          <div className="mx-auto mt-12 max-w-4xl rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
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

        <section id="how-it-works" className="px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-medium sm:text-4xl">From comment box to conversation</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
                  <span className="text-sm font-bold text-brand">0{i + 1}</span>
                  <h3 className="mt-3 text-[22px] font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="guide" className="px-5 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-medium sm:text-4xl">
              How to Write Better Social Media Comments with AI
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              A good social media comment does more than say 'Nice post!' It adds something relevant
              to the conversation, responds to what was actually shared, and gives the creator or
              other users a reason to engage.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The GeeLark AI Comment Generator helps you turn a social media post, topic, or idea
              into natural comment suggestions in seconds. You can use it to brainstorm comments for
              platforms such as Instagram, TikTok, YouTube, Facebook, LinkedIn, and other social
              networks.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Whether you want a comment that sounds friendly, professional, funny, supportive, or
              conversational, AI can give you a useful starting point. The final comment should
              still be reviewed and adapted to the actual conversation before you post it.
            </p>

            <h3 className="mt-12 text-[22px] font-semibold">What Is an AI Comment Generator?</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              An AI comment generator is a tool that creates comment suggestions based on the
              context you provide.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Instead of trying to think of a response from scratch, you can enter the post,
              caption, topic, or key message and generate several possible comments.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              For example, imagine you're responding to a post about five lessons someone learned
              while building their first business.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              A generic comment might be:
            </p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              Great post! 🔥
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              A more meaningful comment could be:
            </p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              The point about talking to customers before building really stands out. It's easy to
              spend months solving a problem people don't actually have.
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The second comment demonstrates that you understood the content and gives the original
              poster something they can respond to.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              That's where an AI comment generator is most useful: helping you find a relevant angle
              quickly, rather than filling comment sections with generic responses.
            </p>

            <h3 className="mt-12 text-[22px] font-semibold">How to Use the AI Comment Generator</h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Creating a comment with GeeLark takes just a few steps.
            </p>

            <h4 className="mt-8 text-lg font-semibold">1. Add the Post or Context</h4>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Start by entering the social media post you want to respond to, or describe what the
              post is about.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The more useful context you provide, the easier it is to generate a relevant comment.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">Instead of entering:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              Marketing post
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">Try:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              A LinkedIn post arguing that startups should focus on customer retention before
              spending more money on acquisition.
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              This gives the AI enough information to understand the conversation.
            </p>

            <h4 className="mt-8 text-lg font-semibold">2. Choose Your Comment Style</h4>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Decide how you want the comment to sound.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Depending on the situation, you might choose a tone such as:
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                "Friendly",
                "Professional",
                "Casual",
                "Funny",
                "Supportive",
                "Curious",
                "Enthusiastic",
                "Thoughtful",
              ].map((t) => (
                <li key={t} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Match the tone to both the platform and the original post.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              A playful TikTok video may invite a completely different response from a professional
              LinkedIn discussion.
            </p>

            <h4 className="mt-8 text-lg font-semibold">3. Generate Comment Ideas</h4>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Generate several comments and compare the results.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Don't automatically choose the first suggestion. Look for the option that best
              reflects what you actually want to say.
            </p>

            <h4 className="mt-8 text-lg font-semibold">4. Personalize Your Comment</h4>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Before posting, add your own perspective when appropriate.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              A generated comment such as:
            </p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              That's a great point about consistency. Small improvements really add up over time.
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">could become:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              That's a great point about consistency. We saw something similar when we stopped
              changing our content strategy every two weeks and gave each experiment more time.
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The second version is more specific because it contributes a real experience to the
              discussion.
            </p>

            <h3 className="mt-12 text-[22px] font-semibold">
              How to Write a Good Social Media Comment
            </h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              The best comments usually feel like part of a conversation rather than a piece of
              promotion.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Here are several principles to keep in mind.
            </p>

            <h4 className="mt-8 text-lg font-semibold">Respond to Something Specific</h4>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Reference an idea, example, question, or detail from the original content.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">Instead of:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              Very insightful!
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">Try:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              Your point about testing the hook before changing the entire video is especially
              useful. That's an easy variable to overlook.
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Specificity signals that the comment is actually connected to the post.
            </p>

            <h4 className="mt-8 text-lg font-semibold">Add Something to the Conversation</h4>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              You don't always need to agree with the creator. A useful comment can contribute:
            </p>
            <ul className="mt-3 space-y-2">
              {[
                "A related experience",
                "An additional example",
                "A useful observation",
                "A respectful alternative perspective",
                "A follow-up question",
                "A practical tip",
              ].map((t) => (
                <li key={t} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">For example:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              We've found the same thing with short-form video. I'd add that the first frame matters
              almost as much as the opening line, especially when people are scrolling quickly.
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Now the comment provides information instead of simply offering praise.
            </p>

            <h4 className="mt-8 text-lg font-semibold">Ask Questions That Are Easy to Answer</h4>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Questions can encourage conversation when they're genuinely relevant.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">Instead of:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              Thoughts?
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">Try:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              Did you notice the biggest improvement from changing the topic, the hook, or the
              editing style?
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              A specific question gives the other person something concrete to respond to.
            </p>

            <h4 className="mt-8 text-lg font-semibold">Keep the Comment Relevant</h4>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Avoid forcing your product, website, or service into an unrelated conversation.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">For example:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              Great advice! By the way, check out our marketing software...
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              may feel promotional even if the first sentence is relevant.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              If your company or experience genuinely relates to the discussion, explain the
              connection naturally rather than turning every comment into an advertisement.
            </p>

            <h4 className="mt-8 text-lg font-semibold">Avoid Generic AI Comments</h4>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              One of the biggest risks of using an AI comment generator is producing comments that
              technically make sense but don't say anything meaningful.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">Common examples include:</p>
            <ul className="mt-3 space-y-2">
              {[
                "Great insights! Thanks for sharing.",
                "This is so valuable! 🔥",
                "Couldn't agree more!",
                "Absolutely! Consistency is key.",
                "Love this perspective!",
              ].map((t) => (
                <li key={t} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              There is nothing inherently wrong with short supportive comments. But if every
              response follows the same pattern, your comments can quickly feel automated.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              A stronger comment usually includes at least one detail connected to the original
              content.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">For example:</p>
            <p className="mt-3 font-semibold text-foreground">Generic:</p>
            <div className="mt-1 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              Great tips! This is really helpful.
            </div>
            <p className="mt-4 font-semibold text-foreground">Better:</p>
            <div className="mt-1 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              The suggestion to repurpose customer questions into content is a good one. It solves
              the 'what should we post?' problem while keeping the topics grounded in what customers
              actually care about.
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              AI should help you create a more relevant response—not remove the need to understand
              what you're responding to.
            </p>

            <h3 className="mt-12 text-[22px] font-semibold">
              AI Comment Examples for Different Social Media Platforms
            </h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Different social networks have different communities and communication styles. Adapt
              your comment to the platform instead of posting the exact same response everywhere.
            </p>

            <h4 className="mt-8 text-lg font-semibold">Instagram Comment Examples</h4>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Instagram comments often work well when they're concise and directly related to the
              photo, Reel, carousel, or caption.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">For a travel Reel:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              That sunrise view alone looks worth the early wake-up 😍 Was this crowded when you
              went?
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              For an educational carousel:
            </p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              Slide 4 is such an important point. It's easy to focus on posting more when improving
              the actual message might make a bigger difference.
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              For a product announcement:
            </p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              The new design looks clean 👏 Curious to see how the new workflow works in practice.
            </div>

            <h4 className="mt-8 text-lg font-semibold">TikTok Comment Examples</h4>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              TikTok comments are often shorter and more conversational.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">For a tutorial:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              The fact that step 2 was the problem the whole time 😭 This would've saved me an hour.
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">For a travel video:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              Adding this to the list immediately ✈️ What month did you visit?
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">For an educational TikTok:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              That last tip deserves its own video 👀
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              A TikTok comment doesn't need to be long to be relevant. It simply needs to fit
              naturally into the conversation.
            </p>

            <h4 className="mt-8 text-lg font-semibold">YouTube Comment Examples</h4>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              YouTube gives viewers an opportunity to respond to longer-form content, so comments
              can often go deeper into a particular point from the video.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">For a tutorial:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              The explanation around 6:20 finally made this click for me. I had been changing both
              variables at once, which explains why my tests were impossible to compare.
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">For an educational video:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              Interesting point about retention being more important than views alone. I'd be
              curious to see a follow-up comparing retention across different video lengths.
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">For a review:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              Really appreciate that you showed the limitations as well as the good parts. How has
              it held up after using it for a few months?
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Referencing something specific from the video can make a YouTube comment considerably
              more useful than a generic response.
            </p>

            <h4 className="mt-8 text-lg font-semibold">LinkedIn Comment Examples</h4>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              LinkedIn comments often benefit from professional context, personal experience, or a
              thoughtful question.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">For an industry post:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              The point about distribution is important. Teams often spend most of their resources
              creating content and comparatively little thinking about how the right audience will
              actually find it.
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">For a founder story:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              This is a useful reminder that early customer feedback doesn't always mean adding more
              features. Sometimes the better decision is simplifying what already exists.
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">For a data-driven post:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              Interesting result. Do you think the improvement came primarily from the new
              positioning, or did the change in audience targeting play a significant role too?
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Avoid turning every LinkedIn comment into a miniature essay. Say as much as you need
              to make your point.
            </p>

            <h4 className="mt-8 text-lg font-semibold">Facebook Comment Examples</h4>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Facebook comments can range from quick reactions to longer discussions, depending on
              whether you're interacting with a business Page, Group, creator, or community.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">For a local business post:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              These look amazing! Is the seasonal menu available all month?
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              For a community discussion:
            </p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              We tried something similar last year. Starting with a smaller group made organizing
              everything much easier before opening it up to everyone.
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">For an educational post:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              The second tip worked well for us. I'd also recommend testing one change at a time so
              you can tell what actually affected the result.
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              As with other platforms, context matters more than following one fixed comment
              formula.
            </p>

            <h3 className="mt-12 text-[22px] font-semibold">
              How Long Should a Social Media Comment Be?
            </h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              There is no perfect comment length.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              A useful comment could be five words or several paragraphs depending on the
              conversation.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">For example:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              Where was this filmed? 👀
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              is perfectly reasonable when responding to a travel video.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              But if you're contributing to a detailed professional discussion, a longer response
              may be more appropriate.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Instead of aiming for a specific character count, ask:
            </p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              Does the comment say everything it needs to say without unnecessary filler?
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              If yes, it's probably long enough.
            </p>

            <h3 className="mt-12 text-[22px] font-semibold">
              Can AI Generate Replies to Social Media Comments?
            </h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Yes. An AI comment generator can also help you brainstorm responses to comments people
              leave on your own content.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              For example, suppose someone comments:
            </p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              We've been struggling with exactly this. How do you decide which content ideas are
              worth testing?
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              A useful response might be:
            </p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              We usually start with questions customers are already asking, then prioritize ideas
              that connect those questions to a clear problem we can help solve. It gives us a much
              stronger starting point than brainstorming topics from scratch.
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              For brands and creators, replying thoughtfully can be just as important as writing the
              original post.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              AI can help draft the response, but make sure factual questions, complaints, support
              requests, and sensitive conversations are reviewed carefully before replying.
            </p>

            <h3 className="mt-12 text-[22px] font-semibold">
              How to Make AI-Generated Comments Sound More Natural
            </h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              If a generated comment sounds too generic or robotic, don't just regenerate it
              repeatedly. Give the AI better instructions.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Provide information such as:
            </p>
            <ul className="mt-3 space-y-2">
              {[
                "The original post: What exactly are you responding to?",
                "Platform: Is this Instagram, TikTok, YouTube, LinkedIn, or somewhere else?",
                "Your perspective: Do you agree, disagree, have experience with the topic, or want to learn more?",
                "Tone: Should the response be casual, professional, funny, curious, or supportive?",
                "Length: Do you want a quick reaction or a more thoughtful response?",
              ].map((t) => (
                <li key={t} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">For example, instead of:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              Generate a LinkedIn comment about this post.
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">Try:</p>
            <div className="mt-3 rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
              Write a short LinkedIn comment responding to the author's point about content
              distribution. Agree with the main argument, add that teams often spend too much time
              creating content compared with distributing it, and keep the tone conversational.
            </div>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Better context generally leads to more specific comments.
            </p>

            <h3 className="mt-12 text-[22px] font-semibold">
              Should You Use AI-Generated Comments?
            </h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              AI-generated comments can save time when they're used to help you think and write,
              rather than to imitate genuine engagement at scale.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">Good uses include:</p>
            <ul className="mt-3 space-y-2">
              {[
                "Brainstorming ways to respond",
                "Improving the wording of a comment",
                "Turning an idea into a concise response",
                "Adjusting your tone for a platform",
                "Generating follow-up questions",
                "Drafting replies to comments on your own posts",
              ].map((t) => (
                <li key={t} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Before publishing an AI-generated comment, check that it:
            </p>
            <ul className="mt-3 space-y-2">
              {[
                "Accurately reflects the original content",
                "Says something you genuinely want to communicate",
                "Doesn't invent personal experiences or facts",
                "Matches the context and tone",
                "Doesn't make unsupported claims",
                "Doesn't sound like generic spam",
              ].map((t) => (
                <li key={t} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              If the AI writes, 'I tried this last year and it completely changed my business,'
              don't post it unless that's actually true.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              AI can help with the words. You remain responsible for what the comment says.
            </p>

            <h3 className="mt-12 text-[22px] font-semibold">
              Create Social Media Comments in Seconds
            </h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Use the GeeLark AI Comment Generator to create relevant comment ideas without starting
              from a blank box.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Add the post or topic you want to respond to, choose your preferred tone, and generate
              comments for Instagram, TikTok, YouTube, Facebook, LinkedIn, and other social
              platforms.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              You can generate a quick reaction, thoughtful response, question, professional
              comment, or casual reply—and then personalize it before posting.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The goal isn't to comment more for the sake of commenting. It's to make it easier to
              contribute something worth reading.
            </p>
          </div>
        </section>

        <section id="faq" className="px-5 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-medium sm:text-4xl">Frequently asked questions</h2>
            <Accordion type="single" collapsible className="mt-8">
              {FAQS.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left text-base font-semibold">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section id="more-tools" className="px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
              More free tools for creators
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS.map((t) => (
                <Link
                  key={t.title}
                  to={t.href}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
                >
                  <div>
                    <h3 className="text-base font-semibold">{t.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t.description}
                    </p>
                  </div>
                  <span className="mt-5 ml-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {t.cta}
                    <ArrowUpRight className="size-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-24">
          <div className="mx-auto max-w-4xl rounded-3xl bg-brand px-8 py-16 text-center text-brand-foreground shadow-glow">
            <h2 className="text-3xl font-medium sm:text-4xl">
              Write it here. Reply from anywhere.
            </h2>
            <p className="mx-auto mt-4 max-w-xl opacity-90">
              Draft the comment, then send it from a real cloud phone with its own identity.
            </p>
            <a
              href="#generator"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-card px-6 py-3 font-medium text-foreground transition hover:opacity-90"
            >
              Start free
              <ArrowRight className="size-4" />
            </a>
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
