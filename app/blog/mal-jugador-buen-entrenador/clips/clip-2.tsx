"use client";

import { defineClip } from "@/app/components/blog/clips/clip-def";
import { Dim, Highlight, Node, Text } from "@/app/components/blog/clips/primitives";
import { sec } from "@/app/components/blog/clips/timing";

// Layout (full 1280×720 stage; captions sit in a bar under it, never on it). A score table:
// four actions of one recorded episode down the left (x=60), the judge's score seeing only
// what came before each action in the middle column, and its score seeing the whole episode
// in the right column. Headers at y=100, rows from y=220 to y=580.
const NAME_X = 60;
const COL = { before: 780, full: 1090, w: 200, h: 80 };
const HEADER_Y = 100;
const ROWS = [220, 340, 460, 580];

/** JEV's «did this action help?» scores, paper Table 9 (steps 6, 8, 9 and 10). */
const ACTIONS = [
  { name: "Guardar taza fría", before: "0,79", full: "0,60" },
  { name: "Ir al microondas", before: "0,23", full: "0,50" },
  { name: "Abrir microondas", before: "0,20", full: "0,76" },
  { name: "Calentar la taza", before: "0,42", full: "0,70" },
];
const COLD = 0;
const OPEN = 2;

// Already on screen at frame 0 (a Node at appearAt 0 is still fading in there).
const START = -sec(0.5);

// Timeline.
const T = {
  names: START,
  headerBefore: START,
  before: sec(3.5),
  cold: sec(5.5),
  headerFull: sec(7.5),
  full: sec(8.0),
  open: sec(11.5),
};
const beforeAt = (i: number) => T.before + i * sec(0.3);
const fullAt = (i: number) => T.full + i * sec(0.4);

function Scene() {
  return (
    <>
      {ACTIONS.map((a, i) => (
        <Text key={a.name} x={NAME_X} y={ROWS[i]} text={a.name} appearAt={T.names + i * sec(0.25)} />
      ))}

      {/* What the judge sees up to each action; it steps back once the full view is in. */}
      <Dim from={T.open} amount={0.35}>
        <Text x={COL.before} y={HEADER_Y} text="Sin ver el final" align="center" appearAt={T.headerBefore} />
        {ACTIONS.map((a, i) => (
          <Node key={`b-${i}`} x={COL.before} y={ROWS[i]} w={COL.w} h={COL.h} label={a.before} appearAt={beforeAt(i)} />
        ))}
        <Node x={COL.before} y={ROWS[COLD]} w={COL.w} h={COL.h} label={ACTIONS[COLD].before} tone="navy" appearAt={T.cold} />
      </Dim>

      <Text x={COL.full} y={HEADER_Y} text="Viendo todo" tone="navy" align="center" appearAt={T.headerFull} />
      {ACTIONS.map((a, i) =>
        i === OPEN ? null : (
          <Node key={`f-${i}`} x={COL.full} y={ROWS[i]} w={COL.w} h={COL.h} label={a.full} appearAt={fullAt(i)} />
        ),
      )}
      <Highlight from={T.open}>
        <Node x={COL.full} y={ROWS[OPEN]} w={COL.w} h={COL.h} label={ACTIONS[OPEN].full} tone="navy" appearAt={fullAt(OPEN)} />
      </Highlight>
    </>
  );
}

export default defineClip({
  id: "clip-2",
  title: "Lo que cambia al ver el final",
  durationInFrames: sec(16),
  captions: [
    { from: 0, to: sec(3.5), text: "Un episodio real: «pon una taza caliente en el mueble»." },
    { from: sec(3.5), to: sec(7.5), text: "Sin ver el final, el juez premia guardar la taza fría: 0,79." },
    { from: sec(7.5), to: sec(11.5), text: "Viendo el episodio completo, los puntajes cambian." },
    { from: sec(11.5), to: sec(16), text: "Abrir el microondas sube de 0,20 a 0,76: era un paso clave." },
  ],
  Scene,
});
