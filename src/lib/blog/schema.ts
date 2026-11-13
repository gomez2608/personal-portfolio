import { z } from "zod";

/** Slugs that collide with fixed routes under /blog. */
export const RESERVED_SLUGS = ["og", "clip-preview"] as const;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isoDate = z.string().regex(ISO_DATE_RE, "Expected YYYY-MM-DD");

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
  })
  .strict();

export type PostMeta = z.infer<typeof PostMetaSchema>;
