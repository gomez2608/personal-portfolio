"use client";
// Construido a partir de: los puntajes de JEV para las 12 acciones del episodio de la taza caliente, a medida que ve más de lo que vino después (paper, figura 7 y apéndice E.4, tabla 9).

import { defineClip } from "@/app/components/blog/clips/clip-def";
import { Box, Label, Path, useClipFrame } from "@/app/components/blog/clips/draw";
import { Highlight } from "@/app/components/blog/clips/primitives";
import { progress, sec } from "@/app/components/blog/clips/timing";

// Layout: one bar per action of the episode, in order (centres x=110–1100, pitch 90), standing
// on a baseline at y=610 (score 1 = 360px). Action numbers under it (y=650). On top, what the
// judge can see (y=70) and the two actions that matter (y=140). Bars reshape at each stage.
const BASE_Y = 610;
const MAX_H = 360;
const BAR_W = 50;
const cx = (k: number) => 110 + k * 90;
const COLD = 5; // action 6: puts the mug in the cabinet before heating it
const OPEN = 8; // action 9: opens the microwave

// Paper, table 9 (Progress question): Prefix, +FB, 25 %, 50 %, 75 %, Full.
const SCORES = [
  [0.47, 0.57, 0.62, 0.61, 0.56, 0.54],
  [0.25, 0.25, 0.24, 0.23, 0.24, 0.23],
  [0.49, 0.72, 0.46, 0.4, 0.46, 0.44],
  [0.92, 0.92, 0.9, 0.82, 0.83, 0.85],
  [0.8, 0.81, 0.69, 0.67, 0.66, 0.68],
  [0.79, 0.9, 0.52, 0.47, 0.52, 0.6],
  [0.22, 0.25, 0.34, 0.43, 0.49, 0.5],
  [0.23, 0.22, 0.19, 0.4, 0.46, 0.5],
  [0.2, 0.18, 0.66, 0.66, 0.76, 0.76],
  [0.42, 0.67, 0.47, 0.47, 0.7, 0.7],
  [0.63, 0.45, 0.8, 0.8, 0.8, 0.8],
  [0.68, 0.85, 0.85, 0.85, 0.85, 0.85],
];
const STAGES = ["Viendo solo lo anterior", "+ lo que pasó justo después", "+ 25 % del resto", "+ 50 % del resto", "+ 75 % del resto", "Viendo el episodio completo"];

const T = {
  grow: [0, sec(1.2)] as const,
  stage: [0, sec(7), sec(8.5), sec(10), sec(11.5), sec(13)],
  morph: sec(0.8),
};
const FULL = STAGES.length - 1;

/** Score of action k at frame f: grows in, then eases from stage to stage. */
function score(k: number, f: number): number {
  let v = SCORES[k][0] * progress(f, ...T.grow);
  for (let s = 1; s < STAGES.length; s++) {
    const p = progress(f, T.stage[s], T.stage[s] + T.morph);
    if (p > 0) v = SCORES[k][s - 1] + (SCORES[k][s] - SCORES[k][s - 1]) * p;
  }
  return v;
}

function stageAt(f: number): number {
  let s = 0;
  for (let i = 1; i < T.stage.length; i++) if (f >= T.stage[i]) s = i;
  return s;
}

const fmt = (v: number) => v.toFixed(2).replace(".", ",");

function Bar({ k }: { k: number }) {
  const f = useClipFrame();
  const h = Math.max(2, Math.round(score(k, f) * MAX_H));
  const fill = k === OPEN ? "navy" : k === COLD ? "muted" : "line";
  return <Box x={cx(k) - BAR_W / 2} y={BASE_Y - h} w={BAR_W} h={h} r={6} fill={fill} />;
}

function Value({ k }: { k: number }) {
  const f = useClipFrame();
  const s = stageAt(f);
  const h = Math.round(score(k, f) * MAX_H);
  return (
    <Label x={cx(k)} y={BASE_Y - h - 30} anchor="middle" mono tone={k === OPEN ? "navy" : "ink"} at={sec(1.2)}>
      {fmt(SCORES[k][s])}
    </Label>
  );
}

function Stage() {
  const s = stageAt(useClipFrame());
  return (
    <Label key={s} x={60} y={70} tone={s === FULL ? "navy" : "slate"} weight={800} at={T.stage[s]}>
      {STAGES[s]}
    </Label>
  );
}

function Scene() {
  return (
    <>
      <Stage />
      <Label x={60} y={140} at={-sec(0.5)}>6: guardar la taza fría</Label>
      <Label x={660} y={140} tone="navy" at={-sec(0.5)}>9: abrir el microondas</Label>

      <Path d={`M 60 ${BASE_Y} H 1150`} stroke="ink" at={-sec(0.5)} />
      {SCORES.map((_, k) =>
        k === OPEN ? null : <Bar key={k} k={k} />,
      )}
      <Highlight from={T.stage[FULL] + T.morph}>
        <Bar k={OPEN} />
      </Highlight>
      {SCORES.map((_, k) => (
        <Label key={`n-${k}`} x={cx(k)} y={650} anchor="middle" mono tone={k === OPEN || k === COLD ? "ink" : "slate"} at={-sec(0.5)}>
          {String(k + 1)}
        </Label>
      ))}
      <Value k={COLD} />
      <Value k={OPEN} />
    </>
  );
}

export default defineClip({
  id: "clip-2",
  title: "Lo que cambia al ver el final",
  durationInFrames: sec(18),
  captions: [
    { from: 0, to: sec(3.5), text: "Un episodio real de 12 acciones; el juez puntúa cada una de 0 a 1." },
    { from: sec(3.5), to: sec(7), text: "Viendo solo lo anterior, premia guardar la taza fría (6): 0,79." },
    { from: sec(7), to: sec(13), text: "A medida que ve más de lo que vino después, los puntajes cambian." },
    { from: sec(13), to: sec(18), text: "Con todo a la vista, abrir el microondas (9) sube de 0,20 a 0,76." },
  ],
  Scene,
});
