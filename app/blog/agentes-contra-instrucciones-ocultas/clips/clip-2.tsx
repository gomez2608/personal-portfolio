"use client";

import { defineClip } from "@/app/components/blog/clips/clip-def";
import { Connector, Dim, FlowDot, Highlight, Node } from "@/app/components/blog/clips/primitives";
import { sec, type Point } from "@/app/components/blog/clips/timing";

// Layout (full 1280×720 stage; captions sit in a bar under it, never on it). Three rows,
// one per origin of a destination (y=90 to y=630): the origin on the left, the filter as
// one tall box in the middle, and the outcome on the right. All links are horizontal.
const SOURCE = { x: 240, w: 380, h: 120 };
const FILTER = { x: 700, y: 360, w: 200, h: 540 };
const OUT = { x: 1080, w: 260, h: 100 };
const ROWS = [150, 360, 570];

/** Where each destination came from; the account numbers are invented for the example. */
const ORIGINS = [
  { label: "Tu pedido", sub: "«cuenta 123»", passes: true },
  { label: "Campo tipado", sub: "remitente", passes: true },
  { label: "Texto libre", sub: "«cuenta 999»", passes: false },
];

const sourceOut = (i: number): Point => [SOURCE.x + SOURCE.w / 2, ROWS[i]];
const filterIn = (i: number): Point => [FILTER.x - FILTER.w / 2, ROWS[i]];
const filterOut = (i: number): Point => [FILTER.x + FILTER.w / 2, ROWS[i]];
const outIn = (i: number): Point => [OUT.x - OUT.w / 2, ROWS[i]];

// Already on screen at frame 0 (a Node at appearAt 0 is still fading in there).
const START = -sec(0.5);

// Timeline.
const T = {
  sources: START,
  filter: sec(1.2),
  links: sec(1.8),
  rows: [sec(4.0), sec(7.5), sec(11.0)],
};

function Row({ i }: { i: number }) {
  const { passes } = ORIGINS[i];
  const t = T.rows[i];
  return (
    <>
      <FlowDot from={sourceOut(i)} to={filterIn(i)} tone="ink" start={t} end={t + sec(0.6)} />
      <Connector
        from={filterOut(i)}
        to={outIn(i)}
        tone={passes ? "accent" : "muted"}
        width={passes ? 3 : 2}
        drawFrom={t + sec(0.6)}
        drawTo={t + sec(1.2)}
      />
      {passes ? <FlowDot from={filterOut(i)} to={outIn(i)} start={t + sec(1.2)} end={t + sec(1.8)} /> : null}
    </>
  );
}

function Source({ i }: { i: number }) {
  return (
    <>
      <Node
        x={SOURCE.x}
        y={ROWS[i]}
        w={SOURCE.w}
        h={SOURCE.h}
        label={ORIGINS[i].label}
        sub={ORIGINS[i].sub}
        appearAt={T.sources + i * sec(0.4)}
      />
      <Connector from={sourceOut(i)} to={filterIn(i)} tone="muted" drawFrom={T.links} drawTo={T.links + sec(0.6)} />
    </>
  );
}

function Scene() {
  const blocked = 2;
  return (
    <>
      <Source i={0} />
      <Source i={1} />
      <Dim from={T.rows[blocked] + sec(1.4)} amount={0.3}>
        <Source i={blocked} />
      </Dim>
      <Node x={FILTER.x} y={FILTER.y} w={FILTER.w} h={FILTER.h} label="Filtro" tone="navy" appearAt={T.filter} />

      {ORIGINS.map((_, i) => (
        <Row key={i} i={i} />
      ))}

      {/* The two admitted destinations get the ring. */}
      {[0, 1].map((i) => (
        <Highlight key={`hl-${i}`} from={T.rows[i] + sec(1.8)}>
          <Node x={OUT.x} y={ROWS[i]} w={OUT.w} h={OUT.h} label="Pasa" tone="navy" appearAt={T.rows[i] + sec(1.2)} />
        </Highlight>
      ))}
      <Node x={OUT.x} y={ROWS[blocked]} w={OUT.w} h={OUT.h} label="Bloqueado" tone="muted" appearAt={T.rows[blocked] + sec(1.2)} />
    </>
  );
}

export default defineClip({
  id: "clip-2",
  title: "De dónde salió cada destino",
  durationInFrames: sec(16),
  captions: [
    { from: 0, to: sec(4), text: "El filtro no lee la orden: mira de dónde salió cada destino." },
    { from: sec(4), to: sec(7.5), text: "Una cuenta que tú escribiste en tu pedido pasa." },
    { from: sec(7.5), to: sec(11), text: "Una dirección del campo «remitente» de un correo también pasa." },
    { from: sec(11), to: sec(16), text: "Una cuenta escrita en texto libre se bloquea, diga lo que diga." },
  ],
  Scene,
});
