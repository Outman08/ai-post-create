import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Heart,
  MessageCircle,
  Repeat2,
  Smartphone,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  PLATFORMS,
  TONES,
  generatePosts,
  type Platform,
  type Tone,
} from "@/components/post-creator/generator";

const TITLE = "Free AI Social Media Post Creator | GeeLark";
const DESCRIPTION =
  "Generate scroll-stopping posts for TikTok, Instagram, X, LinkedIn and Facebook in seconds — then publish them from real cloud phones with GeeLark.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PostCreatorPage,
});

function PostCreatorPage() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>(PLATFORMS[0] as Platform);
  const [tone, setTone] = useState<Tone>("Friendly");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [posts, setPosts] = useState<string[]>([]);
  const [regenerateKey, setRegenerateKey] = useState(0);

  const fetchPosts = useCallback(
    async (currentTopic: string, currentPlatform: Platform, currentTone: Tone) => {
      setLoading(true);
      try {
        const generatedPosts = await generatePosts(currentTopic, currentPlatform, currentTone);
        setPosts(generatedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  function run(next?: string) {
    const value = (next ?? topic).trim();
    if (!value) return;
    setTopic(value);
    setCopied(null);
    setSubmitted(value);
    // fetchPosts(value, platform, tone);
  }

  function regenerate() {
    if (!submitted) return;
    setRegenerateKey((k) => k + 1);
    fetchPosts(submitted, platform, tone);
  }

  useEffect(() => {
    if (submitted) {
      fetchPosts(submitted, platform, tone);
    }
  }, [submitted, platform, tone, fetchPosts]);

  async function copy(text: string, index: number) {
    await navigator.clipboard.writeText(text);
    setCopied(index);
    window.setTimeout(() => setCopied(null), 1600);
  }
  // 发送页面高度给父窗口
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

    // 页面加载、窗口resize、dom变化都上报高度
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
    <div className="bg-white text-foreground">
      <main>
        {/* Hero + creator */}
        <section id="creator" className="">
          <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 md:pt-24">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-[56px] font-medium leading-[1.05] text-foreground md:text-[56px]">
                AI post creator
              </h1>
            </div>

            {/* Composer */}
            <div className="mx-auto mt-10 max-w-5xl rounded-[var(--radius-2xl)] border border-border bg-card p-2 shadow-[var(--shadow-lift)]">
              <div className="rounded-[var(--radius-xl)] bg-card p-4 md:p-5">
                <h3 className="text-center text-[20px] font-medium">What is your post about?</h3>
                <div className="relative mt-3">
                  <Textarea
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. launching our new multi-account cloud phone plan for TikTok sellers"
                    className="min-h-32 resize-none border-0 bg-muted/60 text-[16px] focus-visible:ring-1"
                  />
                </div>

                <div className="mt-4">
                  <div className="text-[14px] font-medium text-foreground">Platform</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlatform(p)}
                        className={`rounded-full px-4 py-2 text-[14px] transition-colors ${
                          platform.id === p.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-[14px] font-medium text-foreground">Tone</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {TONES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTone(t)}
                        className={`rounded-full px-4 py-2 text-[14px] transition-colors ${
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

                <div className="mt-4 flex">
                  <Button
                    onClick={() => run()}
                    disabled={!topic.trim() || loading}
                    className="w-full rounded-[8px] px-6 text-[16px]"
                  >
                    {loading ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    {loading ? "Writing…" : "Generate post"}
                  </Button>
                </div>

                <p className="mt-3 text-center text-[16px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Pro tip:</span> Include the
                  platform, key points, your target audience and your desired outcome for this post.
                </p>
              </div>
            </div>

            {/* Results */}
            {submitted ? (
              <div className="mx-auto mt-14 max-w-5xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">3 drafts for {platform.name}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={regenerate}
                    disabled={loading}
                    className="rounded-full"
                  >
                    <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                    Regenerate
                  </Button>
                </div>

                {loading ? (
                  <div className="mt-5 grid gap-5 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <article
                        key={i}
                        className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-gray-200 animate-pulse" />
                          <div className="space-y-2">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                          <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
                          <div className="h-3 w-4/6 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 grid gap-5 md:grid-cols-3">
                    {posts.map((post, i) => (
                      <article
                        key={`${i}-${regenerateKey}`}
                        className="flex flex-col rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-full bg-[image:var(--gradient-primary)]" />
                          <div className="leading-tight">
                            <p className="text-sm font-semibold">GeeLark</p>
                            <p className="text-xs text-muted-foreground">{platform.handleLabel}</p>
                          </div>
                        </div>
                        <p className="mt-4 flex-1 whitespace-pre-line text-sm leading-relaxed">
                          {post}
                        </p>
                        <div className="mt-auto flex items-center gap-5 border-t border-border pt-4 text-muted-foreground">
                          <span className="flex items-center gap-1.5 text-xs">
                            <Heart className="size-4" /> 128
                          </span>
                          <span className="flex items-center gap-1.5 text-xs">
                            <MessageCircle className="size-4" /> 24
                          </span>
                          <span className="flex items-center gap-1.5 text-xs">
                            <Repeat2 className="size-4" /> 9
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-8 rounded-full px-3"
                            onClick={() => copy(post, i)}
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
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <div className="max-w-xl">
              <h2 className="text-[32px] font-medium md:text-[32px]">From prompt to published</h2>
            </div>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Describe the post",
                  body: "Give the AI a topic, pick a platform and a tone. You get three distinct drafts, not three rewordings.",
                },
                {
                  n: "02",
                  title: "Pick and polish",
                  body: "Copy the draft you like, tweak the hook, and keep the hashtags that fit your niche.",
                },
                {
                  n: "03",
                  title: "Publish from a cloud phone",
                  body: "Each account posts from its own Android cloud phone with a unique fingerprint and proxy.",
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

        {/* SEO educational content */}
        <section id="guide" className="mx-auto max-w-6xl px-5 py-20">
          <article className="mx-auto max-w-3xl">
            <h2 className="text-[32px] font-medium">How to Create Better Social Media Posts</h2>

            <p className="mt-4 text-[16px]">
              Creating a social media post is easy. Creating one that makes someone stop scrolling,
              understand your message, and take action is much harder.
            </p>
            <p className="mt-4 text-[16px]">
              A strong social media post usually combines four elements: a clear idea, an
              attention-grabbing opening, useful or interesting content, and a reason to engage. The
              exact format should then be adapted to the platform and audience you're posting for.
            </p>
            <p className="mt-4 text-[16px]">
              The GeeLark Social Media Post Creator helps you turn a topic, product, promotion, or
              idea into ready-to-use social media content. Instead of starting with a blank page,
              you can generate a post and customize it for your brand, audience, and preferred
              social platform.
            </p>

            <h3 className="mt-10 text-[22px] font-semibold">
              What Is a Social Media Post Creator?
            </h3>
            <p className="mt-4 text-[16px]">
              A social media post creator is a tool that helps you create content for platforms such
              as Instagram, Facebook, LinkedIn, X, and other social networks.
            </p>
            <p className="mt-4 text-[16px]">
              An AI social media post creator can take a simple input such as:
            </p>
            <p className="mt-4 text-[16px] italic">
              Announce the launch of our new productivity app for freelancers.
            </p>
            <p className="mt-4 text-[16px]">
              And turn it into a more complete post with an opening hook, main message, call to
              action, and other elements appropriate for social media.
            </p>
            <p className="mt-4 text-[16px]">This can be useful when you need to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-[16px]">
              <li>Promote a product or service</li>
              <li>Announce a launch or company update</li>
              <li>Share an educational tip</li>
              <li>Create promotional posts</li>
              <li>Turn an article into social content</li>
              <li>Promote an event</li>
              <li>Ask your audience a question</li>
              <li>Share an offer or discount</li>
              <li>Create posts for multiple social platforms</li>
              <li>Generate new social media post ideas</li>
            </ul>
            <p className="mt-4 text-[16px]">
              The generated post should be treated as a starting point. Review the content, add your
              own expertise or brand personality, and make sure it fits the platform where you plan
              to publish it.
            </p>

            <h3 className="mt-10 text-[22px] font-semibold">How to Create a Social Media Post</h3>
            <p className="mt-4 text-[16px]">
              You don't need to write every social media post from scratch. Start with the
              information that matters most and build the post around it.
            </p>

            <h4 className="mt-6 text-[18px] font-semibold">
              1. Decide What You Want the Post to Achieve
            </h4>
            <p className="mt-3 text-[16px]">Every post should have a purpose.</p>
            <p className="mt-4 text-[16px]">
              Before writing, ask what you want someone to do after seeing the post.
            </p>
            <p className="mt-4 text-[16px]">Common social media goals include:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-[16px]">
              <li>Awareness: Introduce your brand, product, or idea.</li>
              <li>Engagement: Encourage comments, shares, reactions, or discussion.</li>
              <li>
                Traffic: Give people a reason to visit a website, article, product page, or other
                destination.
              </li>
              <li>
                Conversion: Encourage an action such as signing up, downloading, booking, or
                purchasing.
              </li>
              <li>Education: Teach your audience something useful.</li>
            </ul>
            <p className="mt-4 text-[16px]">
              Trying to accomplish everything in a single post can weaken the message. Choosing one
              primary objective makes it easier to decide what to write and which call to action to
              use.
            </p>

            <h4 className="mt-6 text-[18px] font-semibold">2. Start With a Strong Hook</h4>
            <p className="mt-3 text-[16px]">
              The first line of a social media post has an important job: convincing someone to
              continue reading or watching.
            </p>
            <p className="mt-4 text-[16px]">Compare:</p>
            <p className="mt-2 text-[16px] italic">
              Generic: Here are some tips for social media marketing.
            </p>
            <p className="mt-2 text-[16px] italic">
              More specific: Posting every day but still getting no engagement? Try these 5 changes.
            </p>
            <p className="mt-4 text-[16px]">A useful social media hook can:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-[16px]">
              <li>Ask a relevant question</li>
              <li>Identify a common problem</li>
              <li>Make a specific promise</li>
              <li>Share an interesting result</li>
              <li>Challenge an assumption</li>
              <li>Create curiosity</li>
              <li>Lead with a useful takeaway</li>
            </ul>
            <p className="mt-4 text-[16px]">
              Avoid exaggerated hooks that the rest of the post cannot support. Getting attention
              matters, but delivering on the opening is what makes the post useful.
            </p>

            <h4 className="mt-6 text-[18px] font-semibold">
              3. Make the Main Message Easy to Understand
            </h4>
            <p className="mt-3 text-[16px]">Once you have someone's attention, get to the point.</p>
            <p className="mt-4 text-[16px]">
              Social feeds move quickly, so readers should not have to work hard to understand what
              you're trying to say.
            </p>
            <p className="mt-4 text-[16px]">Instead of:</p>
            <p className="mt-2 text-[16px] italic">
              We are delighted to announce that after many months of work, our team is incredibly
              excited to finally introduce the latest version of our platform.
            </p>
            <p className="mt-4 text-[16px]">Consider:</p>
            <p className="mt-2 text-[16px] italic">Our biggest product update is live.</p>
            <p className="mt-4 text-[16px]">Then explain what changed and why it matters.</p>
            <p className="mt-4 text-[16px]">
              Short paragraphs, line breaks, and lists can also make longer posts easier to scan.
            </p>

            <h4 className="mt-6 text-[18px] font-semibold">4. Give People a Reason to Care</h4>
            <p className="mt-3 text-[16px]">
              A social media post should not only explain what happened. It should communicate why
              the information matters to the audience.
            </p>
            <p className="mt-4 text-[16px]">For a product announcement, don't stop at:</p>
            <p className="mt-2 text-[16px] italic">We just launched automatic reporting.</p>
            <p className="mt-4 text-[16px]">Explain the benefit:</p>
            <p className="mt-2 text-[16px] italic">
              Automatic reporting is live. You can now turn campaign data into a weekly report
              without building the same spreadsheet every Friday.
            </p>
            <p className="mt-4 text-[16px]">
              Specific benefits usually make stronger content than broad claims such as "save time"
              or "work smarter."
            </p>

            <h4 className="mt-6 text-[18px] font-semibold">5. Add a Clear Call to Action</h4>
            <p className="mt-3 text-[16px]">
              A call to action tells readers what they can do next.
            </p>
            <p className="mt-4 text-[16px]">Depending on your goal, that could be:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-[16px]">
              <li>Learn more</li>
              <li>Read the full guide</li>
              <li>Try it for free</li>
              <li>Tell us what you think</li>
              <li>Save this post for later</li>
              <li>Share it with your team</li>
              <li>Download the template</li>
              <li>Watch the full video</li>
              <li>Sign up for the event</li>
            </ul>
            <p className="mt-4 text-[16px]">Your CTA doesn't always need to sell something.</p>
            <p className="mt-4 text-[16px]">
              For an educational post, "Which of these have you tried?" may be more appropriate than
              "Buy now."
            </p>
            <p className="mt-4 text-[16px]">
              Choose a CTA that naturally follows from the content.
            </p>

            <h3 className="mt-10 text-[22px] font-semibold">
              How Long Should a Social Media Post Be?
            </h3>
            <p className="mt-4 text-[16px]">
              There is no universal ideal length for a social media post.
            </p>
            <p className="mt-4 text-[16px]">
              Different platforms have different technical limits and, more importantly, different
              user behaviors. A post that works on LinkedIn may need significant changes before it
              works well on X or Instagram.
            </p>
            <p className="mt-4 text-[16px]">
              For example, a standard post on X is limited to 280 characters, while X Premium
              subscribers can create longer posts of up to 25,000 characters.
            </p>
            <p className="mt-4 text-[16px]">A LinkedIn post can contain up to 3,000 characters.</p>
            <p className="mt-4 text-[16px]">
              But a maximum character limit should not be treated as a recommended length.
            </p>
            <p className="mt-4 text-[16px]">
              A post should be long enough to communicate its message and short enough to avoid
              unnecessary information. If you can communicate an idea clearly in two sentences,
              don't turn it into eight paragraphs just to make the post look substantial.
            </p>

            <h3 className="mt-10 text-[22px] font-semibold">
              How to Adapt a Post for Different Social Media Platforms
            </h3>
            <p className="mt-4 text-[16px]">
              One idea can work across several social networks, but copying and pasting exactly the
              same post everywhere isn't always the best approach.
            </p>
            <p className="mt-4 text-[16px]">
              Adapt the structure, tone, length, and CTA to how people use each platform.
            </p>

            <h4 className="mt-6 text-[18px] font-semibold">Instagram Posts</h4>
            <p className="mt-3 text-[16px]">
              Instagram is highly visual, so the image, carousel, or video usually carries much of
              the initial attention.
            </p>
            <p className="mt-4 text-[16px]">
              Use the caption to provide context, tell a story, explain the content, or encourage an
              action.
            </p>
            <p className="mt-4 text-[16px]">For example:</p>
            <p className="mt-2 text-[16px] italic">
              Three content mistakes we see brands make every week 👇
              <br />
              Creating without a clear audience
              <br />
              Talking only about the product
              <br />
              Posting without learning from previous results
              <br />
              Which one would you fix first?
            </p>

            <h4 className="mt-6 text-[18px] font-semibold">Facebook Posts</h4>
            <p className="mt-3 text-[16px]">
              Facebook can accommodate everything from short updates to longer stories and
              community-focused posts.
            </p>
            <p className="mt-4 text-[16px]">A good Facebook post might include:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-[16px]">
              <li>A clear opening</li>
              <li>Useful context</li>
              <li>An image or video when relevant</li>
              <li>A question or CTA</li>
            </ul>
            <p className="mt-4 text-[16px]">
              For businesses, write for the audience rather than making every post sound like an
              advertisement.
            </p>

            <h4 className="mt-6 text-[18px] font-semibold">LinkedIn Posts</h4>
            <p className="mt-3 text-[16px]">
              LinkedIn posts can contain up to 3,000 characters, allowing more room for professional
              insights, lessons, opinions, company updates, and educational content.
            </p>
            <p className="mt-4 text-[16px]">For example:</p>
            <p className="mt-2 text-[16px] italic">
              We changed one thing in our onboarding process last month.
              <br />
              Instead of showing new users every feature, we focused on helping them complete one
              meaningful task.
              <br />
              The lesson: onboarding isn't about teaching the entire product. It's about helping
              users reach value faster.
            </p>
            <p className="mt-4 text-[16px]">
              You don't need to use all 3,000 characters. Use the space your idea actually requires.
            </p>

            <h4 className="mt-6 text-[18px] font-semibold">X Posts</h4>
            <p className="mt-3 text-[16px]">
              For standard X posts, you have up to 280 characters, so concise writing becomes
              especially important.
            </p>
            <p className="mt-4 text-[16px]">For example:</p>
            <p className="mt-2 text-[16px] italic">
              You don't need more content ideas.
              <br />
              You need a better system for turning one good idea into 10 useful posts.
              <br />
              Create once. Repurpose intelligently. Distribute consistently.
            </p>
            <p className="mt-4 text-[16px]">
              X Premium also supports longer posts, but short-form writing remains useful when the
              message can be communicated concisely.
            </p>

            <h3 className="mt-10 text-[22px] font-semibold">
              Should You Post the Same Content on Every Social Media Platform?
            </h3>
            <p className="mt-4 text-[16px]">
              You can reuse the idea, but you don't necessarily need to reuse the exact wording.
            </p>
            <p className="mt-4 text-[16px]">
              Suppose you want to share the same customer success story across three platforms.
            </p>
            <p className="mt-4 text-[16px]">
              On LinkedIn, you might explain the problem, solution, result, and lesson in a longer
              professional post.
            </p>
            <p className="mt-4 text-[16px]">
              On Instagram, you could turn the results into a carousel and use the caption to
              provide additional context.
            </p>
            <p className="mt-4 text-[16px]">
              On X, you might extract the strongest insight and communicate it in a few sentences or
              a thread.
            </p>
            <p className="mt-4 text-[16px]">
              This approach lets you get more value from one piece of content without making every
              social account feel identical.
            </p>

            <h3 className="mt-10 text-[22px] font-semibold">
              Social Media Post Ideas for Businesses and Creators
            </h3>
            <p className="mt-4 text-[16px]">
              Not sure what to post? Start with repeatable content categories rather than trying to
              invent an entirely new concept every day.
            </p>

            <h4 className="mt-6 text-[18px] font-semibold">Educational Posts</h4>
            <p className="mt-3 text-[16px]">Teach your audience something useful.</p>
            <p className="mt-4 text-[16px]">Examples:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-[16px]">
              <li>5 mistakes to avoid when launching your first online store</li>
              <li>Here's the simplest way to improve your video hooks</li>
              <li>Three things we learned from analyzing 100 campaigns</li>
            </ul>

            <h4 className="mt-6 text-[18px] font-semibold">Behind-the-Scenes Posts</h4>
            <p className="mt-3 text-[16px]">Show the people or processes behind your brand.</p>
            <p className="mt-4 text-[16px]">Examples:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-[16px]">
              <li>Here's what happens before we launch a new feature.</li>
              <li>A look at how we create our videos from idea to final edit.</li>
            </ul>

            <h4 className="mt-6 text-[18px] font-semibold">Product Posts</h4>
            <p className="mt-3 text-[16px]">
              Show what your product does through a specific use case or benefit.
            </p>
            <p className="mt-4 text-[16px]">Instead of:</p>
            <p className="mt-2 text-[16px] italic">
              Our software has a powerful automation feature.
            </p>
            <p className="mt-4 text-[16px]">Try:</p>
            <p className="mt-2 text-[16px] italic">
              Publishing the same content across 20 accounts manually takes time. Here's how we
              automate the repetitive part.
            </p>

            <h4 className="mt-6 text-[18px] font-semibold">Question Posts</h4>
            <p className="mt-3 text-[16px]">Invite your audience into the conversation.</p>
            <p className="mt-4 text-[16px]">For example:</p>
            <p className="mt-2 text-[16px] italic">
              What's the one social media task you would automate if you could?
            </p>
            <p className="mt-4 text-[16px]">
              Questions work best when they're easy to understand and relevant to the people
              following you.
            </p>

            <h4 className="mt-6 text-[18px] font-semibold">Customer Story Posts</h4>
            <p className="mt-3 text-[16px]">
              Show how a real customer approached a problem and what happened.
            </p>
            <p className="mt-4 text-[16px]">A simple structure is:</p>
            <p className="mt-2 text-[16px] italic">Problem → Approach → Result → Lesson</p>
            <p className="mt-4 text-[16px]">
              This often makes a more convincing post than listing product features.
            </p>

            <h4 className="mt-6 text-[18px] font-semibold">List Posts</h4>
            <p className="mt-3 text-[16px]">
              Turn useful information into a format that is easy to scan.
            </p>
            <p className="mt-4 text-[16px]">For example:</p>
            <p className="mt-2 text-[16px] italic">
              5 things to check before publishing your next Instagram post:
              <br />
              Is the hook specific?
              <br />
              Is the main idea clear?
              <br />
              Does the visual support the message?
              <br />
              Is there unnecessary text?
              <br />
              Is the next action obvious?
            </p>

            <h3 className="mt-10 text-[22px] font-semibold">
              How to Write Social Media Posts With AI
            </h3>
            <p className="mt-4 text-[16px]">
              AI can speed up social media content creation, but better input usually produces
              better output.
            </p>
            <p className="mt-4 text-[16px]">Instead of entering:</p>
            <p className="mt-2 text-[16px] italic">Write a social media post.</p>
            <p className="mt-4 text-[16px]">Give the AI useful context:</p>
            <p className="mt-2 text-[16px] italic">
              Write a LinkedIn post announcing a new analytics dashboard for ecommerce marketers.
              The main benefit is that users can see campaign performance without manually combining
              reports. Keep the tone conversational and end with an invitation to try it.
            </p>
            <p className="mt-4 text-[16px]">Useful information to provide includes:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-[16px]">
              <li>Platform: Where will you publish the post?</li>
              <li>Topic: What should the post be about?</li>
              <li>Audience: Who should care about it?</li>
              <li>Goal: What do you want the post to accomplish?</li>
              <li>Tone: Professional, conversational, funny, educational, persuasive, etc.</li>
              <li>Key information: What facts, benefits, offers, or details must be included?</li>
              <li>CTA: What should readers do next?</li>
            </ul>
            <p className="mt-4 text-[16px]">
              Think of AI as a writing assistant rather than an automatic publishing button. Always
              review generated posts for accuracy, relevance, tone, and unnecessary claims before
              publishing.
            </p>

            <h3 className="mt-10 text-[22px] font-semibold">
              How Often Should You Post on Social Media?
            </h3>
            <p className="mt-4 text-[16px]">
              There is no posting frequency that works for every account.
            </p>
            <p className="mt-4 text-[16px]">
              The right schedule depends on your platform, audience, content resources, and ability
              to maintain quality.
            </p>
            <p className="mt-4 text-[16px]">
              Instead of focusing only on volume, aim for a cadence you can sustain.
            </p>
            <p className="mt-4 text-[16px]">
              For example, publishing three useful posts every week consistently may be more
              valuable than publishing three times per day for a week and then disappearing for a
              month.
            </p>
            <p className="mt-4 text-[16px]">
              As you publish more content, review which topics, formats, hooks, and CTAs perform
              best and use those insights to guide future posts.
            </p>

            <h3 className="mt-10 text-[22px] font-semibold">
              Create Social Media Posts in Seconds
            </h3>
            <p className="mt-4 text-[16px]">
              You don't need to stare at a blank text box every time you want to publish something.
            </p>
            <p className="mt-4 text-[16px]">
              Use the GeeLark Social Media Post Creator to turn your ideas into ready-to-edit social
              media posts.
            </p>
            <p className="mt-4 text-[16px]">
              Enter your topic, choose your platform and tone, and generate content for product
              announcements, educational posts, promotions, brand updates, engagement posts, and
              more.
            </p>
            <p className="mt-4 text-[16px]">
              Once you've found a version you like, customize it with your own expertise, examples,
              brand voice, and call to action before publishing.
            </p>
            <p className="mt-4 text-[16px]">
              Whether you're creating content for Instagram, Facebook, LinkedIn, X, or multiple
              social media accounts, the Social Media Post Creator gives you a faster starting point
              for your next post.
            </p>
          </article>
        </section>

        {/* FAQ */}
        <section id="faq" className="">
          <div className="mx-auto max-w-3xl px-5 py-20">
            <h2 className="text-3xl font-medium md:text-4xl">Frequently asked questions</h2>
            <Accordion type="single" collapsible className="mt-8">
              {[
                {
                  q: "Is the post creator free?",
                  a: "Yes. Generating drafts is free and needs no account. You only sign up when you want to publish from GeeLark cloud phones.",
                },
                {
                  q: "Which platforms are supported?",
                  a: "Drafts are tuned for TikTok, Instagram, X, LinkedIn, Facebook and all other social platforms.",
                },
                {
                  q: "Will the posts sound generic?",
                  a: "The more specific your prompt — product, audience, angle — the sharper the drafts. Treat them as a strong first pass and add your own voice.",
                },
                {
                  q: "How does GeeLark keep accounts safe?",
                  a: "Every profile runs on its own cloud Android phone with an isolated device fingerprint, so activity never overlaps between accounts.",
                },
                {
                  q: "Do I need to sign up to use the post creator?",
                  a: "No. You can generate as many drafts as you like without creating an account. Signup is only needed when you want to publish from GeeLark cloud phones.",
                },
                {
                  q: "Can I use the generated posts for commercial accounts?",
                  a: "Yes. The drafts are yours to use, edit, and publish however you want. We recommend reviewing them for brand voice and accuracy before posting.",
                },
                {
                  q: "What makes GeeLark different from other social media tools?",
                  a: "Most tools help you write or schedule. GeeLark also provides a real cloud Android phone for each account, so platforms see each profile as a separate, legitimate user.",
                },
                {
                  q: "How do I publish posts from a cloud phone?",
                  a: "After you create a GeeLark account, you can spin up cloud Android phones, install the apps you need, and log into each account on its own device. Then you post just like you would on a normal phone.",
                },
                {
                  q: "Is there a limit on how many posts I can generate?",
                  a: "There is no hard limit in the free creator. Generate, refine, and copy as many drafts as you need.",
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

        {/* More tools */}
        <section id="tools" className="">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
              More free tools for creators
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "AI comment generator",
                  desc: "Write comments that read like a real person in the thread, tuned to each subreddit's tone.",
                  cta: "Generate comments",
                },
                {
                  name: "TikTok hashtag generator",
                  desc: "Get a mix of broad, niche and branded TikTok hashtags built around your topic and audience.",
                  cta: "Generate TikTok hashtags",
                },
                {
                  name: "TikTok video hook generator",
                  desc: "Create attention-grabbing opening lines for your TikTok videos that stop the scroll and boost views.",
                  cta: "Generate TikTok hooks",
                },
                {
                  name: "Instagram hashtag generator",
                  desc: "Build hashtag sets for Reels, carousels and photos without hitting Instagram's 30-tag limit.",
                  cta: "Generate Instagram hashtags",
                },
                {
                  name: "Instagram bio generator",
                  desc: "Create a clear Instagram bio with the right hook, keywords and call to action for your link.",
                  cta: "Generate Instagram bios",
                },
                {
                  name: "YouTube bold text generator",
                  desc: "Convert regular text into bold Unicode characters that stand out in YouTube titles, comments and descriptions.",
                  cta: "Generate bold text for YouTube",
                },
              ].map((tool) => (
                <div
                  key={tool.name}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
                >
                  <div>
                    <h3 className="text-base font-semibold">{tool.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {tool.desc}
                    </p>
                  </div>
                  <span className="mt-5 ml-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {tool.cta} <ArrowUpRight className="size-4" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}

        <section className="mx-auto max-w-6xl px-5 py-20">
          <div className="overflow-hidden rounded-[var(--radius-3xl)] border border-border bg-[image:var(--gradient-primary)] px-8 py-14 text-center shadow-[var(--shadow-lift)]">
            <h2 className="text-3xl font-medium text-primary-foreground md:text-4xl">
              Write it here. Post it from anywhere.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-primary-foreground/85">
              Spin up your first GeeLark cloud phone in under a minute and publish your new draft
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
