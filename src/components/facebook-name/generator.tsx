import { useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Check, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { generateFacebookNames } from "@/lib/facebook-name.functions";
import { copyToClipboard } from "@/lib/utils";

const ACCOUNT_TYPES = ["Personal", "Business"] as const;
type AccountType = (typeof ACCOUNT_TYPES)[number];

const STYLES = ["Local business", "Community group", "Creator", "Brand", "Cause"] as const;
type NameStyle = (typeof STYLES)[number];

const TONES = ["Friendly", "Professional", "Playful", "Premium", "Bold"] as const;
type Tone = (typeof TONES)[number];

const CATEGORIES = [
  "Accounting & Bookkeeping",
  "Advertising & Marketing",
  "Agriculture & Farming",
  "Animal & Pet Services",
  "Architecture & Interior Design",
  "Art & Design",
  "Automotive Sales & Services",
  "Beauty & Personal Care",
  "Broadcasting & Media Production",
  "Business Consulting",
  "Cleaning Services",
  "Construction & Contracting",
  "Consumer Electronics",
  "Customer Support & Call Centers",
  "Cybersecurity Services",
  "Data Analytics",
  "E-commerce & Online Retail",
  "Education & Tutoring",
  "Energy & Utilities",
  "Engineering Services",
  "Entertainment & Events",
  "Environmental Services",
  "Fashion & Apparel",
  "Film & Video Production",
  "Financial Services & Banking",
  "Fitness & Wellness",
  "Food & Beverage",
  "Freelance & Gig Economy",
  "Gaming & Game Development",
  "Graphic & Web Design",
  "Healthcare & Medical",
  "Home Improvement",
  "Hospitality & Tourism",
  "Import & Export",
  "Information Technology (IT)",
  "Insurance Services",
  "Jewelry & Accessories",
  "Legal Services",
  "Logistics & Transportation",
  "Manufacturing",
  "Market Research",
  "Nonprofit & NGOs",
  "Pharmaceuticals",
  "Photography & Videography",
  "Printing & Publishing",
  "Real Estate & Property Management",
  "Recruitment & HR Services",
  "Repair & Maintenance",
  "Retail (Brick-and-Mortar)",
  "Software Development",
  "Telecommunications",
  "Travel Agency & Tour Operators",
] as const;

const STOP = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "for",
  "of",
  "to",
  "in",
  "on",
  "with",
  "helping",
  "who",
  "are",
  "you",
  "your",
  "i",
  "we",
  "my",
  "our",
  "us",
  "business",
  "brand",
  "page",
  "group",
  "account",
  "name",
  "ideas",
  "please",
  "want",
  "need",
  "make",
  "create",
  "generate",
]);

const LOCATIONS = [
  "Austin",
  "Brooklyn",
  "Denver",
  "Riverside",
  "Lakeside",
  "Downtown",
  "Northside",
  "Sunset",
  "Highland",
  "Oakwood",
  "Maplewood",
  "Harborview",
  "Westend",
  "Greenfield",
  "Portland",
  "Nashville",
  "Seattle",
  "Brookline",
];
const STREETS = [
  "Maple Street",
  "Sunset",
  "Highland",
  "Oakwood",
  "Riverside",
  "Lakeside",
  "Park Avenue",
  "Birch Lane",
  "Cedar",
  "Harbor",
  "Pine",
];
const SUFFIXES = [
  "Bakery",
  "Roasters",
  "Studio",
  "Works",
  "Hub",
  "Collective",
  "Kitchen",
  "Shop",
  "Garage",
  "Salon",
  "Co.",
  "Supply",
  "Corner",
  "Station",
  "Lab",
];
const AUDIENCES = [
  "Club",
  "Collective",
  "Community",
  "Network",
  "Hub",
  "Group",
  "Society",
  "Circle",
  "Guild",
  "Tribe",
];
const REGIONS = ["UK", "USA", "EU", "Canada", "Aus", "NYC", "LA", "TX"];
const NAMES = [
  "Sara Lin",
  "Marco",
  "Jamal",
  "Mia",
  "Leo",
  "Nadia",
  "Cole",
  "Priya",
  "Dev",
  "Aria",
  "Quinn",
  "Tessa",
  "Owen",
  "Lena",
  "Ravi",
  "Jules",
];
const INVENTED = [
  "Lumenly",
  "Nestwork",
  "Brightmint",
  "Cloudly",
  "Northbeam",
  "Skylark",
  "Everpost",
  "Wildhive",
  "Lumalab",
  "Novaworks",
  "Truehub",
  "Openflow",
  "Solarkit",
  "Aeromint",
  "Kindloop",
  "Beambase",
  "Dawnwave",
  "Clearks",
];
const CAUSE_VERBS = [
  "Fund",
  "Save",
  "Rewild",
  "Protect",
  "Grow",
  "Power",
  "Fuel",
  "Build",
  "Free",
  "Reclaim",
];
const CAUSE_NOUNS = [
  "Reader",
  "Kid",
  "Valley",
  "River",
  "Future",
  "Family",
  "Forest",
  "City",
  "Student",
  "Garden",
];
const CAUSE_VERBS2 = ["Eats", "Reads", "Codes", "Plants", "Heals", "Builds"];

