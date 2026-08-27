import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Sparkles, RefreshCw } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const TONES = ["Professional", "Playful", "Aesthetic", "Bold", "Minimal", "Funny"] as const;
type Tone = (typeof TONES)[number];

const EMOJI: Record<Tone, string[]> = {
  Professional: ["📊", "💼", "🚀", "📈", "🤝"],
  Playful: ["✨", "🎈", "🌈", "🍭", "🥳"],
  Aesthetic: ["🌙", "🕊️", "🤍", "🌿", "☁️"],
  Bold: ["🔥", "⚡", "💥", "🏆", "🦾"],
  Minimal: ["·", "—", "◦", "/", "•"],
  Funny: ["🙃", "🍕", "🐒", "🤡", "😵‍💫"],
};

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length] as T;
}

export type BioInput = {
  description: string;
  tone: Tone;
};

function buildBios(input: BioInput, seed: number): string[] {
  const desc = input.description.trim() || "creator sharing daily tips";
  const tone = input.tone;
  const e = EMOJI[tone];
  const em = (i: number) => `${pick(e, seed + i)} `;

  const taglines: Record<Tone, string[]> = {
    Professional: ["Helping you grow", "Results that matter", "Let's build together"],
    Playful: ["Good vibes only", "Join the fun", "Stay cozy"],
    Aesthetic: ["Less but better", "Soft days, sharp focus", "Curated for you"],
    Bold: ["No fluff. Just results.", "Built different", "Level up"],
    Minimal: ["Link below", "Stay tuned", "More below"],
    Funny: ["Results may vary", "0% serious", "Professional amateur"],
  };

  const t = taglines[tone];
  return [
    `${em(0)}${desc}\n${em(1)}${pick(t, seed)}`,
    `${em(2)}${desc}\n${em(3)}${pick(t, seed + 1)}`,
    `${em(4)}${desc}\n${em(5)}${pick(t, seed + 2)}`,
    `${em(6)}${desc}\n${em(7)}${pick(t, seed + 3)}`,
    `${em(8)}${desc}\n${em(9)}${pick(t, seed + 4)}`,
    `${em(10)}${desc}\n${em(11)}${pick(t, seed + 5)}`,
  ];
}

export function BioGenerator() {
  const [input, setInput] = useState<BioInput>({
    description: "",
    tone: "Playful",
  });
  const [seed, setSeed] = useState(1);
  const [results, setResults] = useState<string[] | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const set = <K extends keyof BioInput>(key: K, value: BioInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const generate = (nextSeed = seed) => {
    setSeed(nextSeed);
    setResults(buildBios(input, nextSeed));
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
      <div className="rounded-xl border border-border p-6 shadow-soft sm:p-8">
        <form
          className="grid gap-5"
          onSubmit={(ev) => {
            ev.preventDefault();
            if (!input.description.trim()) return;
            generate(seed + 1);
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="description">Describe yourself</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Mia Reyes — pilates coach helping busy moms with mobility and 10-minute workouts"
              value={input.description}
              onChange={(ev) => set("description", ev.target.value)}
            />
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
            size="lg"
            disabled={!input.description.trim()}
            className={`w-full justify-center gap-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              input.description.trim()
                ? "bg-[#3B82F6] hover:bg-[#2563EB]"
                : "bg-[#93C5FD] hover:bg-[#93C5FD]/90"
            }`}
          >
            <Sparkles className="size-4" /> Create me a bio
          </Button>
        </form>
      </div>

      <div className="grid content-start gap-4">
        {results !== null && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{results.length} bios ready to copy</p>
              <Button variant="outline" size="sm" onClick={() => generate(seed + 1)}>
                <RefreshCw /> Regenerate
              </Button>
            </div>
            {results.map((bio, i) => {
              const length = bio.replace(/\n/g, "").length;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-border p-5 shadow-soft transition-shadow hover:shadow-lift"
                >
                  <p className="whitespace-pre-line break-words text-[15px] leading-relaxed">{bio}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`text-xs ${length > 150 ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {length}/150 characters
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => copy(bio, i)}>
                      {copied === i ? <Check /> : <Copy />}
                      {copied === i ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
