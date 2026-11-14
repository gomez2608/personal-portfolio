// Client-safe: no server-only or node:crypto imports here.
export const POLICY_VERSION = "2026-11-14";
export const CONFIRM_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const RESEND_COOLDOWN_MS = 10 * 60 * 1000;
/** Honeypot field of the signup form: a name browser autofill doesn't recognise. */
export const HONEYPOT_FIELD = "nl_hp_field";

export type NewsletterResponse =
  { ok: true } | { ok: false; error: "invalid" | "rate_limited" | "server" };
