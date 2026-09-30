import { copy } from "@/app/data/content";

/** Reasons are sent as their English labels so the email subject is stable across languages. */
export const CONTACT_REASONS = copy.en.contactForm.reasons as [
  string,
  ...string[],
];

export const NAME_MAX = 100;
export const MESSAGE_MIN = 5;
export const MESSAGE_MAX = 1000;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type ContactResponse =
  { ok: true } | { ok: false; error: "invalid" | "rate_limited" | "server" };