function cap(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1);
}
function titleAll(w: string): string {
  return w.split(/\s+/).map(cap).join(" ");
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length] as T;
}

function keywords(desc: string, fallback: string): string[] {
  const words = desc
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
  const uniq = [...new Set(words)];
  if (uniq.length === 0) return [fallback];
  return uniq;
}

function fallbackKeyword(style: NameStyle, category?: string): string {
  if (category) {
    const last = category
      .split(/&|,|\s/)
      .filter(Boolean)
      .pop();
    if (last) return last.toLowerCase();
  }
  const map: Record<NameStyle, string> = {
    "Local business": "coffee",
    "Community group": "designers",
    Creator: "fitness",
    Brand: "studio",
    Cause: "reader",
  };
  return map[style];
}

function vanityUrl(name: string): string {
  let s = name.toLowerCase().replace(/[^a-z0-9.]/g, "");
  if (s.length < 5) s = (s + "page").slice(0, 8);
  return `facebook.com/${s}`;
}

function buildNames(
  desc: string,
  style: NameStyle,
  tone: Tone,
  accountType: AccountType,
  category: string | undefined,
  seed: number,
): string[] {
  const fb = fallbackKeyword(style, category);
  const kws = keywords(desc, fb);
  const k1 = kws[0]!;
  const k2 = kws[1] ?? k1;
  const K1 = cap(k1);
  const K2 = cap(k2);

  const candidates: string[] = [];

  if (style === "Local business") {
    candidates.push(
      `${pick(STREETS, seed)} ${K1}`,
      `${pick(LOCATIONS, seed)} ${K1}`,
      `${pick(LOCATIONS, seed)} ${K1} ${pick(SUFFIXES, seed)}`,
      `${pick(STREETS, seed)} ${K1} ${pick(SUFFIXES, seed)}`,
      `${K1} & ${pick(SUFFIXES, seed + 3)}`,
      `${pick(LOCATIONS, seed + 4)} ${K2} ${pick(SUFFIXES, seed + 2)}`,
      `${K1} ${pick(SUFFIXES, seed + 5)}`,
      `${pick(STREETS, seed + 6)} ${K2}`,
      `${K1} ${pick(LOCATIONS, seed + 7)}`,
      `${pick(LOCATIONS, seed + 1)} ${K1} Co.`,
    );
  } else if (style === "Community group") {
    candidates.push(
      `${pick(LOCATIONS, seed)} ${K1} ${pick(AUDIENCES, seed)}`,
      `${K1} ${pick(AUDIENCES, seed)}`,
      `${K2} ${pick(AUDIENCES, seed + 1)} ${pick(REGIONS, seed)}`,
      `New ${K1} ${pick(AUDIENCES, seed + 2)}`,
      `${pick(LOCATIONS, seed + 3)} ${K2} ${pick(AUDIENCES, seed + 4)}`,
      `${K1} ${pick(AUDIENCES, seed + 5)} ${pick(REGIONS, seed + 6)}`,
      `The ${K1} ${pick(AUDIENCES, seed + 7)}`,
      `${K2} & ${K1} ${pick(AUDIENCES, seed + 8)}`,
      `${pick(LOCATIONS, seed + 2)} ${K1} Network`,
      `${K1} ${pick(AUDIENCES, seed + 9)}`,
    );
  } else if (style === "Creator") {
    const n = pick(NAMES, seed);
    candidates.push(
      `${n} ${K1}`,
      `${K1} With ${n}`,
      `${n} ${K2}`,
      `${n} ${pick(CAUSE_VERBS2, seed)}`,
      `${K1} By ${n}`,
      `${n} ${K1}s`,
      `${K2} & ${n}`,
      `${n} • ${K1}`,
      `The ${n} ${K1}`,
      `${K1} Lab with ${n}`,
    );
  } else if (style === "Brand") {
    candidates.push(
      `${pick(INVENTED, seed)}`,
      `${K1}${pick(["ly", "works", "hub", "flow", "mint", "lab"], seed)}`,
      `${pick(["Bright", "Cloud", "North", "Sun", "True", "Ever", "Open"], seed)}${k1}`,
      `${K1} & Co.`,
      `${K2}${pick(["ly", "base", "kit", "loop", "wave", "scape"], seed + 1)}`,
      `${pick(INVENTED, seed + 2)}`,
      `${K1}${pick(["ly", "works", "hub", "flow", "mint", "lab"], seed + 3)}`,
      `${pick(["Bright", "Cloud", "North", "Sun", "True", "Ever", "Open"], seed + 4)}${k2}`,
      `${K1} ${pick(SUFFIXES, seed + 5)}`,
      `${pick(INVENTED, seed + 6)}`,
    );
  } else {
    // Cause
    candidates.push(
      `${pick(CAUSE_VERBS, seed)} A ${pick(CAUSE_NOUNS, seed)}`,
      `Every ${pick(CAUSE_NOUNS, seed + 1)} ${pick(CAUSE_VERBS2, seed)}`,
      `Rewild The ${pick(CAUSE_NOUNS, seed + 2)}`,
      `Save The ${K1}`,
      `${pick(CAUSE_VERBS, seed + 3)} For ${K1}`,
      `One More ${pick(CAUSE_NOUNS, seed + 4)}`,
      `${K1} For All`,
      `Fund A ${K2}`,
      `Grow The ${pick(CAUSE_NOUNS, seed + 5)}`,
      `Power A ${pick(CAUSE_NOUNS, seed + 6)}`,
    );
  }

  // Tone postfix tweaks (kept light so names stay usable)
  const tweak: Record<Tone, (s: string) => string> = {
    Friendly: (s) => `${s}`,
    Professional: (s) => `${s}`,
    Playful: (s) => `${s}`,
    Premium: (s) => s.replace(/\bCo\.\b$/, "Studio"),
    Bold: (s) => s,
  };

  // dedupe while preserving order, apply tone tweak, cap result, limit to 8
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of candidates) {
    const v = titleAll(tweak[tone](raw));
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
    if (out.length >= 8) break;
  }
  // If account type is Personal, keep names human/real-name friendly (no suffixes)
  if (accountType === "Personal" && style === "Local business") {
    return out.map((n) =>
      n
        .replace(/\s+\w+$/, "")
        .split(/\s+/)
        .slice(0, 2)
        .join(" "),
    );
  }
  return out;
}

