import { z } from "zod";

/** Slugs that collide with fixed routes under /blog. */
export const RESERVED_SLUGS = ["og", "clip-preview"] as const;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** True when `s` names a real calendar day (rejects 2026-02-30, 2026-13-45). */
function isCalendarDate(s: string): boolean {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

const isoDate = z
  .string()
  .regex(ISO_DATE_RE, "Expected YYYY-MM-DD")
  .refine(isCalendarDate, { message: "Not a real calendar date" });

export const PostMetaSchema = z
  .object({
    slug: z
      .string()
      .regex(SLUG_RE)
      .refine((s) => !(RESERVED_SLUGS as readonly string[]).includes(s), {
        message: "Reserved slug",
      }),
    title: z.string().min(1).max(90),
    hook: z.string().min(1).max(200),
    date: isoDate,
    issue: z.number().int().min(1),
    status: z.enum(["draft", "published"]),
    paper: z
      .object({
        title: z.string().min(1),
        url: z.string().url(),
        authors: z.array(z.string().min(1)).min(1),
        published: isoDate,
      })
      .strict(),
    /** Sebastián's take. `null` until the `/opinion` workflow writes it. Plain text, never MDX. */
    opinion: z
      .string()
      .max(1500)
      .refine((s) => !s.includes("{{{") && !s.includes("}}}"), { message: "No se permite {{{ ni }}}" })
      .nullable(),
  })
  .strict();

export type PostMeta = z.infer<typeof PostMetaSchema>;
