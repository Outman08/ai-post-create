import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Sparkles, RefreshCw } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { generateBios } from "@/lib/instagram-bio.functions";
import { copyToClipboard } from "@/lib/utils";

const TONES = ["Professional", "Playful", "Aesthetic", "Bold", "Minimal", "Funny"] as const;
type Tone = (typeof TONES)[number];

export type BioInput = {
  description: string;
  tone: Tone;
};

export function BioGenerator() {
  const [input, setInput] = useState<BioInput>({
    description: "",
    tone: "Playful",
  });
  const [results, setResults] = useState<string[] | null>(null);
  const [isTemplate, setIsTemplate] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchBiosFn = useServerFn(generateBios);

  const set = <K extends keyof BioInput>(key: K, value: BioInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const fetchBios = useCallback(
    async (description: string, tone: Tone, count = 6) => {
      if (!description.trim()) return;

      setLoading(true);
      try {
        const result = await fetchBiosFn({
          description,
          tone,
          count,
        });
        setResults(result.bios);
        setIsTemplate(result.isTemplate || false);
      } catch (error) {
        console.error("生成 bio 时出错：", error);
        alert(error instanceof Error ? error.message : "生成失败，请重试");
      } finally {
        setLoading(false);
      }
    },
    [fetchBiosFn],
  );

  const generate = () => {
    fetchBios(input.description, input.tone, 6);
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
            generate();
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
            disabled={!input.description.trim() || loading}
            className={`w-full justify-center gap-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              input.description.trim()
                ? "bg-[#3B82F6] hover:bg-[#2563EB]"
                : "bg-[#93C5FD] hover:bg-[#93C5FD]/90"
            }`}
          >
            {loading ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {loading ? "Creating bios…" : "Create me a bio"}
          </Button>
        </form>
      </div>

      <div className="grid content-start gap-4">
        {results !== null && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{results.length} bios ready to copy</p>
                {isTemplate ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    📋 Template
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    ✨ AI
                  </span>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={generate} disabled={loading}>
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
                  <p className="whitespace-pre-line break-words text-[15px] leading-relaxed">
                    {bio}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`text-xs ${
                        length > 150 ? "text-destructive" : "text-muted-foreground"
                      }`}
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
