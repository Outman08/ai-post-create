import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Copy, Eraser } from "lucide-react";

type StyleDef = {
  id: string;
  name: string;
  note: string;
  upper: string;
  lower: string;
  digits?: string;
};

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";

const STYLES: StyleDef[] = [
  {
    id: "bold",
    name: "Bold",
    note: "Mathematical bold — the safest, most readable option",
    upper: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙",
    lower: "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳",
    digits: "𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗",
  },
  {
    id: "bold-sans",
    name: "Bold sans-serif",
    note: "Closest match to YouTube's own interface font",
    upper: "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭",
    lower: "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇",
    digits: "𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵",
  },
  {
    id: "bold-italic",
    name: "Bold italic",
    note: "Emphasis with a slant — good for taglines",
    upper: "𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁",
    lower: "𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛",
  },
  {
    id: "bold-sans-italic",
    name: "Bold sans italic",
    note: "Modern and compact for channel names",
    upper: "𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕",
    lower: "𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯",
  },
  {
    id: "bold-script",
    name: "Bold script",
    note: "Decorative — best for short brand words",
    upper: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩",
    lower: "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃",
  },
  {
    id: "bold-fraktur",
    name: "Bold fraktur",
    note: "Heavy gothic look for niche or gaming channels",
    upper: "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅",
    lower: "𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟",
  },
];

function toArray(s: string) {
  return Array.from(s);
}

function convert(text: string, style: StyleDef) {
  const up = toArray(style.upper);
  const low = toArray(style.lower);
  const dig = style.digits ? toArray(style.digits) : null;

  return toArray(text)
    .map((ch) => {
      const u = UPPER.indexOf(ch);
      if (u >= 0) return up[u] ?? ch;
      const l = LOWER.indexOf(ch);
      if (l >= 0) return low[l] ?? ch;
      const d = DIGITS.indexOf(ch);
      if (d >= 0 && dig) return dig[d] ?? ch;
      return ch;
    })
    .join("");
}

const SAMPLE = "5 Morning Habits That Changed My Life";

export function BoldTextGenerator() {
  const [text, setText] = useState(SAMPLE);
  const [copied, setCopied] = useState<string | null>(null);

  const results = useMemo(
    () => STYLES.map((style) => ({ style, output: convert(text, style) })),
    [text],
  );

  const copy = async (value: string, id: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6">
      <div className="rounded-xl border border-border p-6 shadow-soft sm:p-8">
        <div className="grid gap-2">
          <div className="flex items-end justify-between gap-3">
            <Label htmlFor="text">Your text</Label>
            <span className="text-xs text-muted-foreground">{text.length} characters</span>
          </div>
          <Textarea
            id="text"
            rows={3}
            placeholder="Type or paste your YouTube title, description header or channel name"
            value={text}
            onChange={(ev) => setText(ev.target.value)}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setText("")}>
              <Eraser /> Clear
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setText(SAMPLE)}>
              Use example
            </Button>
          </div>
        </div>
      </div>

      <div className="grid content-start gap-4">
        {results.map(({ style, output }) => (
          <div
            key={style.id}
            className="rounded-xl border border-border p-4 shadow-soft transition-shadow hover:shadow-lift"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-xs font-medium text-muted-foreground">
                  {style.name}
                </h3>

                <p className="mt-1 line-clamp-2 break-words text-base leading-snug md:text-sm">
                  {output || (
                    <span className="text-muted-foreground">Your bold text appears here</span>
                  )}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                disabled={!output}
                onClick={() => copy(output, style.id)}
              >
                {copied === style.id ? <Check /> : <Copy />}
                {copied === style.id ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
