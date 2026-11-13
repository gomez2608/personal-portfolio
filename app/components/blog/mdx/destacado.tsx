import type { ReactNode } from "react";

export function Destacado({ children }: { children?: ReactNode }) {
  return (
    <div className="my-8 rounded-xl border-l-4 border-tangerine bg-fog px-6 py-5 text-lg leading-relaxed text-ink [&>p]:my-0 [&>p]:text-ink">
      {children}
    </div>
  );
}
