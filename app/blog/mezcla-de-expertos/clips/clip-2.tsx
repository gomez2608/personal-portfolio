"use client";

import { defineClip } from "@/app/components/blog/clips/clip-def";
import { Connector, Counter, Dim, FlowDot, Highlight, Node, Text } from "@/app/components/blog/clips/primitives";
import { sec, type Point } from "@/app/components/blog/clips/timing";

// Layout (full 1280×720 stage; captions sit in a bar under it, never on it). The eight
// score rows run from y=80 to y=640, so ~50px stays clear top and bottom; the router and
// the result sit at mid-height on either side. Every label, sub-labels included, uses the
// primitives' 34px default, the readable floor on phones.
const ROUTER = { x: 140, y: 360, w: 190, h: 120 };
const NAME_X = 330;
const BAR = { x: 560, h: 50, min: 30, perPoint: 6 };
const ROW = { top: 80, gap: 80 };
const RESULT = { x: 1110, y: 360, w: 210 };

/** Router scores for «París»; they add up to 100. */
const EXPERTS = [
  { name: "Gramática", score: 30 },
  { name: "Lugares", score: 45 },
  { name: "Matemáticas", score: 3 },
  { name: "Código", score: 2 },
  { name: "Fechas", score: 6 },
  { name: "Nombres", score: 8 },
  { name: "Tono", score: 4 },
  { name: "Lógica", score: 2 },
];
/** The top 2 scores. */
const CHOSEN = [0, 1];
/** Bulge of each winner's link to the result, by expert index. */
const LINK_CURVE: Record<number, number> = { 0: 50, 1: 10 };

const rowY = (i: number) => ROW.top + i * ROW.gap;
const barW = (score: number) => BAR.min + score * BAR.perPoint;
/** Centre of the percentage to the right of a bar. */
const scoreX = (score: number) => BAR.x + barW(score) + 56;
const routerOut: Point = [ROUTER.x + ROUTER.w / 2, ROUTER.y];
/** Links enter the result from the top, so they don't cross the rows below. */
const resultIn: Point = [RESULT.x, RESULT.y - 50];

// Timeline.
const T = {
  fan: sec(0.5),
  names: sec(0.8),
  bars: sec(1.5),
  highlight: sec(4.0),
  dim: sec(4.4),
  result: sec(7.0),
  link: sec(7.2),
  weights: sec(9.0),
};
const barAt = (i: number) => T.bars + i * sec(0.15);

function Row({ i }: { i: number }) {
  const { name, score } = EXPERTS[i];
  const y = rowY(i);
  const w = barW(score);
  return (
    <>
      <Connector from={routerOut} to={[NAME_X - 14, y]} tone="muted" drawFrom={T.fan} drawTo={T.fan + sec(0.7)} />
      <Text x={NAME_X} y={y} text={name} appearAt={T.names + i * sec(0.08)} />
      <Node x={BAR.x + w / 2} y={y} w={w} h={BAR.h} label="" tone="ink" appearAt={barAt(i)} />
      <Counter
        x={scoreX(score)}
        y={y}
        from={0}
        to={score}
        suffix=" %"
        size={34}
        tone="navy"
        start={barAt(i)}
        end={barAt(i) + sec(0.8)}
      />
    </>
  );
}

function Scene() {
  const rest = EXPERTS.map((_, i) => i).filter((i) => !CHOSEN.includes(i));
  return (
    <>
      <Node x={ROUTER.x} y={ROUTER.y} w={ROUTER.w} h={ROUTER.h} label="Router" sub="puntajes" tone="navy" appearAt={0} />

      <Dim from={T.dim} amount={0.25}>
        {rest.map((i) => (
          <Row key={i} i={i} />
        ))}
      </Dim>
      {CHOSEN.map((i) => (
        <Row key={i} i={i} />
      ))}
      {/* The winners turn navy and get the ring (Highlight stays at the top level of the Scene). */}
      {CHOSEN.map((i) => (
        <Highlight key={`hl-${i}`} from={T.highlight}>
          <Node
            x={BAR.x + barW(EXPERTS[i].score) / 2}
            y={rowY(i)}
            w={barW(EXPERTS[i].score)}
            h={BAR.h}
            label=""
            tone="navy"
            appearAt={T.highlight}
          />
        </Highlight>
      ))}

      <Node x={RESULT.x} y={RESULT.y} w={RESULT.w} label="Resultado" tone="ink" appearAt={T.result} />
      {CHOSEN.map((i) => {
        const from: Point = [scoreX(EXPERTS[i].score) + 56, rowY(i)];
        // Bend up so the upper link clears the longer bar's percentage below it.
        const curve = LINK_CURVE[i];
        return (
          <g key={`link-${i}`}>
            <Connector from={from} to={resultIn} curve={curve} tone="accent" width={3} drawFrom={T.link} drawTo={T.link + sec(0.7)} />
            <FlowDot from={from} to={resultIn} curve={curve} start={T.link + sec(0.7)} end={T.link + sec(1.5)} />
          </g>
        );
      })}
      <Text
        x={RESULT.x}
        y={RESULT.y + 110}
        text={"60 % Lugares\n40 % Gramática"}
        tone="navy"
        align="center"
        appearAt={T.weights}
      />
    </>
  );
}

export default defineClip({
  id: "clip-2",
  title: "Cómo decide el router",
  durationInFrames: sec(15),
  captions: [
    { from: 0, to: sec(3.2), text: "El router le da un puntaje a cada experto." },
    { from: sec(3.2), to: sec(6.6), text: "Los puntajes suman 100 %. Ganan Lugares y Gramática." },
    { from: sec(6.6), to: sec(9.6), text: "Solo esos 2 trabajan; los otros 6 descansan." },
    { from: sec(9.6), to: sec(15), text: "El resultado mezcla ambos: 60 % Lugares, 40 % Gramática." },
  ],
  Scene,
});
