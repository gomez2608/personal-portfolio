import { z } from "zod";
import { EMAIL_RE } from "@/src/lib/contact";

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
  source: z
    .string()
    .regex(/^[a-z0-9-]{1,80}$/)
    .default("blog"),
  company: z.string().optional(),
});

export type SubscribeInput = z.infer<typeof SubscribeSchema>;
