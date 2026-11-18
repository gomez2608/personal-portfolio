"use client";
// Construido a partir de: un mismo modelo de decisión consultado de tres maneras, cada una con su pregunta y su salida tipada (paper, figura 1; sección 3.1.1 y figura 3a; tabla 9; sección 3.3 y tabla 3).

import { defineClip } from "@/app/components/blog/clips/clip-def";
import { Box, Fade, Label, Path } from "@/app/components/blog/clips/draw";
import { Highlight } from "@/app/components/blog/clips/primitives";
import { sec } from "@/app/components/blog/clips/timing";

// Layout: three rows, one per role (centres y=210, 400, 590), under a title at y=70. Left
// (x=60): the role and the question it is asked. Middle (x=520–1000): what it answers. Right
// (centre x=1150): the number that role produces.
const ROWS = [210, 400, 590];
const OUT_X = 520;
const RESULT_X = 1150;

// Actor: JEV's mean probability on each kind of action, over 116 states (paper, figure 3a).
const OPTIONS = [
  { label: "guardarla ya", p: 0.638, text: "63,8 %", fill: "muted" as const },
  { label: "calentarla", p: 0.146, text: "14,6 %", fill: "navy" as const },
];
const BAR_X = 770;
const BAR_MAX = 160;

// Judge: the recorded 12-action episode of the heated mug (paper, table 9); action 9 opens the microwave.
const STEPS = 12;
const OPEN = 8;
const SQ = 30;
const SQ_PITCH = 40;

// Teacher: the student's success on ALFWorld (paper, table 3).
const METER = { x: OUT_X, w: 480, h: 24 };

const START = -sec(0.5);
const T = {
  actor: sec(3.5),
  judge: sec(7),
  teacher: sec(10.5),
  dimActor: sec(13),
};

function Role({ i, name, question }: { i: number; name: string; question: string }) {
  return (
    <>
      <Label x={60} y={ROWS[i] - 35} weight={800} at={START}>{name}</Label>
      <Label x={60} y={ROWS[i] + 30} mono at={START}>{question}</Label>
    </>
  );
}

function Result({ i, sub, value, tone, at }: { i: number; sub: string; value: string; tone: "ink" | "navy"; at: number }) {
  return (
    <>
      <Label x={RESULT_X} y={ROWS[i] - 35} anchor="middle" tone="slate" weight={600} at={at}>{sub}</Label>
      <Label x={RESULT_X} y={ROWS[i] + 30} anchor="middle" size={48} weight={800} tone={tone} at={at}>{value}</Label>
    </>
  );
}

function Scene() {
  const [actorY, judgeY, teacherY] = ROWS;
  return (
    <>
      <Label x={60} y={70} tone="slate" weight={600} at={START}>Un mismo modelo, JEV, con tres preguntas</Label>
      <Path d="M 60 305 H 1220" stroke="line" at={START} />
      <Path d="M 60 495 H 1220" stroke="line" at={START} />

      {/* Actor: it puts most of its probability on the easy step. */}
      <Fade from={T.dimActor} to={0.45}>
        <Role i={0} name="Actor" question="¿qué acción sigue?" />
        {OPTIONS.map((o, k) => {
          const y = actorY - 35 + k * 70;
          return (
            <g key={o.label}>
              <Label x={OUT_X} y={y} at={T.actor}>{o.label}</Label>
              <Box x={BAR_X} y={y - 12} w={Math.round(o.p * BAR_MAX)} h={24} r={6} fill={o.fill} grow at={T.actor + sec(0.4)} dur={sec(0.8)} />
              <Label x={BAR_X + Math.round(o.p * BAR_MAX) + 14} y={y} mono at={T.actor + sec(1.2)}>{o.text}</Label>
            </g>
          );
        })}
        <Result i={0} sub="resuelve" value="42,9 %" tone="ink" at={T.actor + sec(2)} />
      </Fade>

      {/* Judge: it scores the actions of a recorded episode, seeing all of it. */}
      <Role i={1} name="Juez" question="¿esta acción ayudó?" />
      <Label x={OUT_X} y={judgeY - 35} tone="slate" weight={600} at={T.judge}>episodio grabado</Label>
      {Array.from({ length: STEPS }, (_, k) => (
        <Box
          key={k}
          x={OUT_X + k * SQ_PITCH}
          y={judgeY + 30 - SQ / 2}
          w={SQ}
          h={SQ}
          r={6}
          fill={k === OPEN ? "line" : "fog"}
          stroke="line"
          at={T.judge + k * sec(0.1)}
        />
      ))}
      <Highlight from={T.judge + sec(1.8)}>
        <Box x={OUT_X + OPEN * SQ_PITCH} y={judgeY + 30 - SQ / 2} w={SQ} h={SQ} r={6} fill="navy" at={T.judge + sec(1.6)} />
      </Highlight>
      <Result i={1} sub="paso 9" value="0,76" tone="navy" at={T.judge + sec(2)} />

      {/* Teacher: its scores train a small student, which ends up far ahead of it. */}
      <Role i={2} name="Maestro" question="puntúa al alumno" />
      <Box x={METER.x} y={teacherY - 30 - METER.h / 2} w={METER.w} h={METER.h} r={6} fill="fog" stroke="line" at={T.teacher} />
      <Box x={METER.x} y={teacherY - 30 - METER.h / 2} w={Math.round(0.829 * METER.w)} h={METER.h} r={6} fill="navy" grow at={T.teacher + sec(0.4)} dur={sec(1.5)} />
      <Path
        d={`M ${METER.x + Math.round(0.728 * METER.w)} ${teacherY - 56} V ${teacherY - 4}`}
        stroke="ink"
        weight="bold"
        at={T.teacher + sec(0.6)}
        dur={sec(0.3)}
      />
      <Label x={OUT_X} y={teacherY + 30} mono at={T.teacher + sec(0.8)}>sin maestro: 72,8 %</Label>
      <Highlight from={T.teacher + sec(2.3)}>
        <Box x={RESULT_X - 95} y={teacherY - 75} w={190} h={150} r={14} fill="fog" stroke="line" at={T.teacher + sec(2)} />
      </Highlight>
      <Result i={2} sub="alumno" value="82,9 %" tone="navy" at={T.teacher + sec(2)} />
    </>
  );
}

export default defineClip({
  id: "clip-1",
  title: "La idea general",
  durationInFrames: sec(16),
  captions: [
    { from: 0, to: sec(3.5), text: "Un mismo modelo de decisión, JEV, y tres preguntas distintas." },
    { from: sec(3.5), to: sec(7), text: "Como actor elige el paso fácil y resuelve solo 42,9 % de las tareas." },
    { from: sec(7), to: sec(10.5), text: "Como juez puntúa un episodio grabado: abrir el microondas, 0,76." },
    { from: sec(10.5), to: sec(16), text: "Como maestro, sus puntajes llevan a un alumno de 72,8 % a 82,9 %." },
  ],
  Scene,
});
