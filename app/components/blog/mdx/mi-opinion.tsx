import type { ReactNode } from "react";
import { deploymentEnv } from "@/lib/blog/visibility";

export function MiOpinion({ pending, children }: { pending?: boolean; children?: ReactNode }) {
  if (pending) {
    if (deploymentEnv() === "production") return null;
    return (
      <aside className="my-8 rounded-xl border border-dashed border-line bg-fog p-5 font-mono text-sm text-graphite">
        Pendiente: opinión de Sebastián
      </aside>
    );
  }
  return (
    <aside className="my-10 rounded-xl border border-line bg-card p-6">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-graphite">Mi opinión</p>
      <div className="[&>p:first-child]:mt-0 [&>p:last-child]:mb-0">{children}</div>
    </aside>
  );
}
