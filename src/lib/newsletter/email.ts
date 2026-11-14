import { z } from "zod";
import { EMAIL_RE } from "@/lib/contact";

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export const SubscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .max(254)
    .regex(EMAIL_RE)
    .transform(normalizeEmail),
  consent: z.literal(true),
  // Lenient: a missing or malformed source (e.g. odd post metadata) never blocks a signup.
  source: z
    .string()
    .regex(/^[a-z0-9-]{1,80}$/)
    .catch("blog"),
});

export type SubscribeInput = z.infer<typeof SubscribeSchema>;
