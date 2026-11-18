"use client";
// Construido a partir de: el prefijo congelado y los k = 8 finales que se muestrean desde él, con su largo en tokens y su verificación (paper, sección 4.3, ecuaciones 9–11; sección 5.1; apéndice B, ejemplo 2).

import { defineClip } from "@/app/components/blog/clips/clip-def";
import { Box, Fade, Label, Path } from "@/app/components/blog/clips/draw";
import { Highlight } from "@/app/components/blog/clips/primitives";
import { sec } from "@/app/components/blog/clips/timing";

// Layout: the frozen prefix as a short navy bar on the left (x=60–280). From its end, a fan of
// curves to one strip per ending, starting at x=380: the original ending on top (y=110), the
// eight new endings below (y=210–616). A strip's length is its length in tokens (1.247 → 673px),
// and the answer it reaches sits right after it. Only 296 and 1.247 come from the paper; the
// other lengths and the three wrong endings are ILLUSTRATIVE (the post says so).
const PREFIX = { x: 60, y: 393, w: 220, h: 40 };
const FAN_FROM = { x: PREFIX.x + PREFIX.w, y: PREFIX.y + PREFIX.h / 2 };
const STRIP_X = 380;
const STRIP_H = 20;
const PX_PER_TOKEN = 0.54;
const ORIGINAL = { tokens: 1247, y: 110 };
const rowY = (j: number) => 210 + j * 58;

const NEW = [
  { tokens: 640, ok: true },
  { tokens: 230, ok: false },
  { tokens: 910, ok: true },
  { tokens: 296, ok: true },
  { tokens: 530, ok: true },
  { tokens: 1100, ok: false },
  { tokens: 780, ok: true },
  { tokens: 420, ok: false },
];
const CHOSEN = 3;

const len = (tokens: number) => Math.round(tokens * PX_PER_TOKEN);
const fan = (y: number) => `M ${FAN_FROM.x} ${FAN_FROM.y} C ${FAN_FROM.x + 60} ${FAN_FROM.y}, ${STRIP_X - 60} ${y}, ${STRIP_X - 8} ${y}`;
const growDur = (tokens: number) => Math.max(sec(0.4), Math.round((tokens / 1247) * sec(2)));

const START = -sec(0.5);
const T = {
  original: sec(0.3),
  news: (j: number) => sec(4) + j * sec(0.25),
  check: sec(8),
  pick: sec(10),
  pair: sec(12.5),
};

function Strip({ y, tokens, at, fill = "muted" }: { y: number; tokens: number; at: number; fill?: "muted" | "navy" }) {
  return <Box x={STRIP_X} y={y - STRIP_H / 2} w={len(tokens)} h={STRIP_H} r={6} fill={fill} grow at={at} dur={growDur(tokens)} />;
}

function Ending({ j }: { j: number }) {
  const e = NEW[j];
  const y = rowY(j);
  const at = T.news(j);
  return (
    <>
      <Path d={fan(y)} stroke="line" at={at - sec(0.4)} dur={sec(0.4)} />
      <Strip y={y} tokens={e.tokens} at={at} />
      <Label x={STRIP_X + len(e.tokens) + 18} y={y} mono at={at + growDur(e.tokens)}>{e.ok ? "2/7" : "1/14"}</Label>
    </>
  );
}

function Scene() {
  return (
    <>
      {/* The frozen prefix: the first 11 paragraphs of the trace. */}
      <Label x={PREFIX.x} y={PREFIX.y - 44} tone="slate" weight={600} at={START}>prefijo</Label>
      <Box x={PREFIX.x} y={PREFIX.y} w={PREFIX.w} h={PREFIX.h} r={6} fill="navy" at={START} />
      <Label x={PREFIX.x} y={PREFIX.y + PREFIX.h + 44} mono at={START}>11 pasos</Label>

      {/* The original ending from the same state. */}
      <Path d={fan(ORIGINAL.y)} stroke="line" at={START} dur={sec(0.4)} />
      <Label x={STRIP_X} y={62} tone="slate" weight={600} at={T.original}>
        {"original · 1.247 tokens"}
      </Label>
      <Strip y={ORIGINAL.y} tokens={ORIGINAL.tokens} at={T.original} />
      <Label x={STRIP_X + len(ORIGINAL.tokens) + 18} y={ORIGINAL.y} mono at={T.original + growDur(ORIGINAL.tokens)}>2/7</Label>

      {/* Eight new endings: the wrong ones fade at the check, the longer correct ones at the pick. */}
      {NEW.map((e, j) =>
        j === CHOSEN ? null : (
          <Fade key={j} from={e.ok ? T.pick : T.check} to={e.ok ? 0.4 : 0.15}>
            <Ending j={j} />
          </Fade>
        ),
      )}
      <Ending j={CHOSEN} />

      {/* The shortest correct ending becomes the preferred one. */}
      <Highlight from={T.pick + sec(0.3)}>
        <Strip y={rowY(CHOSEN)} tokens={NEW[CHOSEN].tokens} at={T.pick} fill="navy" />
      </Highlight>
      <Fade from={T.pair} to={0}>
        <Label x={660} y={rowY(CHOSEN)} mono at={T.pick + sec(0.4)}>296 tokens</Label>
      </Fade>
      <Label x={660} y={rowY(CHOSEN)} tone="navy" weight={800} at={T.pair + sec(0.3)}>
        {"preferido · 296"}
      </Label>

      {/* The pair: the same prefix, two endings. */}
      <Label x={752} y={62} tone="ink" weight={800} at={T.pair + sec(0.3)}>
        {"· descartado"}
      </Label>
    </>
  );
}

export default defineClip({
  id: "clip-2",
  title: "Cómo se arma cada par",
  durationInFrames: sec(17),
  captions: [
    { from: 0, to: sec(4), text: "Desde el prefijo congelado, el final original ocupó 1.247 tokens." },
    { from: sec(4), to: sec(8), text: "Desde el mismo punto, el modelo escribe 8 finales nuevos." },
    { from: sec(8), to: sec(10), text: "Se verifica cada uno: los que no llegan a 2/7 se descartan." },
    { from: sec(10), to: sec(12.5), text: "De los correctos, se queda el más corto: 296 tokens." },
    { from: sec(12.5), to: sec(17), text: "El par: preferir el corto (296) frente al original (1.247)." },
  ],
  Scene,
});
