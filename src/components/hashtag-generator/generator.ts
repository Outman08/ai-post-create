export type HashtagGroup = {
  label: string;
  hint: string;
  tags: string[];
};

const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "for",
  "with",
  "from",
  "this",
  "that",
  "our",
  "your",
  "my",
  "of",
  "to",
  "in",
  "on",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "it",
  "its",
  "we",
  "you",
  "i",
  "at",
  "as",
  "by",
  "but",
  "if",
  "so",
  "not",
  "new",
  "just",
  "about",
  "post",
  "video",
  "clip",
  "tiktok",
  "caption",
  "today",
  "get",
  "how",
  "what",
  "why",
  "when",
  "who",
  "all",
  "more",
  "most",
  "very",
  "really",
  "some",
  "them",
  "they",
  "he",
  "she",
]);

const BROAD = [
  "fyp",
  "foryou",
  "foryoupage",
  "tiktok",
  "viral",
  "trending",
  "tiktokviral",
  "fypage",
  "trendingnow",
  "tiktokmademebuyit",
  "viralvideo",
  "contentcreator",
  "creatorsearchinsights",
  "discover",
];

const COMMUNITY = [
  "tiktokcommunity",
  "creators",
  "smallbusinesscheck",
  "behindthescenes",
  "dayinmylife",
  "storytime",
  "learnontiktok",
  "creatorlife",
  "buildinpublic",
  "tiktokniche",
  "worksmarter",
  "edutok",
];

const ENGAGEMENT = [
  "savethis",
  "duetthis",
  "tipsandtricks",
  "howto",
  "tutorial",
  "stepbystep",
  "checklist",
  "quicktips",
  "watchtillend",
  "greenscreen",
  "pov",
];

function normalize(word: string) {
  return word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function keywords(input: string): string[] {
  const words = input
    .split(/\s+/)
    .map(normalize)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  return Array.from(new Set(words));
}

function seedFrom(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick(pool: string[], count: number, seed: number) {
  const out: string[] = [];
  const used = new Set<number>();
  let s = seed;
  while (out.length < Math.min(count, pool.length)) {
    s = (s * 1103515245 + 12345) % 2147483647;
    const idx = s % pool.length;
    if (used.has(idx)) continue;
    used.add(idx);
    out.push(pool[idx]!);
  }
  return out;
}

function pairs(words: string[]) {
  const out: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    out.push(`${words[i]}${words[i + 1]}`);
  }
  return out;
}

export function generateHashtags(input: string): HashtagGroup[] {
  const words = keywords(input);
  const seed = seedFrom(input);

  const niche = Array.from(
    new Set([
      ...words,
      ...pairs(words),
      ...words.map((w) => `${w}tips`),
      ...words.map((w) => `${w}tok`),
    ]),
  ).slice(0, 40);

  const longTail = Array.from(
    new Set([
      ...words.map((w) => `${w}community`),
      ...words.map((w) => `${w}lovers`),
      ...words.map((w) => `${w}oftiktok`),
      ...words.map((w) => `${w}2026`),
      ...pairs(words).map((w) => `${w}guide`),
    ]),
  ).slice(0, 40);

  return [
    {
      label: "Niche & specific",
      hint: "Lower competition, higher intent — the tags most likely to reach the right viewers.",
      tags: pick(niche.length ? niche : COMMUNITY, 10, seed),
    },
    {
      label: "Broad & high reach",
      hint: "Big FYP tags that add discovery volume on top of your niche set.",
      tags: pick(BROAD, 8, seed + 7),
    },
    {
      label: "Long-tail & community",
      hint: "Tags your audience actually follows and browses week to week.",
      tags: pick(longTail.length ? longTail : COMMUNITY, 8, seed + 13),
    },
    {
      label: "Engagement boosters",
      hint: "Save- and share-friendly tags for tutorials, tips, and storytime videos.",
      tags: pick([...ENGAGEMENT, ...COMMUNITY], 6, seed + 19),
    },
  ];
}

export function flatten(groups: HashtagGroup[]) {
  return groups
    .flatMap((g) => g.tags)
    .map((t) => `#${t}`)
    .join(" ");
}
