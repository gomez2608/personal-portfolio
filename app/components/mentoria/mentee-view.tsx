"use client";

import Link from "next/link";
import { saveNote } from "@/app/mentoria/[slug]/actions";
import type { MenteePlan, MenteeState } from "@/app/data/mentoria/types";
import { cn } from "@/lib/utils";
import { monthIndex, rangeStartIndex } from "./dates";
import { LogoutButton } from "./mentoria-shell";
import {
  Acuerdo,
  BringList,
  BulletList,
  Chip,
  Eyebrow,
  Legend,
  Meter,
  Panel,
  Phases,
  Section,
  StatusButton,
  SyncNote,
  fieldClass,
} from "./ui";
import { useMentoriaState } from "./use-mentoria-state";

export function MenteeView({
  plan,
  initial,
  today,
  isMentor,
}: {
  plan: MenteePlan;
  initial: MenteeState;
  today: string;
  /** The mentor previewing this view: can tick items but not write the mentee's notes. */
  isMentor: boolean;
}) {
  const { state, sync, statusOf, setItem, setDebounced } = useMentoriaState(plan.slug, initial);
  const done = (id: string) => state.sessions[id]?.status === "realizada";
  const nextIdx = plan.sessions.findIndex((s) => !done(s.id));
  const next = nextIdx >= 0 ? plan.sessions[nextIdx] : null;
  const prevAcuerdos = nextIdx > 0 ? state.sessions[plan.sessions[nextIdx - 1].id]?.acuerdos : "";

  const courseIds = plan.phases.flatMap((p) => p.items.map((c) => c.id));
  const cm = monthIndex(plan.startMonth, today);
  const now = plan.activities.filter((a) => rangeStartIndex(plan.startMonth, a.when) <= cm);
  const later = plan.activities.filter((a) => rangeStartIndex(plan.startMonth, a.when) > cm);

  const activityRow = (a: MenteePlan["activities"][number]) => {
    const st = statusOf(a.id);
    return (
      <li key={a.id} className="flex gap-3 border-b border-line py-4 last:border-b-0">
        <StatusButton status={st} label={a.t} onChange={(n) => setItem(a.id, n)} />
        <div className="flex min-w-0 flex-col gap-2.5">
          <p className={cn("m-0 text-[15px] leading-[1.55]", st === "hecho" ? "text-graphite" : "text-ink")}>{a.t}</p>
          <div className="flex flex-wrap gap-1.5">
            <Chip>{a.tipo}</Chip>
            {a.owner === "ambos" && <Chip strong>Con {plan.mentor.firstName}</Chip>}
            <Chip>{a.when}</Chip>
            <Chip>Objetivo {a.obj}</Chip>
          </div>
        </div>
      </li>
    );
  };

  return (
    <>
      <header className="border-b border-s-line bg-s-bg text-s-fg">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-6 px-[clamp(16px,4vw,40px)] pt-12 pb-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-xs leading-none tracking-[.12em] text-s-2 uppercase">
              Mentoría con {plan.mentor.firstName} · {plan.period}
            </span>
            <div className="flex items-center gap-2">
              {isMentor && (
                <Link
                  href={`/mentoria/${plan.slug}/panel`}
                  className="rounded-lg border border-s-line-strong px-3 py-2 font-mono text-xs leading-none tracking-[.06em] text-s-2 uppercase hover:border-current"
                >
                  ← Volver al panel
                </Link>
              )}
              <LogoutButton slug={plan.slug} />
            </div>
          </div>
          <h1 className="m-0 text-[clamp(2.4rem,6vw,4rem)] leading-[1.02] font-bold tracking-[-.04em] text-s-fg">
            Hola, {plan.mentee.firstName}
          </h1>
          <p className="m-0 max-w-[640px] text-[17px] leading-[1.55] text-s-2">
            Nos vemos {plan.cadence}. Marca tus tareas a medida que avanzas: tu progreso se guarda solo y{" "}
            {plan.mentor.firstName} lo ve en su panel.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Meter label="Tus tareas completadas" done={plan.activities.filter((a) => statusOf(a.id) === "hecho").length} total={plan.activities.length} />
            <Meter label="Ruta de estudio" done={courseIds.filter((id) => statusOf(id) === "hecho").length} total={courseIds.length} />
          </div>
          <SyncNote state={sync} />
          {isMentor && (
            <p className="m-0 rounded-lg border border-s-line-strong px-4 py-3 text-sm leading-[1.5] text-s-2">
              Estás viendo la página de {plan.mentee.firstName} con tu código de mentor. Sus notas para cada sesión
              son de solo lectura aquí; para escribirlas, {plan.mentee.firstName} entra con su propio código.
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto flex max-w-[1120px] flex-col gap-14 px-[clamp(16px,4vw,40px)] pt-12 pb-24">
        <Section id="h-ejes" title="Lo que vamos a fortalecer" aside="Seis ejes para que llegues a mitad de 2027 listo para aplicar.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plan.ejes.map((e, i) => (
              <article key={e.t} className="flex flex-col gap-3 rounded-xl border border-line bg-card p-5">
                <span className="font-mono text-xs text-graphite">0{i + 1}</span>
                <h3 className="m-0 text-lg leading-[1.3] font-bold tracking-[-.02em] text-navy">{e.t}</h3>
                <p className="m-0 text-[15px] leading-[1.55] text-slate">{e.d}</p>
                <div className="mt-auto flex flex-col gap-1 border-t border-line pt-3">
                  <Eyebrow className="text-[11px]">Lo que sale de aquí</Eyebrow>
                  <span className="text-sm leading-[1.5] font-medium text-navy">{e.out}</span>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section id="h-next" title="Próxima sesión">
          {next ? (
            <div className="flex flex-col gap-5 rounded-2xl border border-line bg-card p-[clamp(16px,3vw,28px)]">
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-2 font-mono text-xs leading-none tracking-[.08em] text-navy uppercase">
                  <span aria-hidden="true" className="size-2 rounded-full bg-tangerine" />
                  Sesión {nextIdx + 1} · {next.date}
                  {next.iso === today && " · hoy"}
                </span>
                <h3 className="m-0 text-[22px] leading-[1.25] font-bold tracking-[-.02em] text-navy">{next.foco}</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Panel title="Trae" tone="fog">
                  <BringList items={next.menteeBrings} />
                </Panel>
                <Panel title="Vamos a ver" tone="fog">
                  <BulletList items={next.agenda} />
                </Panel>
              </div>
              {prevAcuerdos && <Acuerdo label="Acuerdos de la sesión anterior:" text={prevAcuerdos} />}
              <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
                Tus notas para esta sesión
                <span className="font-normal text-graphite">
                  {isMentor
                    ? `Aquí ${plan.mentee.firstName} escribe sus preguntas antes de la sesión. Las ves también en tu panel.`
                    : `Preguntas, avances o bloqueos. ${plan.mentor.firstName} las lee antes de la sesión.`}
                </span>
                <textarea
                  className={fieldClass}
                  disabled={isMentor}
                  value={state.menteeNotes[next.id] ?? ""}
                  placeholder={isMentor ? `${plan.mentee.firstName} aún no ha escrito nada.` : "Escribe aquí…"}
                  maxLength={5000}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDebounced(
                      `mn:${next.id}`,
                      (s) => ({ ...s, menteeNotes: { ...s.menteeNotes, [next.id]: v } }),
                      () => saveNote(plan.slug, "mentee", next.id, v),
                    );
                  }}
                />
              </label>
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-card p-6">
              <h3 className="m-0 text-xl font-bold text-navy">La mentoría terminó</h3>
              <p className="m-0 mt-2 text-slate">Ya pasaron todas las sesiones. Sigue el cronograma de búsqueda que armamos.</p>
            </div>
          )}
        </Section>

        <Section id="h-tasks" title="Tus tareas" aside={<Legend />}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 rounded-xl border border-line bg-card px-5 py-2">
              <h3 className="m-0 pt-3 font-mono text-xs leading-none font-normal tracking-[.12em] text-graphite uppercase">Ahora</h3>
              <ul className="m-0 list-none p-0">{now.map(activityRow)}</ul>
            </div>
            {later.length > 0 && (
              <details className="group rounded-xl border border-line bg-card px-5 py-4">
                <summary className="cursor-pointer font-mono text-xs leading-none tracking-[.12em] text-graphite uppercase marker:text-muted">
                  Más adelante ({later.length})
                </summary>
                <ul className="m-0 mt-2 list-none p-0">{later.map(activityRow)}</ul>
              </details>
            )}
          </div>
        </Section>

        <Section id="h-ruta" title="Ruta de estudio" aside="Todo es gratis o está cubierto por el convenio Uniandes–Coursera.">
          <Phases phases={plan.phases} statusOf={statusOf} onChange={setItem} note={plan.coursesNote} />
        </Section>

        <Section id="h-cal" title="Calendario" aside="Fechas tentativas.">
          <ol className="m-0 flex list-none flex-col p-0">
            {plan.sessions.map((s, i) => {
              const b = plan.between.find((x) => x.after === s.id);
              const ac = state.sessions[s.id]?.acuerdos;
              return (
                <li key={s.id} className="flex flex-col">
                  <CalRow
                    when={s.date}
                    kind={`Sesión ${i + 1}`}
                    marker={done(s.id) ? "done" : s.id === next?.id ? "next" : "todo"}
                  >
                    <h3 className="m-0 text-lg leading-[1.3] font-bold tracking-[-.02em] text-navy">{s.foco}</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <Eyebrow className="text-[11px]">Traes</Eyebrow>
                        <BulletList items={s.menteeBrings.map((x) => x.t)} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Eyebrow className="text-[11px]">Agenda</Eyebrow>
                        <BulletList items={s.agenda} />
                      </div>
                    </div>
                    {ac && <Acuerdo label="Acuerdos:" text={ac} />}
                  </CalRow>
                  {b && (
                    <CalRow when={b.when} kind="Entre sesiones" marker="gap">
                      <Eyebrow className="text-[11px]">Trabajas en</Eyebrow>
                      <BulletList items={b.mentee} />
                    </CalRow>
                  )}
                </li>
              );
            })}
          </ol>
        </Section>
      </main>
    </>
  );
}

