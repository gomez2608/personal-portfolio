"use client";

import { useId, useState } from "react";
import Link from "next/link";
import type { NewsletterResponse } from "@/lib/newsletter/constants";
import { cn } from "@/lib/utils";

type Result = "ok" | "invalid" | "rate_limited" | "server";
type Status = "idle" | "sending" | Result;

const MESSAGES: Record<Result, string> = {
  // Same text for every { ok: true }: it never reveals whether the address was already subscribed.
  ok: "Revisa tu correo: te enviamos un enlace para confirmar.",
  invalid: "Revisa la dirección de correo: parece que no es válida.",
  rate_limited: "Hiciste demasiados intentos. Espera unos minutos y vuelve a intentarlo.",
  server: "No pudimos completar la suscripción. Inténtalo de nuevo en unos minutos.",
};

const ERRORS: ReadonlySet<Status> = new Set<Status>(["invalid", "rate_limited", "server"]);

/** Newsletter sign-up: email, required consent and a honeypot, posting to /api/newsletter/subscribe. */
export function NewsletterSignup({ source }: { source: string }) {
  const id = useId();
  const emailId = `${id}-email`;
  const consentId = `${id}-consent`;
  const statusId = `${id}-status`;
  const titleId = `${id}-title`;

  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");

  const sending = status === "sending";
  const isError = ERRORS.has(status);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    setStatus("sending");
    let next: Result = "server";
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), consent, source, company }),
      });
      const data = (await res.json().catch(() => null)) as NewsletterResponse | null;
      if (data?.ok) next = "ok";
      else if (data && Object.hasOwn(MESSAGES, data.error)) next = data.error;
      else if (res.status === 429) next = "rate_limited";
    } catch {
      next = "server";
    }
    if (next === "ok") {
      setEmail("");
      setConsent(false);
    }
    setStatus(next);
  };

  return (
    <section
      aria-labelledby={titleId}
      className="rounded-xl border border-line bg-card p-[clamp(20px,4vw,32px)]"
    >
      <h2 id={titleId} className="text-2xl leading-tight font-bold tracking-[-.01em] text-ink">
        Recibe la próxima edición
      </h2>
      <p className="mt-2 text-slate">
        Un resumen cada dos semanas con 3–4 ideas recientes de IA, explicadas en simple.
      </p>

      <form onSubmit={submit} className="relative mt-6 grid gap-5">
        <div className="grid gap-2">
          <label htmlFor={emailId} className="text-sm font-semibold text-ink">
            Correo electrónico
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            placeholder="tu@correo.com"
            value={email}
            onInvalid={(e) =>
              e.currentTarget.setCustomValidity(
                e.currentTarget.validity.valueMissing
                  ? "Escribe tu correo electrónico."
                  : "Escribe un correo válido, por ejemplo nombre@dominio.com.",
              )
            }
            onChange={(e) => {
              e.currentTarget.setCustomValidity("");
              setEmail(e.target.value);
              if (status === "invalid") setStatus("idle");
            }}
            aria-invalid={status === "invalid" ? true : undefined}
            aria-describedby={isError ? statusId : undefined}
            className={cn(
              "min-h-12 w-full min-w-0 rounded-lg border bg-bg px-4 text-base text-ink placeholder:text-graphite",
              status === "invalid" ? "border-err" : "border-graphite",
            )}
          />
        </div>

        <div className="flex items-start gap-3">
          <input
            id={consentId}
            name="consent"
            type="checkbox"
            required
            checked={consent}
            onInvalid={(e) =>
              e.currentTarget.setCustomValidity("Marca la casilla para aceptar la política y suscribirte.")
            }
            onChange={(e) => {
              e.currentTarget.setCustomValidity("");
              setConsent(e.target.checked);
            }}
            className="mt-0.5 size-5 shrink-0 accent-[var(--emph)]"
          />
          <label htmlFor={consentId} className="text-sm leading-snug text-graphite">
            Acepto la{" "}
            <Link
              href="/privacidad"
              className="font-semibold text-ink underline decoration-current/60 underline-offset-4 hover:decoration-current"
            >
              política de tratamiento de datos
            </Link>{" "}
            y recibir el boletín por correo.
          </label>
        </div>

        <div>
          <button
            type="submit"
            aria-disabled={sending ? true : undefined}
            className={cn(
              "min-h-12 rounded-lg bg-s-cta px-6 text-[15px] font-semibold text-s-cta-fg transition-[background-color] duration-200 hover:bg-s-cta-hover max-[420px]:w-full",
              sending && "cursor-wait opacity-60",
            )}
          >
            {sending ? "Enviando…" : "Suscribirme"}
          </button>
        </div>

        {/* Honeypot: off-screen and skipped by keyboard and assistive tech; bots fill it in. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Empresa
            <input
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </label>
        </div>

        <p
          id={statusId}
          aria-live="polite"
          className={cn(
            "min-h-[1.25rem] text-sm leading-snug",
            isError ? "text-err" : status === "ok" ? "font-semibold text-ink" : "text-graphite",
          )}
        >
          {status === "idle" || status === "sending" ? "" : MESSAGES[status]}
        </p>
      </form>
    </section>
  );
}
