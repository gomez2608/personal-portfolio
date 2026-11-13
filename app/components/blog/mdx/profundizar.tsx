import type { ReactNode } from "react";

export function Profundizar({ title, children }: { title?: string; children?: ReactNode }) {
  return (
    <details className="group my-8 rounded-xl border border-line bg-card">
      <summary className="cursor-pointer list-none rounded-xl px-5 py-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-text">Profundizar</span>
        {title ? <span className="ml-3">{title}</span> : null}
      </summary>
      <div className="border-t border-line px-5 pb-2">{children}</div>
    </details>
  );
}
