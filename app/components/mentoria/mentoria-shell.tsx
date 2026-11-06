"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { logout } from "@/app/mentoria/[slug]/actions";
import { site } from "@/app/data/site";

/** Slim top bar: the portfolio mark (links home) and the theme toggle. */
export function MentoriaTopBar() {
  return (
    <div className="border-b border-s-line bg-s-bg text-s-fg">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-[clamp(16px,4vw,40px)] py-4">
        <Link href="/" className="flex items-center gap-3" aria-label={`${site.name} — inicio`}>
          <span aria-hidden="true" className="relative size-9 shrink-0 rounded-lg bg-emph">
            <span className="absolute top-1 left-1.5 text-sm leading-none font-bold tracking-[-.05em] text-emph-contrast">
              sg
            </span>
            <span className="absolute right-1.5 bottom-1.5 size-[9px] rounded-full bg-tangerine" />
          </span>
          <span className="text-[15px] leading-none font-bold tracking-[-.01em] whitespace-nowrap max-[420px]:hidden">
            {site.name}
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );
}

function ThemeToggle() {
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

export function LogoutButton({ slug }: { slug: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => logout(slug))}
      className="rounded-lg border border-s-line-strong px-3 py-2 font-mono text-xs leading-none tracking-[.06em] text-s-2 uppercase hover:border-current disabled:opacity-60"
    >
      Salir
    </button>
  );
}
