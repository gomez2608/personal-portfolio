import path from "node:path";
import { z } from "zod";
import type { PostMeta } from "@/lib/blog/schema";

// Kept free of `server-only` so the send script (tsx) can import it.

/** Resend substitutes `{{{NAME}}}` in broadcasts, so authored copy must never contain triple braces. */
const noPlaceholders = (s: string) => !s.includes("{{{") && !s.includes("}}}");
const PLACEHOLDER_MSG = "Must not contain {{{ or }}} (Resend would treat it as a placeholder)";

const copy = (min: number, max: number) =>
  z.string().min(min).max(max).refine(noPlaceholders, { message: PLACEHOLDER_MSG });

function isCalendarDate(s: string): boolean {
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export const IssueSchema = z
  .object({
    issue: z.number().int().min(1),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
      .refine(isCalendarDate, { message: "Not a real calendar date" }),
    subject: copy(1, 90),
    preheader: copy(0, 140),
    /** Paragraphs separated by a blank line. */
    intro: copy(1, 800),
    posts: z
      .array(z.object({ slug: z.string().min(1), blurb: copy(1, 320) }).strict())
      .min(1)
      .max(4),
  })
  .strict();

export type Issue = z.infer<typeof IssueSchema>;

/** `newsletter/issues/NNNN.json`: the issue number, zero-padded to 4 digits. */
export function issueFileName(n: number): string {
  return `${String(n).padStart(4, "0")}.json`;
}

export function validateIssue(
  issue: unknown,
  fileName: string,
  posts: Map<string, PostMeta>,
): { ok: true; issue: Issue } | { ok: false; errors: string[] } {
  const parsed = IssueSchema.safeParse(issue);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => `${i.path.length ? i.path.join(".") : "(root)"}: ${i.message}`),
    };
  }
  const data = parsed.data;
  const errors: string[] = [];

  const base = path.basename(fileName);
  const expected = issueFileName(data.issue);
  if (base !== expected) {
    errors.push(`File name ${base} does not match issue ${data.issue} (expected ${expected})`);
  }

  const seen = new Set<string>();
  for (const { slug } of data.posts) {
    if (seen.has(slug)) {
      errors.push(`Duplicate post slug "${slug}"`);
      continue;
    }
    seen.add(slug);
    const meta = posts.get(slug);
    if (!meta) {
      errors.push(`Unknown post slug "${slug}" (no app/blog/${slug}/post.json)`);
      continue;
    }
    if (meta.status !== "published") {
      errors.push(`Post "${slug}" is a ${meta.status}; set "status": "published" before sending`);
    }
    // The post title is copied into the email, so it must be placeholder-free too.
    if (!noPlaceholders(meta.title)) errors.push(`Post "${slug}" title: ${PLACEHOLDER_MSG}`);
  }

  return errors.length ? { ok: false, errors } : { ok: true, issue: data };
}
