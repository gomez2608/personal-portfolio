"use client";

import { defineClip } from "@/app/components/blog/clips/clip-def";
import { Connector, Dim, FlowDot, Highlight, Node } from "@/app/components/blog/clips/primitives";
import { sec, type Point } from "@/app/components/blog/clips/timing";

// Layout (full 1280×720 stage; captions sit in a bar under it, never on it). Three columns:
// the frozen prefix on the left at mid-height; the three endings from it in the middle
// (y=90 to y=630); the training pair on the right, discarded on top (next to the original)
// and preferred below (next to the short ending), so the two links never cross. Every label and sub-label uses the
// primitives' 34px default.
const PREFIX = { x: 180, y: 360, w: 260, h: 120 };
const END = { x: 610, w: 340, h: 120, ys: [150, 360, 570] };
const PAIR = { x: 1070, w: 300, h: 120, ys: [250, 520] };

/** The original ending and two new ones; «Nuevo A» is invented for the example. */
const ENDINGS = [
  { label: "Original", sub: "1.247 tokens" },
  { label: "Nuevo A", sub: "incorrecto" },
  { label: "Nuevo B", sub: "296 tokens" },
];
const ORIGINAL = 0;
const WRONG = 1;
const SHORT = 2;

const prefixOut: Point = [PREFIX.x + PREFIX.w / 2, PREFIX.y];
const endIn = (i: number): Point => [END.x - END.w / 2, END.ys[i]];
const endOut = (i: number): Point => [END.x + END.w / 2, END.ys[i]];
const pairIn = (i: number): Point => [PAIR.x - PAIR.w / 2, PAIR.ys[i]];

// Already on screen at frame 0 (a Node at appearAt 0 is still fading in there).
const START = -sec(0.5);

// Timeline.
const T = {
  original: sec(0.8),
  newEnds: sec(4.0),
  check: sec(7.6),
  dimWrong: sec(7.8),
  pair: sec(11.2),
};
const endAt = (i: number) => (i === ORIGINAL ? T.original : T.newEnds + (i - 1) * sec(0.8));

function Ending({ i }: { i: number }) {
  return (
    <>
      <Connector from={prefixOut} to={endIn(i)} tone="muted" drawFrom={endAt(i) - sec(0.5)} drawTo={endAt(i)} />
      <Node x={END.x} y={END.ys[i]} w={END.w} h={END.h} label={ENDINGS[i].label} sub={ENDINGS[i].sub} appearAt={endAt(i)} />
    </>
  );
}

function Scene() {
  return (
    <>
      <Node x={PREFIX.x} y={PREFIX.y} w={PREFIX.w} h={PREFIX.h} label="Prefijo" sub="congelado" tone="navy" appearAt={START} />

      <Ending i={ORIGINAL} />
      <Dim from={T.dimWrong} amount={0.25}>
        <Ending i={WRONG} />
      </Dim>
      <Ending i={SHORT} />
      <FlowDot from={prefixOut} to={endIn(SHORT)} start={T.newEnds + sec(0.8)} end={T.newEnds + sec(1.6)} />

      {/* The shortest correct ending wins. */}
      <Highlight from={T.check}>
        <Node
          x={END.x}
          y={END.ys[SHORT]}
          w={END.w}
          h={END.h}
          label={ENDINGS[SHORT].label}
          sub={ENDINGS[SHORT].sub}
          tone="navy"
          appearAt={T.check}
        />
      </Highlight>

      {/* The training pair: both endings continue the same prefix. */}
      <Connector from={endOut(SHORT)} to={pairIn(1)} tone="accent" width={3} drawFrom={T.pair} drawTo={T.pair + sec(0.7)} />
      <FlowDot from={endOut(SHORT)} to={pairIn(1)} start={T.pair + sec(0.7)} end={T.pair + sec(1.3)} />
      <Connector from={endOut(ORIGINAL)} to={pairIn(0)} tone="muted" drawFrom={T.pair + sec(0.3)} drawTo={T.pair + sec(1.0)} />
      <Highlight from={T.pair + sec(1.3)}>
        <Node x={PAIR.x} y={PAIR.ys[1]} w={PAIR.w} h={PAIR.h} label="Preferido" sub="el corto" tone="navy" appearAt={T.pair + sec(0.5)} />
      </Highlight>
      <Node x={PAIR.x} y={PAIR.ys[0]} w={PAIR.w} h={PAIR.h} label="Descartado" sub="el largo" tone="muted" appearAt={T.pair + sec(0.8)} />
    </>
  );
}

export default defineClip({
  id: "clip-2",
  title: "Cómo se arma cada par",
  durationInFrames: sec(17),
  captions: [
    { from: 0, to: sec(4), text: "Se congela el razonamiento donde ya podía concluir." },
    { from: sec(4), to: sec(7.6), text: "Desde ahí, el mismo modelo escribe otros finales." },
    { from: sec(7.6), to: sec(11.2), text: "¿Llegan a 2/7? Se queda el correcto más corto." },
    { from: sec(11.2), to: sec(17), text: "El par: preferir el corto (296), no el largo (1.247)." },
  ],
  Scene,
});
