"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/app/components/providers/lang-provider";
import {
  CONTACT_REASONS,
  EMAIL_RE,
  MESSAGE_MAX,
  MESSAGE_MIN,
  NAME_MAX,
  type ContactResponse,
} from "@/lib/contact";
import { cn } from "@/lib/utils";

type Stage = "idle" | "sending" | "sent";

const cardClass =
  "flex flex-col rounded-xl border border-s-line bg-card text-f-fg shadow-[0_12px_32px_rgba(15,18,32,.06)] transition-[background,border-color] duration-400";
const labelClass =
  "font-mono text-[11px] leading-none tracking-[.1em] text-f-meta uppercase";
const fieldClass =
  "border-0 border-b bg-transparent pt-2 pb-3 text-[17px] font-medium text-f-fg outline-none transition-colors duration-200 placeholder:text-f-meta focus:border-f-fg";

export function ContactForm() {
  const { t, lang } = useLang();
  const fm = t.contactForm;
  const [reason, setReason] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [tried, setTried] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentName, setSentName] = useState("");
  const thanksRef = useRef<HTMLHeadingElement>(null);

  const okName = name.trim().length > 0;
  const okEmail = EMAIL_RE.test(email.trim());
  const okMsg = message.trim().length >= MESSAGE_MIN;

  // After a failed submit the hint shows the first remaining problem, live.
  const fieldError = tried
    ? !okName
      ? fm.errName
      : !okEmail
        ? fm.errEmail
        : !okMsg
          ? fm.errMsg
          : ""
    : "";
  const hint = serverError ?? (tried ? fieldError : fm.hint);
  const hintIsError = !!serverError || (tried && !!fieldError);

  useEffect(() => {
    if (stage === "sent") thanksRef.current?.focus();
  }, [stage]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stage === "sending") return;
    setTried(true);
    setServerError(null);
    if (!okName || !okEmail || !okMsg) return;

    setStage("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: CONTACT_REASONS[reason],
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          company,
          lang,
        }),
      });
      const data = (await res
        .json()
        .catch(() => null)) as ContactResponse | null;
      if (res.ok && data?.ok) {
        setSentName(name.trim().split(/\s+/)[0] ?? "");
        setStage("sent");
        return;
      }
      setServerError(res.status === 429 ? fm.errRate : fm.errSend);
    } catch {
      setServerError(fm.errSend);
    }
    setStage("idle");
  };

  const reset = () => {
    setReason(0);
    setName("");
    setEmail("");
    setMessage("");
    setCompany("");
    setTried(false);
    setServerError(null);
    setStage("idle");
  };

  if (stage === "sent") {
    return (
      <div className={cn(cardClass, "gap-[18px] px-8 py-10")} role="status">
        <span
          aria-hidden="true"
          className="flex size-11 items-center justify-center rounded-full bg-tangerine text-xl leading-none font-bold text-ink-fixed"
        >
          ✓
        </span>
        <h3
          ref={thanksRef}
          tabIndex={-1}
          className="m-0 text-[32px] leading-[1.1] font-extrabold tracking-[-.03em] outline-none"
        >
          {fm.thanks}
          {sentName && `, ${sentName}`}
          <span className="text-tangerine">.</span>
        </h3>
        <p className="m-0 text-base leading-[1.6] text-s-2">{fm.thanks2}</p>
        <button
          type="button"
          onClick={reset}
          className="self-start rounded-lg border border-s-line-strong px-4 py-3 text-sm leading-none font-semibold hover:border-s-2"
        >
          {fm.another}
        </button>
      </div>
    );
  }

  const invalid = (ok: boolean) =>
    tried && !ok ? "border-invalid" : "border-s-line-strong";

  return (
    <form
      noValidate
      onSubmit={submit}
      aria-describedby="contact-hint"
      className={cn(cardClass, "relative gap-[22px] p-[clamp(20px,4vw,32px)]")}
    >
      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className={cn(labelClass, "mb-2.5 p-0")}>{fm.about}</legend>
        <div className="flex flex-wrap gap-2">
          {fm.reasons.map((label, i) => {
            const on = reason === i;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={on}
                onClick={() => setReason(i)}
                className={cn(
                  "rounded-lg border px-3.5 py-[11px] text-sm leading-none font-semibold transition-colors duration-200",
                  on
                    ? "border-s-cta bg-s-cta text-s-cta-fg"
                    : "border-s-line-strong bg-transparent text-s-2",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[22px]">
        <label className="flex flex-col gap-2.5">
          <span className={labelClass}>{fm.name}</span>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={NAME_MAX}
            placeholder={fm.namePh}
            aria-invalid={tried && !okName}
            className={cn(fieldClass, "leading-[1.3]", invalid(okName))}
          />
        </label>
        <label className="flex flex-col gap-2.5">
          <span className={labelClass}>{fm.email}</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={tried && !okEmail}
            className={cn(fieldClass, "leading-[1.3]", invalid(okEmail))}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2.5">
        <span className={cn(labelClass, "flex justify-between")}>
          <span>{fm.msg}</span>
          <span aria-hidden="true">
            {message.length} / {MESSAGE_MAX}
          </span>
        </span>
        <textarea
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={MESSAGE_MAX}
          placeholder={fm.msgPh}
          aria-invalid={tried && !okMsg}
          className={cn(fieldClass, "resize-y leading-[1.5]", invalid(okMsg))}
        />
      </label>

      {/* Honeypot: off-screen and skipped by keyboard and assistive tech; bots fill it in. */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label>
          Company
          <input
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={stage === "sending"}
          className="flex items-center gap-2.5 rounded-lg bg-s-cta px-[22px] py-4 text-[15px] leading-none font-semibold text-s-cta-fg transition-colors duration-400 hover:bg-s-cta-hover disabled:opacity-60"
        >
          {stage === "sending" ? fm.sending : fm.send}
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-tangerine"
          />
        </button>
        <span
          id="contact-hint"
          role={hintIsError ? "alert" : undefined}
          className={cn(
            "font-mono text-xs leading-[1.4]",
            hintIsError ? "text-err" : "text-f-meta",
          )}
        >
          {hint}
        </span>
      </div>
    </form>
  );
}
