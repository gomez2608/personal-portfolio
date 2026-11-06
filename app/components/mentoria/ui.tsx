"use client";

import type { Bring, ItemStatus, Phase } from "@/app/data/mentoria/types";
import { cn } from "@/lib/utils";

// Shared pieces for the mentee view and the mentor panel, in the portfolio's
// Ink & Tangerine tokens. Tangerine is signal only: bar fills and the "next" marker.

export const NEXT_STATUS: Record<ItemStatus, ItemStatus> = {
  pendiente: "curso",
  curso: "hecho",
  hecho: "pendiente",
};
export const STATUS_LABEL: Record<ItemStatus, string> = {
  pendiente: "Pendiente",
  curso: "En curso",
  hecho: "Hecho",
};

export const fieldClass =
  "w-full min-h-[120px] resize-y rounded-lg border border-line bg-bg px-3.5 py-3 text-[15px] leading-[1.55] text-ink placeholder:text-muted-text focus-visible:border-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] disabled:opacity-70";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-mono text-xs leading-none tracking-[.12em] text-graphite uppercase", className)}>
      {children}
    </span>
  );
}

export function Section({
  id,
  title,
  aside,
  children,
}: {
  id: string;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-6 border-t border-line pt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id={id} className="m-0 text-2xl leading-[1.2] font-bold tracking-[-.025em] text-navy">
          {title}
        </h2>
        {aside && <div className="text-[15px] leading-[1.5] text-graphite">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

export function Meter({ label, done, total }: { label: string; done: number; total: number }) {
  const pct = total ? (done / total) * 100 : 0;
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-s-line bg-card p-4">
      <span className="text-sm leading-none font-medium text-graphite">{label}</span>
      <span className="text-[28px] leading-none font-bold tracking-[-.03em] text-navy tabular-nums">
        {done} <span className="font-mono text-sm font-normal tracking-normal text-muted-text">/ {total}</span>
      </span>
      <Bar pct={pct} label={label} />
    </div>
  );
}

export function Bar({ pct, label }: { pct: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className="h-1.5 overflow-hidden rounded-full bg-fog"
    >
      <div
        className="h-full rounded-full bg-tangerine transition-[width] duration-500 ease-brand motion-reduce:transition-none"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function StatusButton({
  status,
  label,
  onChange,
  disabled,
}: {
  status: ItemStatus;
  label: string;
  onChange?: (next: ItemStatus) => void;
  disabled?: boolean;
}) {
  const next = NEXT_STATUS[status];
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange?.(next)}
      title={disabled ? STATUS_LABEL[status] : `${STATUS_LABEL[status]} · cambiar a ${STATUS_LABEL[next].toLowerCase()}`}
      aria-label={`${label}. Estado: ${STATUS_LABEL[status]}${disabled ? "" : `. Cambiar a ${STATUS_LABEL[next]}`}`}
      className={cn(
        "mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors enabled:cursor-pointer disabled:cursor-default",
        status === "hecho" && "border-emph bg-emph text-emph-contrast",
        status === "curso" && "border-navy text-navy",
        status === "pendiente" && "border-muted bg-card enabled:hover:border-navy",
      )}
    >
      <StatusGlyph status={status} />
    </button>
  );
}

function StatusGlyph({ status }: { status: ItemStatus }) {
  if (status === "hecho")
    return (
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
        <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (status === "curso")
    return (
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
        <path d="M4 8h8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  return null;
}

export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-graphite" aria-hidden="true">
      {(["pendiente", "curso", "hecho"] as const).map((s) => (
        <span key={s} className="flex items-center gap-2">
          <span className="pointer-events-none">
            <StatusButton status={s} label="" disabled />
          </span>
          {STATUS_LABEL[s]}
        </span>
      ))}
    </div>
  );
}

export function Chip({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-[5px] font-mono text-[11px] leading-none tracking-[.04em]",
        strong ? "border-navy text-navy" : "border-line text-graphite",
      )}
    >
      {children}
    </span>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
      {items.map((x) => (
        <li key={x} className="relative pl-4 text-[15px] leading-[1.5] text-slate">
          <span aria-hidden="true" className="absolute top-[.6em] left-0 size-1.5 rounded-full bg-muted" />
          {x}
        </li>
      ))}
    </ul>
  );
}

export function BringList({ items }: { items: Bring[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {items.map((x) => (
        <li key={x.t} className="flex flex-col gap-1">
          <b className="text-[15px] leading-[1.4] font-semibold text-navy">{x.t}</b>
          <span className="text-[15px] leading-[1.55] text-slate">{x.d}</span>
        </li>
      ))}
    </ul>
  );
}

export function Panel({
  title,
  children,
  tone = "card",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "card" | "fog";
}) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border border-line p-4", tone === "fog" ? "bg-fog" : "bg-card")}>
      <Eyebrow>{title}</Eyebrow>
      {children}
    </div>
  );
}

export function Acuerdo({ label, text }: { label: string; text: string }) {
  return (
    <p className="m-0 rounded-lg border-l-2 border-tangerine bg-fog px-4 py-3 text-[15px] leading-[1.55] text-slate">
      <b className="font-semibold text-navy">{label}</b> {text}
    </p>
  );
}

export function Phases({
  phases,
  statusOf,
  onChange,
  note,
}: {
  phases: Phase[];
  statusOf: (id: string) => ItemStatus;
  onChange: (id: string, next: ItemStatus) => void;
  note: string;
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {phases.map((p) => (
          <div key={p.t} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
              <h3 className="m-0 text-lg leading-tight font-bold tracking-[-.02em] text-navy">{p.t}</h3>
              <span className="font-mono text-xs text-graphite">{p.when}</span>
            </div>
            {p.items.map((c) => {
              const st = statusOf(c.id);
              return (
                <div
                  key={c.id}
                  className={cn(
                    "flex gap-3 rounded-xl border bg-card p-4 transition-colors",
                    st === "hecho" ? "border-line opacity-80" : "border-line",
                  )}
                >
                  <StatusButton status={st} label={c.t} onChange={(n) => onChange(c.id, n)} />
                  <div className="flex min-w-0 flex-col gap-1">
                    <h4 className="m-0 text-[15px] leading-[1.35] font-semibold text-navy">{c.t}</h4>
                    <p className="m-0 text-sm leading-[1.5] text-graphite">
                      {c.plat} · {c.d}
                    </p>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 self-start text-sm font-semibold text-navy underline decoration-line underline-offset-4 hover:decoration-navy"
                    >
                      Abrir curso ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="m-0 text-sm text-graphite">{note}</p>
    </>
  );
}

export function SyncNote({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  const text = {
    idle: "Los cambios se guardan solos.",
    saving: "Guardando…",
    saved: "Guardado.",
    error: "No se pudo guardar. Revisa tu conexión y recarga la página.",
  }[state];
  return (
    <span role="status" className={cn("text-sm", state === "error" ? "text-err" : "text-graphite")}>
      {text}
    </span>
  );
}
