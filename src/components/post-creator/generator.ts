export type PlatformId = "tiktok" | "instagram" | "x" | "linkedin" | "facebook";

export type Platform = {
  id: PlatformId;
  name: string;
  handleLabel: string;
  limit: number;
};

export const PLATFORMS: Platform[] = [
  { id: "tiktok", name: "TikTok", handleLabel: "@geelark", limit: 2200 },
  { id: "instagram", name: "Instagram", handleLabel: "@geelark", limit: 2200 },
  { id: "x", name: "X", handleLabel: "@GeeLark", limit: 280 },
  { id: "linkedin", name: "LinkedIn", handleLabel: "GeeLark", limit: 3000 },
  { id: "facebook", name: "Facebook", handleLabel: "GeeLark", limit: 63206 },
];

export const TONES = ["Friendly", "Professional", "Bold", "Playful", "Informative"] as const;
export type Tone = (typeof TONES)[number];

const HASHTAGS: Record<PlatformId, string[]> = {
  tiktok: ["#cloudphone", "#antidetect", "#socialmediagrowth", "#geelark"],
  instagram: ["#cloudphone", "#creatorworkflow", "#socialmedia", "#geelark"],
  x: ["#automation", "#growth"],
  linkedin: ["#growthmarketing", "#operations", "#automation"],
  facebook: ["#socialmedia", "#smallbusiness"],
};

const OPENERS: Record<Tone, string[]> = {
  Friendly: ["Here's the easy way to", "Quick tip if you want to", "Let's talk about how to"],
  Professional: ["A practical approach to", "How modern teams", "What it really takes to"],
  Bold: ["Stop wasting hours on", "Nobody tells you this about", "The hard truth about"],
  Playful: ["Plot twist:", "POV: you finally figured out", "Not to brag, but"],
  Informative: ["Three things to know about", "A short breakdown of", "Here's how it works:"],
};

const CLOSERS: Record<Tone, string[]> = {
  Friendly: ["Save this for later 💾", "Tell me if you try it 👇", "Hope this helps!"],
  Professional: [
    "Full breakdown in the comments.",
    "Happy to share the workflow.",
    "Curious how your team handles this.",
  ],
  Bold: ["Run it. Thank me later.", "Your competitors already do this.", "No excuses now."],
  Playful: ["You're welcome 😌", "Go on, try it 🚀", "It's giving efficiency ✨"],
  Informative: [
    "Sources and setup steps below.",
    "Bookmark for your next launch.",
    "Questions? Drop them below.",
  ],
};

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length] as T;
}


function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return h;
}

function clean(topic: string) {
  const t = topic.trim().replace(/\s+/g, " ");
  return t.charAt(0).toLowerCase() + t.slice(1);
}

export function generatePosts(topic: string, platform: Platform, tone: Tone, count = 3): string[] {
  const base = clean(topic) || "running multiple social accounts without getting flagged";
  const seed = hash(`${base}|${platform.id}|${tone}`);
  const tags = HASHTAGS[platform.id].join(" ");

  const bodies = [
    `${pick(OPENERS[tone], seed)} ${base}.\n\nGeeLark spins up real cloud Android phones, each with its own device fingerprint, so every account looks and behaves like a separate person. No extra hardware, no juggling SIMs.\n\n${pick(CLOSERS[tone], seed)}`,
    `${pick(OPENERS[tone], seed + 7)} ${base}.\n\n• One cloud phone per account\n• Unique fingerprint + proxy on every profile\n• Schedule posts and warm-ups while you sleep\n• Scale from 3 profiles to 300 in a click\n\n${pick(CLOSERS[tone], seed + 3)}`,
    `We asked our team about ${base} — the answer was boring but effective: give every account its own device.\n\nThat's exactly what GeeLark's cloud phones do, and it's why teams stop losing accounts on week two.\n\n${pick(CLOSERS[tone], seed + 11)}`,
  ];

  return bodies.slice(0, count).map((body) => {
    const withTags = platform.id === "linkedin" ? `${body}\n\n${tags}` : `${body}\n\n${tags}`;
    return withTags.length > platform.limit
      ? `${withTags.slice(0, Math.max(0, platform.limit - 1)).trimEnd()}…`
      : withTags;
  });
}
