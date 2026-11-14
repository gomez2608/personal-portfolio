"use client";

import { defineClip } from "@/app/components/blog/clips/clip-def";
import { Connector, Counter, Dim, FlowDot, Highlight, Node, Text } from "@/app/components/blog/clips/primitives";
import { sec, type Point } from "@/app/components/blog/clips/timing";

// Layout (1280×720 stage). Snapshots burn captions into the bottom ~140px, so everything
// sits above y≈570. Labels use the primitives' 34px default, the readable floor on phones.
const WORD = { x: 150, y: 190, w: 230 };
const ROUTER = { x: 500, y: 190, w: 230 };
const EXPERT = { x: 1060, w: 260, h: 54, top: 60, gap: 64 };
const COUNT = { x: 380, y: 360 };

const EXPERTS = ["Gramática", "Lugares", "Matemáticas", "Código", "Fechas", "Nombres", "Tono", "Lógica"];
/** Indices of the two experts the router picks for «París». */
const CHOSEN = [1, 0];

const expertY = (i: number) => EXPERT.top + i * EXPERT.gap;
const routerOut: Point = [ROUTER.x + ROUTER.w / 2, ROUTER.y];
const expertIn = (i: number): Point => [EXPERT.x - EXPERT.w / 2, expertY(i)];
const wordOut: Point = [WORD.x + WORD.w / 2, WORD.y];
const routerIn: Point = [ROUTER.x - ROUTER.w / 2, ROUTER.y];

// Timeline.
const T = {
  router: sec(0.8),
  toRouter: sec(1.0),
  expertsIn: sec(2.3),
  fanOut: sec(3.4),
  pick: sec(5.6),
  highlight: sec(6.7),
  dim: sec(6.9),
  count: sec(8.6),
  countText: sec(9.4),
};

function Scene() {
  const rest = EXPERTS.map((_, i) => i).filter((i) => !CHOSEN.includes(i));
  return (
    <>
      <Node x={WORD.x} y={WORD.y} w={WORD.w} label="París" sub="una palabra" appearAt={0} />
      <Node x={ROUTER.x} y={ROUTER.y} w={ROUTER.w} label="Router" sub="enrutador" tone="navy" appearAt={T.router} />
      <Connector from={wordOut} to={routerIn} drawFrom={T.toRouter} drawTo={T.toRouter + sec(0.6)} />
      <FlowDot from={wordOut} to={routerIn} start={T.toRouter + sec(0.6)} end={T.toRouter + sec(1.3)} />

      {/* Every expert the router could send the word to; the ones it skips fade back. */}
      <Dim from={T.dim}>
        {rest.map((i) => (
          <Connector
            key={i}
            from={routerOut}
            to={expertIn(i)}
            tone="muted"
            drawFrom={T.fanOut}
            drawTo={T.fanOut + sec(0.8)}
          />
        ))}
        {rest.map((i) => (
          <Node
            key={i}
            x={EXPERT.x}
            y={expertY(i)}
            w={EXPERT.w}
            h={EXPERT.h}
            label={EXPERTS[i]}
            appearAt={T.expertsIn + i * sec(0.12)}
          />
        ))}
      </Dim>

      {CHOSEN.map((i) => (
        <Connector
          key={`muted-${i}`}
          from={routerOut}
          to={expertIn(i)}
          tone="muted"
          drawFrom={T.fanOut}
          drawTo={T.fanOut + sec(0.8)}
        />
      ))}
      {CHOSEN.map((i) => (
        <Connector
          key={`pick-${i}`}
          from={routerOut}
          to={expertIn(i)}
          tone="accent"
          width={3}
          drawFrom={T.pick}
          drawTo={T.pick + sec(0.6)}
        />
      ))}
      {CHOSEN.map((i) => (
        <FlowDot key={`dot-${i}`} from={routerOut} to={expertIn(i)} start={T.pick + sec(0.6)} end={T.pick + sec(1.2)} />
      ))}
      {CHOSEN.map((i) => (
        <Highlight key={`hl-${i}`} from={T.highlight}>
          <Node
            x={EXPERT.x}
            y={expertY(i)}
            w={EXPERT.w}
            h={EXPERT.h}
            label={EXPERTS[i]}
            appearAt={T.expertsIn + i * sec(0.12)}
          />
        </Highlight>
      ))}

      <Counter x={COUNT.x} y={COUNT.y} from={100} to={25} suffix=" %" size={110} start={T.count} end={T.count + sec(1.2)} accent />
      <Text
        x={COUNT.x}
        y={COUNT.y + 105}
        text={"de esta capa trabaja\nen cada palabra"}
        align="center"
        appearAt={T.countText}
      />
    </>
  );
}

export default defineClip({
  id: "clip-1",
  title: "La idea general",
  durationInFrames: sec(13),
  captions: [
    { from: 0, to: sec(2.6), text: "Llega una palabra: «París»." },
    { from: sec(2.6), to: sec(5.6), text: "El router conoce a 8 expertos, cada uno con su tema." },
    { from: sec(5.6), to: sec(8.6), text: "Elige solo a los 2 que mejor encajan con «París»." },
    { from: sec(8.6), to: sec(13), text: "2 de 8 expertos: trabaja una cuarta parte." },
  ],
  Scene,
});
