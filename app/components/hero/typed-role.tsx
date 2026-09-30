"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useLang } from "@/app/components/providers/lang-provider";

const TICK_MS = 55;
const HOLD_TICKS = 32; // ~1.8s with the full role shown

type TypeState = { role: number; chars: number; deleting: boolean };

/** "I build …" line that types, holds, and deletes each role in turn. */
export function TypedRole() {
  const { t, lang } = useLang();
  const roles = t.roles;
  const [s, setS] = useState<TypeState>({ role: 0, chars: 0, deleting: false });
  const hold = useRef(0);
  const reduce = useReducedMotion();

  // Restart the current role when the language changes.
  useEffect(() => {
    hold.current = 0;
    setS((prev) => ({ role: prev.role, chars: 0, deleting: false }));
  }, [lang]);

  // Reduced motion: show the first role statically instead of typing.
  useEffect(() => {
    if (reduce) {
      setS({ role: 0, chars: roles[0].length, deleting: false });
      return;
    }
    const id = setInterval(() => {
      setS((prev) => {
        const full = roles[prev.role % roles.length];
        if (!prev.deleting) {
          if (prev.chars < full.length)
            return { ...prev, chars: prev.chars + 1 };
          if (++hold.current < HOLD_TICKS) return prev;
          hold.current = 0;
          return { ...prev, deleting: true };
        }
        if (prev.chars > 0)
          return { ...prev, chars: Math.max(0, prev.chars - 2) };
        return {
          role: (prev.role + 1) % roles.length,
          chars: 0,
          deleting: false,
        };
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [roles, reduce]);

  const typed = roles[s.role % roles.length].slice(0, s.chars);
  const longest = roles.reduce((a, b) => (b.length > a.length ? b : a), "");
  const caret = (
    <span
      className="ml-0.5 font-normal text-s-2"
      style={{ animation: "blink 1s steps(1) infinite" }}
    >
      |
    </span>
  );

  // The longest role is laid out invisibly in the same grid cell to reserve height,
  // so wrapping never pushes the buttons around.
  return (
    <p className="m-0 grid min-h-[66px] text-2xl leading-[1.35] font-semibold tracking-[-.015em]">
      <span className="sr-only">
        {t.build}{" "}
        {roles.map((r, i) => (
          <span key={r}>
            {r.replace(/\.$/, "")}
            {i < roles.length - 1 ? ", " : "."}
          </span>
        ))}
      </span>
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {t.build} <span className="font-medium">{longest}</span>
        {caret}
      </span>
      <span aria-hidden="true" className="col-start-1 row-start-1">
        {t.build} <span className="font-medium text-s-2">{typed}</span>
        {caret}
      </span>
    </p>
  );
}
