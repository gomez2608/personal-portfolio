import type { ReactNode } from "react";

export function Profundizar({ title, children }: { title?: string; children?: ReactNode }) {
  return (
    <details className="group my-8 rounded-xl border border-line bg-card">
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl px-5 py-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <svg
          viewBox="0 0 16 16"
          width="12"
          height="12"
          aria-hidden="true"
          className="shrink-0 text-graphite transition-transform group-open:rotate-90 motion-reduce:transition-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3l5 5-5 5" />
        </svg>
        <span className="font-mono text-xs uppercase tracking-widest text-graphite">Profundizar</span>
        {title ? <span>{title}</span> : null}
      </summary>
      <div className="border-t border-line px-5 pb-2">{children}</div>
    </details>
  );
}
