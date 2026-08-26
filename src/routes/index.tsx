import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, MessageSquare, Type, User, Hash, Video, Bold, ChevronRight } from "lucide-react";
import { useIframeHeight } from "@/hooks/use-iframe-height";

const TITLE = "GeeLark Free Tools - AI Social Media Tools";
const DESCRIPTION =
  "Free AI-powered tools for social media creators. Generate posts, comments, bios, hashtags, and more.";

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
  component: HomePage,
});

const TOOLS = [
  {
    id: "post-creator",
    name: "AI Post Creator",
    description:
      "Generate scroll-stopping posts for TikTok, Instagram, X, LinkedIn and Facebook in seconds.",
    icon: Sparkles,
    path: "/post-creator",
  },
  {
    id: "comment-generator",
    name: "AI Comment Generator",
    description: "Draft thoughtful, on-brand replies for every major platform in seconds.",
    icon: MessageSquare,
    path: "/comment-generator",
  },
  {
    id: "youtube-bold",
    name: "YouTube Bold Text Generator",
    description: "Convert normal text into Unicode bold letters you can paste into YouTube titles.",
    icon: Bold,
    path: "/youtube-bold",
  },
  {
    id: "instagram-bio",
    name: "Instagram Bio Generator",
    description:
      "Generate scroll-stopping Instagram bios in seconds that fit the 150-character limit.",
    icon: User,
    path: "/instagram-bio",
  },
  {
    id: "facebook-name",
    name: "Facebook Name Generator",
    description: "Create perfect Facebook profile and page names for your brand.",
    icon: Type,
    path: "/facebook-name",
  },
  {
    id: "instagram-hashtag",
    name: "Instagram Hashtag Generator",
    description:
      "Build hashtag sets for Reels, carousels and photos without hitting Instagram's 30-tag limit.",
    icon: Hash,
    path: "/instagram-hashtag",
  },
  {
    id: "tiktok-hook",
    name: "TikTok Video Hook Generator",
    description:
      "Create attention-grabbing opening lines for your TikTok videos that stop the scroll.",
    icon: Video,
    path: "/tiktok-hook",
  },
  {
    id: "tiktok-hashtag",
    name: "TikTok Hashtag Generator",
    description: "Get a mix of broad, niche and branded TikTok hashtags built around your topic.",
    icon: Hash,
    path: "/tiktok-hashtag",
  },
];

function HomePage() {
  useIframeHeight();

  return (
    <div className="bg-white text-foreground">
      <main>
        {/* Hero */}
        <section className="">
          <div className="mx-auto max-w-6xl px-5 pb-20 pt-16 md:pt-24">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-[56px] font-medium leading-[1.05] text-foreground md:text-[56px]">
                GeeLark Free Tools
              </h1>
              <p className="mt-4 text-[20px] text-muted-foreground max-w-2xl mx-auto">
                Free AI-powered tools for social media creators. Generate posts, comments, bios,
                hashtags, and more in seconds.
              </p>
            </div>

            {/* Tools Grid */}
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-2">
              {TOOLS.map((tool) => (
                <Link key={tool.id} to={tool.path} className="group">
                  <article className="h-full rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 size-12 rounded-[var(--radius-lg)] bg-[image:var(--gradient-primary)] flex items-center justify-center">
                        <tool.icon className="size-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[20px] font-semibold flex items-center gap-2">
                          {tool.name}
                          <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="mt-2 text-[16px] text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
