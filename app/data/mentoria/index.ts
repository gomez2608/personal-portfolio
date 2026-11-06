import "server-only";
import { juan } from "./juan";
import type { MenteePlan, MentoriaPlan } from "./types";

// Add a mentee: create `<slug>.ts` with a MentoriaPlan, register it here and set
// its access code in the env var named by `codeEnv`. The DB row is created on first load.
const PLANS: Record<string, MentoriaPlan> = { [juan.slug]: juan };

export function getPlan(slug: string): MentoriaPlan | null {
  return Object.hasOwn(PLANS, slug) ? PLANS[slug] : null;
}

/** Strip everything the mentee shouldn't receive. */
export function toMenteePlan(p: MentoriaPlan): MenteePlan {
  return {
    slug: p.slug,
    mentor: { firstName: p.mentor.firstName },
    mentee: { firstName: p.mentee.firstName },
    period: p.period,
    startMonth: p.startMonth,
    cadence: p.cadence,
    ejes: p.ejes,
    sessions: p.sessions.map((s) => ({
      id: s.id,
      date: s.date,
      iso: s.iso,
      foco: s.foco,
      agenda: s.agenda,
      menteeBrings: s.menteeBrings,
    })),
    between: p.between.map((b) => ({ after: b.after, when: b.when, mentee: b.mentee })),
    activities: p.objectives.flatMap((o) =>
      o.items.filter((i) => i.owner !== "mentor").map((i) => ({ ...i, obj: o.n })),
    ),
    phases: p.phases,
    coursesNote: p.coursesNote,
  };
}

/** Every id the given role may change the status of. */
export function editableItemIds(p: MentoriaPlan, role: "mentor" | "mentee"): Set<string> {
  const activities = p.objectives
    .flatMap((o) => o.items)
    .filter((i) => role === "mentor" || i.owner !== "mentor")
    .map((i) => i.id);
  const courses = p.phases.flatMap((ph) => ph.items.map((c) => c.id));
  return new Set([...activities, ...courses]);
}
