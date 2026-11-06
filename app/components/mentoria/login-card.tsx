"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/mentoria/[slug]/actions";
import { fieldClass } from "./ui";
import { cn } from "@/lib/utils";

export function LoginCard({
  slug,
  view,
  title,
  hint,
}: {
  slug: string;
  view: "mentee" | "panel";
  title: string;
  hint: string;
}) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login.bind(null, slug, view), {});
  return (
    <main className="flex min-h-[calc(100svh-69px)] items-center justify-center bg-s-bg px-4 py-16">
      <form
        action={action}
        className="flex w-full max-w-[420px] flex-col gap-5 rounded-2xl border border-s-line bg-card p-[clamp(20px,5vw,32px)]"
      >
        <span className="font-mono text-xs leading-none tracking-[.12em] text-graphite uppercase">Acceso privado</span>
        <h1 className="m-0 text-[28px] leading-[1.15] font-bold tracking-[-.03em] text-navy">{title}</h1>
        <p className="m-0 text-[15px] leading-[1.55] text-slate">{hint}</p>
        <label className="flex flex-col gap-2 text-sm font-semibold text-navy">
          Código de acceso
          <input
            name="code"
            type="password"
            autoComplete="current-password"
            required
            autoFocus
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "code-error" : undefined}
            className={cn(fieldClass, "min-h-0 font-mono tracking-[.08em]")}
          />
        </label>
        {state.error && (
          <p id="code-error" role="alert" className="m-0 text-sm text-err">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-s-cta px-5 py-3.5 text-[15px] leading-none font-semibold text-s-cta-fg hover:bg-s-cta-hover disabled:opacity-60"
        >
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
