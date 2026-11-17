"use client";

import { defineClip } from "@/app/components/blog/clips/clip-def";
import { Connector, Dim, FlowDot, Highlight, Node, Text } from "@/app/components/blog/clips/primitives";
import { sec, type Point } from "@/app/components/blog/clips/timing";

// Layout (full 1280×720 stage; captions sit in a bar under it, never on it). The model on
// the left at mid-height; its three roles stacked in the middle (y=80 to y=640); on the
// right, what each role gives: the actor's own success, what the judge sees, and the
// student the teacher trains.
const MODEL = { x: 180, y: 360, w: 260, h: 120 };
const ROLE = { x: 600, w: 300, h: 120 };
const ROWS = [140, 360, 580];
const RESULT_X = 1050;
const STUDENT = { x: RESULT_X, y: ROWS[2], w: 260, h: 120 };

const ROLES = [
  { label: "Actor", sub: "elige" },
  { label: "Juez", sub: "puntúa" },
  { label: "Maestro", sub: "enseña" },
];
const ACTOR = 0;
const JUDGE = 1;
const TEACHER = 2;

const modelOut: Point = [MODEL.x + MODEL.w / 2, MODEL.y];
const roleIn = (i: number): Point => [ROLE.x - ROLE.w / 2, ROWS[i]];
const teacherOut: Point = [ROLE.x + ROLE.w / 2, ROWS[TEACHER]];
const studentIn: Point = [STUDENT.x - STUDENT.w / 2, STUDENT.y];

// Already on screen at frame 0 (a Node at appearAt 0 is still fading in there).
const START = -sec(0.5);

// Timeline.
const T = {
  roles: sec(0.6),
  links: sec(0.8),
  actor: sec(3.5),
  judge: sec(7.0),
  teacher: sec(10.5),
  student: sec(11.3),
  dimActor: sec(12.2),
};

function Activate({ i, at }: { i: number; at: number }) {
  return (
    <>
      <Connector from={modelOut} to={roleIn(i)} tone="accent" width={3} drawFrom={at} drawTo={at + sec(0.6)} />
      <FlowDot from={modelOut} to={roleIn(i)} start={at + sec(0.6)} end={at + sec(1.2)} />
    </>
  );
}

function Scene() {
  return (
    <>
      <Node x={MODEL.x} y={MODEL.y} w={MODEL.w} h={MODEL.h} label="JEV" sub="un modelo" tone="navy" appearAt={START} />
      {ROLES.map((_, i) => (
        <Connector key={`l-${i}`} from={modelOut} to={roleIn(i)} tone="muted" drawFrom={T.links} drawTo={T.links + sec(0.6)} />
      ))}

      {/* As an actor it solves few tasks; that row fades once the teacher result is in. */}
      <Dim from={T.dimActor} amount={0.3}>
        <Node x={ROLE.x} y={ROWS[ACTOR]} w={ROLE.w} h={ROLE.h} label={ROLES[ACTOR].label} sub={ROLES[ACTOR].sub} appearAt={T.roles} />
        <Activate i={ACTOR} at={T.actor} />
        <Text x={RESULT_X} y={ROWS[ACTOR] - 22} text={"42,9 %\nresuelve solo"} align="center" appearAt={T.actor + sec(1.0)} />
      </Dim>

      <Node x={ROLE.x} y={ROWS[JUDGE]} w={ROLE.w} h={ROLE.h} label={ROLES[JUDGE].label} sub={ROLES[JUDGE].sub} appearAt={T.roles + sec(0.3)} />
      <Activate i={JUDGE} at={T.judge} />
      <Text x={RESULT_X} y={ROWS[JUDGE] - 22} text={"ve el episodio\ncompleto"} align="center" appearAt={T.judge + sec(1.0)} />

      <Node x={ROLE.x} y={ROWS[TEACHER]} w={ROLE.w} h={ROLE.h} label={ROLES[TEACHER].label} sub={ROLES[TEACHER].sub} appearAt={T.roles + sec(0.6)} />
      <Activate i={TEACHER} at={T.teacher} />
      <Connector from={teacherOut} to={studentIn} tone="accent" width={3} drawFrom={T.student} drawTo={T.student + sec(0.5)} />
      <FlowDot from={teacherOut} to={studentIn} start={T.student + sec(0.5)} end={T.student + sec(1.0)} />
      <Highlight from={T.dimActor}>
        <Node
          x={STUDENT.x}
          y={STUDENT.y}
          w={STUDENT.w}
          h={STUDENT.h}
          label="Alumno"
          sub="82,9 %"
          tone="navy"
          appearAt={T.student + sec(0.3)}
        />
      </Highlight>
    </>
  );
}

export default defineClip({
  id: "clip-1",
  title: "La idea general",
  durationInFrames: sec(15),
  captions: [
    { from: 0, to: sec(3.5), text: "Un mismo modelo de decisión, usado de tres maneras." },
    { from: sec(3.5), to: sec(7), text: "Como actor, elige cada acción: resuelve 42,9 % de las tareas." },
    { from: sec(7), to: sec(10.5), text: "Como juez, puntúa acciones viendo el episodio completo." },
    { from: sec(10.5), to: sec(15), text: "Como maestro, entrena a un alumno que llega a 82,9 %." },
  ],
  Scene,
});
