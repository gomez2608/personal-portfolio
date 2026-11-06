/** A mentorship plan. One file per mentee in this folder, registered in `index.ts`. */

export type ItemStatus = "pendiente" | "curso" | "hecho";
export type SessionStatus = "pendiente" | "realizada" | "reprogramada";
/** Who owns an activity. "mentee" items are the ones the mentee can tick. */
export type Owner = "mentor" | "mentee" | "ambos";

export interface Bring {
  t: string;
  d: string;
}

export interface Session {
  id: string;
  /** Display date, e.g. "jue 5 nov 2026". */
  date: string;
  /** ISO date, used to order and to say "hoy". */
  iso: string;
  foco: string;
  agenda: string[];
  /** What the mentor brings. Mentor only. */
  mentorBrings: string[];
  /** Short list of what the mentee brings (mentor panel). */
  menteeBringsShort: string[];
  /** Detailed list of what the mentee brings (mentee view). */
  menteeBrings: Bring[];
}

export interface Between {
  /** Session this gap follows. */
  after: string;
  when: string;
  mentee: string[];
  /** What the mentor prepares. Mentor only. */
  mentor: string[];
}

export interface Activity {
  id: string;
  t: string;
  tipo: "Saber qué" | "Saber cómo" | "Saber ser";
  owner: Owner;
  /** Month range in Spanish abbreviations, e.g. "Nov – Dic". */
  when: string;
}

export interface Objective {
  n: number;
  t: string;
  items: Activity[];
}

export interface Course {
  id: string;
  t: string;
  plat: string;
  d: string;
  url: string;
}

export interface Phase {
  t: string;
  when: string;
  items: Course[];
}

export interface Eje {
  t: string;
  d: string;
  out: string;
}

export interface MentoriaPlan {
  slug: string;
  /** Env var holding the mentee's access code. */
  codeEnv: string;
  mentor: { firstName: string; fullName: string };
  mentee: { firstName: string; fullName: string };
  period: string;
  /** First month of the plan, "YYYY-MM"; used to split "Ahora" from "Más adelante". */
  startMonth: string;
  cadence: string;
  goal: string;
  ejes: Eje[];
  sessions: Session[];
  between: Between[];
  objectives: Objective[];
  phases: Phase[];
  coursesNote: string;
  /** Mentor only. */
  profile: { dt: string; dd: string }[];
}

/** What the mentee's browser receives: no profile, no mentor prep, no mentor-only activities. */
export interface MenteePlan {
  slug: string;
  mentor: { firstName: string };
  mentee: { firstName: string };
  period: string;
  startMonth: string;
  cadence: string;
  ejes: Eje[];
  sessions: Omit<Session, "mentorBrings" | "menteeBringsShort">[];
  between: Omit<Between, "mentor">[];
  activities: (Activity & { obj: number })[];
  phases: Phase[];
  coursesNote: string;
}

export interface SessionState {
  status: SessionStatus;
  acuerdos: string;
}

export interface MentoriaState {
  progress: Record<string, ItemStatus>;
  sessions: Record<string, SessionState>;
  mentorNotes: Record<string, string>;
  menteeNotes: Record<string, string>;
}

export type MenteeState = Omit<MentoriaState, "mentorNotes">;
