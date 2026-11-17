"use client";

import { defineClip } from "@/app/components/blog/clips/clip-def";
import { Connector, Dim, FlowDot, Highlight, Node } from "@/app/components/blog/clips/primitives";
import { sec, type Point } from "@/app/components/blog/clips/timing";

// Layout (full 1280×720 stage; captions sit in a bar under it, never on it). Top row: the
// three useful steps (it ends where the model could already answer), x=60 to x=1220.
// Middle row: the extra rechecking, narrower (x=50 to x=1070) so a clear lane stays on the
// right for the link from the stop point down to the answer box (x=720 to x=1160,
// y=500 to y=620).
const STEP = { w: 340, h: 100 };
const COLS = [230, 640, 1050];
const EXTRA_STEP = { w: 300, h: 100 };
const EXTRA_COLS = [200, 560, 920];
const ROW_TOP = 140;
const ROW_EXTRA = 330;
const ANSWER = { x: 940, y: 560, w: 440, h: 120 };

const USEFUL = ["Plantea", "Calcula: 2/7", "Comprueba"];
const EXTRA = ["Mira de nuevo", "Reformula", "Otra vez"];

const right = (x: number, y: number, w = STEP.w): Point => [x + w / 2, y];
const left = (x: number, y: number, w = STEP.w): Point => [x - w / 2, y];
/** From the last useful step down to the first extra step. */
const wrapFrom: Point = [COLS[2] - 60, ROW_TOP + STEP.h / 2];
const wrapTo: Point = [EXTRA_COLS[0], ROW_EXTRA - EXTRA_STEP.h / 2];
/** From the step where it could stop straight down the right lane to the answer. */
const stopFrom: Point = [1160, ROW_TOP + STEP.h / 2];
const answerIn: Point = [1140, ANSWER.y - ANSWER.h / 2];

// Already on screen at frame 0 (a Node at appearAt 0 is still fading in there).
const START = -sec(0.5);

// Timeline.
const T = {
  useful: START,
  extra: sec(7.5),
  mark: sec(11.0),
  dim: sec(11.2),
  answer: sec(12.0),
  link: sec(12.2),
};
/** «Plantea» is there from the start; the other two useful steps arrive with the second caption. */
const usefulAt = (i: number) => (i === 0 ? T.useful : sec(3.5) + (i - 1) * sec(1.4));
const extraAt = (i: number) => T.extra + i * sec(0.9);

function Scene() {
  return (
    <>
      {USEFUL.map((label, i) => (
        <Node key={label} x={COLS[i]} y={ROW_TOP} w={STEP.w} h={STEP.h} label={label} appearAt={usefulAt(i)} />
      ))}
      {[0, 1].map((i) => (
        <Connector
          key={`u-${i}`}
          from={right(COLS[i], ROW_TOP)}
          to={left(COLS[i + 1], ROW_TOP)}
          drawFrom={usefulAt(i + 1) - sec(0.4)}
          drawTo={usefulAt(i + 1)}
        />
      ))}

      {/* The rechecking after the model already had 2/7; it fades once the stop point is marked. */}
      <Dim from={T.dim} amount={0.25}>
        <Connector from={wrapFrom} to={wrapTo} tone="muted" drawFrom={T.extra - sec(0.5)} drawTo={T.extra} />
        {EXTRA.map((label, i) => (
          <Node
            key={label}
            x={EXTRA_COLS[i]}
            y={ROW_EXTRA}
            w={EXTRA_STEP.w}
            h={EXTRA_STEP.h}
            label={label}
            tone="muted"
            appearAt={extraAt(i)}
          />
        ))}
        {[0, 1].map((i) => (
          <Connector
            key={`e-${i}`}
            from={right(EXTRA_COLS[i], ROW_EXTRA, EXTRA_STEP.w)}
            to={left(EXTRA_COLS[i + 1], ROW_EXTRA, EXTRA_STEP.w)}
            tone="muted"
            drawFrom={extraAt(i + 1) - sec(0.4)}
            drawTo={extraAt(i + 1)}
          />
        ))}
      </Dim>

      {/* The step where it could already conclude. */}
      <Highlight from={T.mark}>
        <Node x={COLS[2]} y={ROW_TOP} w={STEP.w} h={STEP.h} label={USEFUL[2]} tone="navy" appearAt={T.mark} />
      </Highlight>

      <Connector from={stopFrom} to={answerIn} tone="accent" width={3} drawFrom={T.link} drawTo={T.link + sec(0.7)} />
      <FlowDot from={stopFrom} to={answerIn} start={T.link + sec(0.7)} end={T.link + sec(1.3)} />
      <Node
        x={ANSWER.x}
        y={ANSWER.y}
        w={ANSWER.w}
        h={ANSWER.h}
        label="Respuesta: 2/7"
        sub="concluir aquí"
        tone="navy"
        appearAt={T.answer}
      />
    </>
  );
}

export default defineClip({
  id: "clip-1",
  title: "La idea general",
  durationInFrames: sec(16),
  captions: [
    { from: 0, to: sec(3.5), text: "Pregunta: «¿qué fracción de 1/2 es 1/7?». El modelo razona." },
    { from: sec(3.5), to: sec(7.5), text: "Plantea, calcula 2/7 y lo comprueba: ya tiene la respuesta." },
    { from: sec(7.5), to: sec(11), text: "Pero sigue: mira de nuevo, reformula y lo comprueba otra vez." },
    { from: sec(11), to: sec(16), text: "LoCo le enseña a reconocer ese punto y concluir ahí." },
  ],
  Scene,
});
