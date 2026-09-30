import { z } from "zod";
import {
  CONTACT_REASONS,
  EMAIL_RE,
  MESSAGE_MAX,
  MESSAGE_MIN,
  NAME_MAX,
} from "./contact";

/** Server-side validation for /api/contact; mirrors the form's client-side checks. */
export const contactSchema = z.object({
  reason: z.enum(CONTACT_REASONS),
  name: z.string().trim().min(1).max(NAME_MAX),
  email: z.string().trim().max(254).regex(EMAIL_RE),
  message: z.string().trim().min(MESSAGE_MIN).max(MESSAGE_MAX),
  /** Visitor's site language, used for the confirmation email. */
  lang: z.enum(["en", "es"]).default("en"),
  /** Honeypot: hidden from people, filled in by bots. */
  company: z.string().optional(),
});

export type ContactPayload = z.infer<typeof contactSchema>;
