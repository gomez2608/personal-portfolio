"use client";
// Construido a partir de: la traza de razonamiento, párrafo por párrafo, y la señal de confianza por paso (paper, secciones 3–4.2 y apéndice B, ejemplo 2).

import { defineClip } from "@/app/components/blog/clips/clip-def";
import { Box, Dot, Fold, Label, Path, useClipFrame } from "@/app/components/blog/clips/draw";
import { formatNumberEs, progress, sec } from "@/app/components/blog/clips/timing";

// Layout: the trace as a page on the left (x=60–700), one bar per paragraph. A confidence
// trace runs down its right margin (x=740–860), one point per paragraph. The length of the
// ending (tokens) on the right (x=900–1220).
const PAGE = { x: 60, y: 40, w: 660, h: 640 };
const ROW0 = 130;
const PITCH = 22;
const PREFIX = 11; // paragraphs before the point where it could stop (paper, appendix B)
const TAIL = 12;
const rowY = (i: number) => ROW0 + i * PITCH;
const CUT_Y = rowY(PREFIX) - PITCH / 2 + 6;
const widths = [540, 500, 560, 470, 520, 555, 480, 530, 440, 515, 380, 545, 500, 560, 470, 525, 490, 555, 505, 460, 530, 485, 420];

// Confidence per paragraph: ILLUSTRATIVE (the post says so), steady, then a low, jumpy point at paragraph 11.
const conf = [0.82, 0.8, 0.85, 0.78, 0.83, 0.79, 0.84, 0.8, 0.76, 0.72, 0.22, 0.6, 0.48, 0.66, 0.52, 0.63, 0.5, 0.68, 0.55, 0.61, 0.49, 0.64, 0.58];
const MX = (c: number) => 745 + c * 115;
const trace = (from: number, to: number) =>
  conf.slice(from, to).map((c, k) => `${k === 0 ? "M" : "L"} ${MX(c)} ${rowY(from + k) + 6}`).join(" ");

const START = -sec(0.5);
const T = {
  prefix: (i: number) => (i === 0 ? START : sec(0.3) + i * sec(0.3)),
  tail: (j: number) => sec(4) + j * sec(0.3),
  countUp: [sec(4), sec(7.6)] as const,
  cut: sec(8),
  fold: sec(11),
  short: (j: number) => sec(12) + j * sec(0.3),
  countDown: [sec(12), sec(13.2)] as const,
};

function EndingLength() {
  const f = useClipFrame();
  const up = Math.round(1247 * progress(f, ...T.countUp));
  const v = f < T.countDown[0] ? up : Math.round(1247 - (1247 - 296) * progress(f, ...T.countDown));
  if (f < T.countUp[0]) return null;
  return (
    <>
      <Label x={1060} y={470} anchor="middle" tone="slate" weight={600} at={T.countUp[0]}>tokens del final</Label>
      <Label x={1060} y={560} anchor="middle" size={96} weight={800} at={T.countUp[0]}>{formatNumberEs(v)}</Label>
    </>
  );
}

function Scene() {
  return (
    <>
      <Box x={PAGE.x} y={PAGE.y} w={PAGE.w} h={PAGE.h} r={14} fill="ink" stroke="line" at={START} />
      <Label x={PAGE.x + 36} y={PAGE.y + 46} tone="slate" weight={600} at={START}>Razonamiento</Label>

      {/* Paragraphs up to the point where it could already answer. */}
      {Array.from({ length: PREFIX }, (_, i) => (
        <Box key={i} x={100} y={rowY(i)} w={widths[i]} h={12} r={6} fill="muted" grow at={T.prefix(i)} dur={sec(0.3)} />
      ))}
      <Label x={745} y={PAGE.y + 46} tone="slate" weight={600} at={START}>confianza</Label>
      <Path d={trace(0, PREFIX)} stroke="navy" weight="bold" at={START} dur={sec(3.8)} />

      {/* The original ending: it keeps going, then folds away once the cut is learnt. */}
      <Fold from={T.fold} originY={CUT_Y}>
        {Array.from({ length: TAIL }, (_, j) => (
          <Box key={j} x={100} y={rowY(PREFIX + j)} w={widths[PREFIX + j]} h={12} r={6} fill="muted" grow at={T.tail(j)} dur={sec(0.3)} />
        ))}
        <Path d={trace(PREFIX - 1, PREFIX + TAIL)} stroke="muted" weight="bold" at={T.tail(0)} dur={sec(3.6)} />
      </Fold>

      {/* The point where it could stop. */}
      <Path d={`M 80 ${CUT_Y} H 880`} stroke="accent" weight="bold" at={T.cut} dur={sec(0.8)} />
      <Dot x={MX(conf[PREFIX - 1])} y={rowY(PREFIX - 1) + 6} r={14} at={T.cut} />
      <Label x={900} y={CUT_Y - 40} tone="navy" at={T.cut + sec(0.4)}>podía concluir</Label>

      {/* The short ending LoCo trains it to prefer. */}
      {Array.from({ length: 3 }, (_, j) => (
        <Box key={j} x={100} y={rowY(PREFIX) + 14 + j * PITCH} w={[520, 470, 300][j]} h={12} r={6} fill="navy" grow at={T.short(j)} dur={sec(0.3)} />
      ))}

      <EndingLength />
    </>
  );
}

export default defineClip({
  id: "clip-1",
  title: "La idea general",
  durationInFrames: sec(16),
  captions: [
    { from: 0, to: sec(4), text: "El modelo escribe su razonamiento, párrafo por párrafo." },
    { from: sec(4), to: sec(8), text: "Tras el párrafo 11 sigue: 1.247 tokens más hasta terminar." },
    { from: sec(8), to: sec(11), text: "En el párrafo 11 su confianza cae: ahí podía concluir." },
    { from: sec(11), to: sec(16), text: "LoCo le enseña un final corto desde ese punto: 296 tokens." },
  ],
  Scene,
});
