"use client";

import { useState } from "react";
import Link from "next/link";
import { saveAcuerdos, saveNote, saveSessionStatus } from "@/app/mentoria/[slug]/actions";
import type { MentoriaPlan, MentoriaState, SessionState, SessionStatus } from "@/app/data/mentoria/types";
import { cn } from "@/lib/utils";
import { CalRow } from "./mentee-view";
import { LogoutButton } from "./mentoria-shell";
import {
  Bar,
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

const SESSION_STATUSES: SessionStatus[] = ["pendiente", "realizada", "reprogramada"];
const OWNER_LABEL = { mentor: "Mentor", ambos: "Ambos" } as const;

export function MentorView({
  plan,
  initial,
  today,
}: {
  plan: MentoriaPlan;
  initial: MentoriaState;
  today: string;
}) {
  const { state, sync, statusOf, setItem, setDebounced, setNow } = useMentoriaState(plan.slug, initial);
  const ses = (id: string): SessionState => {
    const s: Partial<SessionState> | undefined = state.sessions[id];
    return { status: s?.status ?? "pendiente", acuerdos: s?.acuerdos ?? "" };
  };
  const next = plan.sessions.find((s) => ses(s.id).status !== "realizada");
  const [openId, setOpenId] = useState(next?.id ?? plan.sessions[0].id);
  const open = plan.sessions.find((s) => s.id === openId)!;
  const openN = plan.sessions.indexOf(open) + 1;

  const activityIds = plan.objectives.flatMap((o) => o.items.map((i) => i.id));
  const courseIds = plan.phases.flatMap((p) => p.items.map((c) => c.id));
  const countDone = (ids: string[]) => ids.filter((id) => statusOf(id) === "hecho").length;
  const menteeName = plan.mentee.firstName;

  const setSessionStatus = (id: string, status: SessionStatus) => {
    const prev = ses(id).status;
    setNow(
      (s) => ({ ...s, sessions: { ...s.sessions, [id]: { ...ses(id), status } } }),
      () => saveSessionStatus(plan.slug, id, status),
      (s) => ({ ...s, sessions: { ...s.sessions, [id]: { ...s.sessions[id], status: prev } } }),
    );
  };

  return (
    <>
      <header className="border-b border-s-line bg-s-bg text-s-fg">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-6 px-[clamp(16px,4vw,40px)] pt-12 pb-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-xs leading-none tracking-[.12em] text-s-2 uppercase">
              Panel del mentor · {plan.period}
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={`/mentoria/${plan.slug}`}
                className="rounded-lg border border-s-line-strong px-3 py-2 font-mono text-xs leading-none tracking-[.06em] text-s-2 uppercase hover:border-current"
              >
                Ver como {menteeName} →
              </Link>
              <LogoutButton slug={plan.slug} />
            </div>
          </div>
          <h1 className="m-0 text-[clamp(2.2rem,5.5vw,3.6rem)] leading-[1.04] font-bold tracking-[-.04em] text-s-fg">
            {plan.mentee.fullName}
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[15px] leading-[1.5] text-s-2">
            <span>
              Mentor: <b className="font-semibold text-s-fg">{plan.mentor.fullName}</b>
            </span>
            <span>
              Reunión <b className="font-semibold text-s-fg">{plan.cadence}</b> + WhatsApp
            </span>
            <span>
              Meta: <b className="font-semibold text-s-fg">{plan.goal}</b>
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Meter
              label="Sesiones realizadas"
              done={plan.sessions.filter((s) => ses(s.id).status === "realizada").length}
              total={plan.sessions.length}
            />
            <Meter label="Actividades completadas" done={countDone(activityIds)} total={activityIds.length} />
            <Meter label="Ruta de estudio" done={countDone(courseIds)} total={courseIds.length} />
          </div>
          <SyncNote state={sync} />
        </div>
      </header>

      <main className="mx-auto flex max-w-[1120px] flex-col gap-14 px-[clamp(16px,4vw,40px)] pt-12 pb-24">
        <Section id="h-ses" title="Sesiones" aside="Toca una sesión para ver qué traer y anotar lo que hablaron.">
          <div className="-mx-1 overflow-x-auto px-1 pb-2">
            <ol className="relative m-0 grid min-w-[760px] list-none grid-cols-7 gap-2.5 p-0">
              <span aria-hidden="true" className="absolute top-[13px] right-[7%] left-[7%] h-0.5 bg-line" />
              {plan.sessions.map((s, i) => {
                const st = ses(s.id).status;
                const isNext = s.id === next?.id;
                const isOpen = s.id === openId;
                return (
                  <li key={s.id} className="relative flex min-w-0 flex-col gap-2.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "relative z-10 mx-auto grid size-7 place-items-center rounded-full border-2 font-mono text-xs",
                        st === "realizada"
                          ? "border-emph bg-emph text-emph-contrast"
                          : isNext
                            ? "border-tangerine bg-card text-navy ring-4 ring-tangerine/20"
                            : "border-line bg-card text-graphite",
                      )}
                    >
                      {i + 1}
                    </span>
                    <button
                      type="button"
                      aria-pressed={isOpen}
                      aria-controls="session-detail"
                      onClick={() => setOpenId(s.id)}
                      className={cn(
                        "flex flex-1 flex-col gap-1.5 rounded-xl border bg-card p-3 text-left transition-colors hover:border-navy",
                        isOpen ? "border-navy ring-1 ring-navy" : "border-line",
                      )}
                    >
                      {isNext && (
                        <span className="font-mono text-[10px] leading-none tracking-[.1em] text-navy uppercase">
                          Próxima
                        </span>
                      )}
                      <span className="font-mono text-[11px] leading-[1.3] text-graphite">{s.date}</span>
                      <span className="text-sm leading-[1.3] font-semibold text-navy">{s.foco}</span>
                      {st === "reprogramada" && <span className="text-xs text-graphite">Reprogramada</span>}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div
            id="session-detail"
            className="flex flex-col gap-5 rounded-2xl border border-line bg-card p-[clamp(16px,3vw,28px)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <Eyebrow>
                  Sesión {openN} · {open.date}
                  {open.iso === today && " · hoy"}
                </Eyebrow>
                <h3 className="m-0 text-[22px] leading-[1.25] font-bold tracking-[-.02em] text-navy">{open.foco}</h3>
              </div>
              <div role="group" aria-label="Estado de la sesión" className="flex overflow-hidden rounded-lg border border-line">
                {SESSION_STATUSES.map((v) => {
                  const on = ses(open.id).status === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setSessionStatus(open.id, v)}
                      className={cn(
                        "px-3 py-2 text-sm leading-none font-medium capitalize",
                        on ? "bg-emph text-emph-contrast" : "text-graphite hover:text-navy",
                      )}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Panel title="Agenda" tone="fog">
                <BulletList items={open.agenda} />
              </Panel>
              <Panel title={`${plan.mentor.firstName} trae`} tone="fog">
                <BulletList items={open.mentorBrings} />
              </Panel>
              <Panel title={`${menteeName} trae`} tone="fog">
                <BulletList items={open.menteeBringsShort} />
              </Panel>
            </div>

            {state.menteeNotes[open.id] && (
              <Panel title={`Notas de ${menteeName} para esta sesión`}>
                <p className="m-0 text-[15px] leading-[1.55] whitespace-pre-wrap text-slate">
                  {state.menteeNotes[open.id]}
                </p>
              </Panel>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
                <span>
                  Notas privadas <span className="font-normal text-graphite">· solo tú</span>
                </span>
                <textarea
                  key={`notes-${open.id}`}
                  className={fieldClass}
                  value={state.mentorNotes[open.id] ?? ""}
                  maxLength={5000}
                  placeholder="Qué hablaron, impresiones, cosas para la próxima"
                  onChange={(e) => {
                    const v = e.target.value;
                    const id = open.id;
                    setDebounced(
                      `n:${id}`,
                      (s) => ({ ...s, mentorNotes: { ...s.mentorNotes, [id]: v } }),
                      () => saveNote(plan.slug, "mentor", id, v),
                    );
                  }}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
                <span>
                  Acuerdos y tareas <span className="font-normal text-graphite">· {menteeName} los ve</span>
                </span>
                <textarea
                  key={`ac-${open.id}`}
                  className={fieldClass}
                  value={ses(open.id).acuerdos}
                  maxLength={5000}
                  placeholder="Qué queda pendiente y quién lo hace"
                  onChange={(e) => {
                    const v = e.target.value;
                    const id = open.id;
                    setDebounced(
                      `a:${id}`,
                      (s) => ({ ...s, sessions: { ...s.sessions, [id]: { status: s.sessions[id]?.status ?? "pendiente", acuerdos: v } } }),
                      () => saveAcuerdos(plan.slug, id, v),
                    );
                  }}
                />
              </label>
            </div>
          </div>
        </Section>

        <Section id="h-cal" title="Calendario" aside="Fechas tentativas, cada 3 semanas los jueves. Sesiones de ~60 minutos.">
          <ol className="m-0 flex list-none flex-col p-0">
            {plan.sessions.map((s, i) => {
              const b = plan.between.find((x) => x.after === s.id);
              const st = ses(s.id).status;
              return (
                <li key={s.id} className="flex flex-col">
                  <CalRow when={s.date} kind={`Sesión ${i + 1}`} marker={st === "realizada" ? "done" : s.id === next?.id ? "next" : "todo"}>
                    <h3 className="m-0 text-lg leading-[1.3] font-bold tracking-[-.02em] text-navy">{s.foco}</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="flex flex-col gap-2">
                        <Eyebrow className="text-[11px]">Agenda</Eyebrow>
                        <BulletList items={s.agenda} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Eyebrow className="text-[11px]">{plan.mentor.firstName} trae</Eyebrow>
                        <BulletList items={s.mentorBrings} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Eyebrow className="text-[11px]">{menteeName} trae</Eyebrow>
                        <BulletList items={s.menteeBringsShort} />
                      </div>
                    </div>
                  </CalRow>
                  {b && (
                    <CalRow when={b.when} kind="Entre sesiones" marker="gap">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <Eyebrow className="text-[11px]">{menteeName} trabaja en</Eyebrow>
                          <BulletList items={b.mentee} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Eyebrow className="text-[11px]">{plan.mentor.firstName} prepara</Eyebrow>
                          <BulletList items={b.mentor} />
                        </div>
                      </div>
                    </CalRow>
                  )}
                </li>
              );
            })}
          </ol>
        </Section>

        <Section id="h-obj" title="Objetivos y actividades" aside={<Legend />}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {plan.objectives.map((o) => {
              const k = countDone(o.items.map((i) => i.id));
              return (
                <article key={o.n} className="flex flex-col gap-4 rounded-xl border border-line bg-card p-5">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs leading-[1.9] text-graphite">0{o.n}</span>
                    <h3 className="m-0 flex-1 text-[17px] leading-[1.35] font-bold tracking-[-.015em] text-navy">{o.t}</h3>
                    <span className="font-mono text-xs leading-[1.9] text-graphite tabular-nums">
                      {k}/{o.items.length}
                    </span>
                  </div>
                  <Bar pct={(k / o.items.length) * 100} label={`Objetivo ${o.n}`} />
                  <ul className="m-0 flex list-none flex-col p-0">
                    {o.items.map((it) => {
                      const st = statusOf(it.id);
                      return (
                        <li key={it.id} className="flex gap-3 border-t border-line py-3.5">
                          <StatusButton status={st} label={it.t} onChange={(n) => setItem(it.id, n)} />
                          <div className="flex min-w-0 flex-col gap-2">
                            <p className={cn("m-0 text-[15px] leading-[1.5]", st === "hecho" ? "text-graphite" : "text-ink")}>{it.t}</p>
                            <div className="flex flex-wrap gap-1.5">
                              <Chip>{it.tipo}</Chip>
                              <Chip strong={it.owner !== "mentee"}>{it.owner === "mentee" ? menteeName : OWNER_LABEL[it.owner]}</Chip>
                              <Chip>{it.when}</Chip>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              );
            })}
          </div>
        </Section>

        <Section id="h-ruta" title="Ruta de estudio" aside="Todo es gratis o está cubierto por el convenio Uniandes–Coursera.">
          <Phases phases={plan.phases} statusOf={statusOf} onChange={setItem} note={plan.coursesNote} />
        </Section>

        <Section id="h-prof" title="Perfil">
          <dl className="m-0 grid grid-cols-1 border-t border-line sm:grid-cols-[minmax(140px,220px)_minmax(0,1fr)]">
            {plan.profile.map((p) => (
              <div key={p.dt} className="contents">
                <dt className="border-line pt-4 font-mono text-xs leading-[1.6] tracking-[.06em] text-graphite uppercase sm:border-b sm:pb-4">
                  {p.dt}
                </dt>
                <dd className="m-0 border-b border-line pt-1 pb-4 text-[15px] leading-[1.55] text-slate sm:pt-4">{p.dd}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </main>
    </>
  );
}
