"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";
  const label = dark ? "claro" : "oscuro";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      title={`Tema ${label}`}
      aria-label={`Cambiar a tema ${label}`}
      className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-s-line-strong hover:border-current"
    >
      <span
        aria-hidden="true"
        className={`size-3 rounded-full border-[1.5px] border-current ${dark ? "bg-transparent" : "bg-current"}`}
      />
    </button>
  );
}
