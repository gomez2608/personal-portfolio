"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/app/components/providers/lang-provider";

const TZ = "America/Bogota";

function bogotaNow() {
  const d = new Date();
  const hour = Number(
    d.toLocaleString("en-US", { timeZone: TZ, hour: "numeric", hour12: false }),
  );
  const weekday = d.toLocaleString("en-US", { timeZone: TZ, weekday: "short" });
  return {
    time: d.toLocaleTimeString("en-GB", {
      timeZone: TZ,
      hour: "2-digit",
      minute: "2-digit",
    }),
    atWork: !["Sat", "Sun"].includes(weekday) && hour >= 9 && hour < 18,
  };
}

/** Live Bogotá clock + availability, refreshed every 30s. */
export function StatusPill() {
  const { t } = useLang();
  const [now, setNow] = useState<{ time: string; atWork: boolean } | null>(
    null,
  );

  useEffect(() => {
    setNow(bogotaNow());
    const id = setInterval(() => setNow(bogotaNow()), 30_000);
    return () => clearInterval(id);
  }, []);

  const atWork = now?.atWork ?? false;

  return (
    <div className="flex items-center gap-3 rounded-full border border-s-line px-3.5 py-2.5 font-mono text-xs leading-none text-s-2">
      <span
        aria-hidden="true"
        className="size-2 rounded-full"
        style={{
          background: atWork ? "var(--status-on)" : "var(--status-off)",
          animation: "pulse-ring 2s infinite",
        }}
      />
      <span>
        Bogotá · <time suppressHydrationWarning>{now?.time ?? "--:--"}</time>
      </span>
      <span aria-hidden="true" className="text-s-meta">
        ·
      </span>
      <span className="text-s-fg">{atWork ? t.work : t.off}</span>
    </div>
  );
}
