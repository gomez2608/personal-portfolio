"use client";
// Construido a partir de: el pedido del usuario T, el índice tipado de identidades I y la búsqueda en conjunto del piso sobre los destinos de cada llamada (paper, sección 3.1, figura 2A y algoritmo 1).

import { defineClip } from "@/app/components/blog/clips/clip-def";
import { Box, Fade, Label, MoveAlong, Path } from "@/app/components/blog/clips/draw";
import { Highlight } from "@/app/components/blog/clips/primitives";
import { sec, type Point } from "@/app/components/blog/clips/timing";

// Layout: the two places a destination may come from on the left (x=60–760): your request
// on top (y=60–200) and the index of typed fields below it (y=250–520), filled from the
// email's «remitente» field; its body never enters. On the right (x=840–1200), the three
// destinations the agent proposes, one per row; each slides left to look itself up. The
// accounts and the address are invented.
const REQUEST = { x: 60, y: 60, w: 700, h: 140 };
const INDEX = { x: 60, y: 250, w: 700, h: 270 };
const CHIP = { x: 840, w: 360, h: 70 };
const ROWS = [130, 400, 580];
const MATCH: (Point | null)[] = [
  [680, 145], // «123» in your request
  [530, 400], // the sender in the index
  null, // «999»: nowhere
];
const DESTS = ["cuenta 123", "luz@factura.co", "cuenta 999"];
const VERDICT = ["pasa", "pasa", "bloqueado"];

const START = -sec(0.5);
const T = {
  index: sec(1),
  rows: [sec(4), sec(7.5), sec(11)],
};

function Chip({ i }: { i: number }) {
  const y = ROWS[i];
  const t = T.rows[i];
  const ok = MATCH[i] !== null;
  return (
    <>
      {/* A refused destination fades; its verdict stays readable. */}
      <Fade from={ok ? Infinity : t + sec(1.4)} to={0.35}>
        <Box x={CHIP.x} y={y - CHIP.h / 2} w={CHIP.w} h={CHIP.h} r={10} fill="ink" stroke="ink" weight="bold" at={START + i * sec(0.3)} />
        <Label x={CHIP.x + 24} y={y} mono at={START + i * sec(0.3)}>{DESTS[i]}</Label>
      </Fade>
      {ok ? (
        <Highlight from={t + sec(1.4)}>
          <Box x={CHIP.x} y={y - CHIP.h / 2} w={CHIP.w} h={CHIP.h} r={10} fill="navy" at={t + sec(1.2)} />
          <Label x={CHIP.x + 24} y={y} mono tone="white" at={t + sec(1.2)}>{DESTS[i]}</Label>
        </Highlight>
      ) : null}
      <Label x={CHIP.x + CHIP.w} y={y + CHIP.h / 2 + 30} anchor="end" tone={ok ? "navy" : "slate"} weight={800} at={t + sec(1.4)}>
        {VERDICT[i]}
      </Label>
    </>
  );
}

function Lookup({ i }: { i: number }) {
  const y = ROWS[i];
  const t = T.rows[i];
  const m = MATCH[i];
  if (m) {
    const pts: Point[] = [[CHIP.x - 10, y], [m[0] + 90, m[1]]];
    return (
      <>
        <Path d={`M ${CHIP.x - 10} ${y} L ${m[0] + 90} ${m[1]}`} stroke="navy" weight="bold" at={t} dur={sec(0.8)} />
        <Fade from={t + sec(0.8)} to={0} dur={sec(0.2)}>
          <MoveAlong points={pts} from={t} to={t + sec(0.8)}>
            <Box x={-12} y={-12} w={24} h={24} r={6} fill="accent" at={t} />
          </MoveAlong>
        </Fade>
      </>
    );
  }
  // «999» is looked up in both and found in neither.
  return (
    <Fade from={t + sec(1.4)} to={0.5}>
      <Path d={`M ${CHIP.x - 10} ${y} C 790 ${y}, 800 200, 770 140`} stroke="muted" weight="bold" dashed at={t} dur={sec(0.6)} />
      <Path d={`M ${CHIP.x - 10} ${y} C 790 ${y}, 800 440, 770 400`} stroke="muted" weight="bold" dashed at={t + sec(0.3)} dur={sec(0.6)} />
    </Fade>
  );
}

function Scene() {
  return (
    <>
      {/* Your request: what you named is never suspicious. */}
      <Box x={REQUEST.x} y={REQUEST.y} w={REQUEST.w} h={REQUEST.h} r={14} fill="fog" stroke="line" at={START} />
      <Label x={REQUEST.x + 30} y={REQUEST.y + 40} tone="slate" weight={600} at={START}>Tu pedido</Label>
      <Label x={REQUEST.x + 30} y={145} at={START}>«Paga la factura a la cuenta 123»</Label>

      {/* The index: only typed fields of read-only tools. */}
      <Box x={INDEX.x} y={INDEX.y} w={INDEX.w} h={INDEX.h} r={14} fill="ink" stroke="line" at={START} />
      <Label x={INDEX.x + 30} y={INDEX.y + 45} tone="slate" weight={600} at={START}>Índice (campos tipados)</Label>
      <Label x={INDEX.x + 30} y={400} tone="slate" weight={600} at={T.index}>remitente</Label>
      <Label x={290} y={400} mono at={T.index}>luz@factura.co</Label>
      <Path d={`M ${INDEX.x + 30} 450 H ${INDEX.x + INDEX.w - 30}`} stroke="line" at={T.index} />
      <Fade from={T.index + sec(0.6)} to={0.5}>
        <Label x={INDEX.x + 30} y={485} tone="slate" weight={600} at={T.index + sec(0.4)}>cuerpo: no entra</Label>
      </Fade>

      {[0, 1, 2].map((i) => (
        <Lookup key={`l-${i}`} i={i} />
      ))}
      {[0, 1, 2].map((i) => (
        <Chip key={i} i={i} />
      ))}
    </>
  );
}

export default defineClip({
  id: "clip-2",
  title: "De dónde salió cada destino",
  durationInFrames: sec(16),
  captions: [
    { from: 0, to: sec(4), text: "Un destino pasa si está en tu pedido o en el índice de campos tipados." },
    { from: sec(4), to: sec(7.5), text: "La cuenta 123 está en tu pedido: pasa." },
    { from: sec(7.5), to: sec(11), text: "La dirección vino del campo «remitente», que está indexado: pasa." },
    { from: sec(11), to: sec(16), text: "La cuenta 999 no está en ninguno de los dos: se bloquea." },
  ],
  Scene,
});