export function CalRow({
  when,
  kind,
  marker,
  children,
}: {
  when: string;
  kind: string;
  marker: "done" | "next" | "todo" | "gap";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-6 gap-y-3 border-b border-line py-6 sm:grid-cols-[minmax(130px,190px)_minmax(0,1fr)]",
        marker === "gap" && "py-4",
      )}
    >
      <div className="flex flex-row flex-wrap items-center gap-x-3 gap-y-1.5 sm:flex-col sm:items-start">
        <span className="flex items-center gap-2 font-mono text-xs leading-none tracking-[.06em] text-graphite uppercase">
          {marker !== "gap" && (
            <span
              aria-hidden="true"
              className={cn(
                "size-2 rounded-full",
                marker === "done" && "bg-emph",
                marker === "next" && "bg-tangerine",
                marker === "todo" && "border border-muted",
              )}
            />
          )}
          {when}
        </span>
        <span className={cn("text-sm font-medium", marker === "gap" ? "text-muted-text" : "text-slate")}>
          {kind}
          {marker === "done" && " · realizada"}
          {marker === "next" && " · próxima"}
        </span>
      </div>
      <div className={cn("flex min-w-0 flex-col gap-3", marker === "gap" && "rounded-lg bg-fog px-4 py-3")}>{children}</div>
    </div>
  );
}
