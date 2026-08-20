import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

const TOOLS = [
  {
    title: "TikTok video hook generator",
    body: "Create attention-grabbing opening lines for your TikTok videos that stop the scroll and boost views.",
    cta: "Generate TikTok hooks",
    href: "/tiktok-hook",
  },
  {
    title: "Instagram hashtag generator",
    body: "Build hashtag sets for Reels, carousels and photos without hitting Instagram's 30-tag limit.",
    cta: "Generate Instagram hashtags",
    href: "/instagram-hashtag",
  },
  {
    title: "Instagram bio generator",
    body: "Create a clear Instagram bio with the right hook, keywords and call to action for your link.",
    cta: "Generate Instagram bios",
    href: "/instagram-bio",
  },
  {
    title: "AI post creator",
    body: "Turn a rough idea into a ready-to-publish post, sized and styled for the platform you are posting to.",
    cta: "Create posts",
    href: "/",
  },
  {
    title: "AI comment generator",
    body: "Write comments that read like a real person in the thread, tuned to each subreddit's tone.",
    cta: "Generate comments",
    href: "/comment-generator",
  },
  {
    title: "Facebook name generator",
    body: "Generate unique, memorable name ideas for your Facebook profile or page that match your niche.",
    cta: "Generate Facebook names",
    href: "/facebook-name",
  },
];

export function MoreTools() {
  return (
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
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
            >
              <div>
                <h3 className="font-display text-base font-semibold">{tool.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tool.body}</p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1 self-end text-sm font-medium text-primary">
                {tool.cta} <ArrowUpRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