export type NameInput = {
  description: string;
  accountType: AccountType;
  category: string;
  style: NameStyle;
  tone: Tone;
};

export function NameGenerator() {
  const [input, setInput] = useState<NameInput>({
    description: "",
    accountType: "Business",
    category: "Coffee & Beverage",
    style: "Local business",
    tone: "Friendly",
  });
  const [copied, setCopied] = useState<number | null>(null);

  const fn = useServerFn(generateFacebookNames);
  const mutation = useMutation({
    mutationFn: (vars: NameInput) => fn({ data: vars }),
  });

  const set = <K extends keyof NameInput>(key: K, value: NameInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const results = mutation.data?.names ?? null;
  const isAI = mutation.data?.isAI ?? false;

  const generate = () => {
    mutation.mutate(input);
  };

  const copy = async (text: string, i: number) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(i);
      setTimeout(() => setCopied(null), 1600);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6">
      {/* 表单卡：仅包含输入字段与 Generate 按钮 */}
      <div className="rounded-xl border border-border p-6 shadow-soft sm:p-8">
        <form
          className="grid gap-5"
          onSubmit={(ev) => {
            ev.preventDefault();
            generate();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="description">Describe what you do</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="A specialty coffee roaster sourcing single-origin beans and running weekend brewing workshops"
              value={input.description}
              onChange={(ev) => set("description", ev.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Account type</Label>
              <Select
                value={input.accountType}
                onValueChange={(v) => set("accountType", v as AccountType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Business category</Label>
              <Select
                value={input.category}
                onValueChange={(v) => set("category", v)}
                disabled={input.accountType !== "Business"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select business category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3">
            <Label>Naming style</Label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => set("style", style)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    input.style === style
                      ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border bg-background text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <Label>Tone</Label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => set("tone", tone)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    input.tone === tone
                      ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border bg-background text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={!input.description.trim() || mutation.isPending}
            className="h-9 w-full rounded-[8px] px-6 py-2 text-[16px] text-primary-foreground shadow transition-colors"
          >
            {mutation.isPending ? <RefreshCw className="size-4 animate-spin" /> : <Sparkles />}
            {mutation.isPending ? "Generating names..." : "Generate name"}
          </Button>

          {mutation.isError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Usage limit reached</AlertTitle>
              <AlertDescription>{(mutation.error as Error).message}</AlertDescription>
            </Alert>
          )}
        </form>
      </div>

      {/* 结果区：与表单卡分开的独立区块；只包含头部行 + 每条结果子卡（不再用大壳卡包裹） */}
      {results !== null && (
        <div className="grid content-start gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {results.length} name ideas ready to copy
              <span className="ml-2 inline-block rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                {isAI ? "✨ AI generated" : "📋 Template fallback"}
              </span>
            </p>
            <Button variant="outline" size="sm" onClick={() => generate()}>
              <RefreshCw /> Regenerate
            </Button>
          </div>
          {results.map((name, i) => {
            const length = name.length;
            const url = vanityUrl(name);
            return (
              <div
                key={i}
                className="rounded-xl border border-border p-5 shadow-soft transition-shadow hover:shadow-lift"
              >
                <p className="text-[17px] font-semibold leading-relaxed">{name}</p>
                <p className="mt-2 break-all font-mono text-xs text-muted-foreground">{url}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`text-xs ${length > 75 ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {length}/75 characters
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => copy(name, i)}>
                    {copied === i ? <Check /> : <Copy />}
                    {copied === i ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
