import type { PostEntry } from "./entries";
import { PostMetaSchema } from "./schema";

const PENDING_OPINION_RE = /<MiOpinion\s+pending\b/;

/** Returns human-readable errors for the given posts; empty means OK. */
export function validatePosts(entries: PostEntry[], today: string): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const where = `app/blog/${entry.dir}`;
    const parsed = PostMetaSchema.safeParse(entry.meta);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push(`${where}/post.json: ${issue.path.join(".") || "(root)"}: ${issue.message}`);
      }
      continue;
    }
    const meta = parsed.data;

    if (meta.slug !== entry.dir) {
      errors.push(`${where}: folder name "${entry.dir}" must equal slug "${meta.slug}"`);
    }
    if (seen.has(meta.slug)) {
      errors.push(`${where}: duplicate slug "${meta.slug}"`);
    }
    seen.add(meta.slug);

    if (entry.mdx === null) {
      errors.push(`${where}: missing page.mdx`);
      continue;
    }

    if (meta.status === "published") {
      if (PENDING_OPINION_RE.test(entry.mdx)) {
        errors.push(`${where}: published post still has a pending opinion (<MiOpinion pending>)`);
      }
      if (meta.date > today) {
        errors.push(`${where}: published post is dated in the future (${meta.date} > ${today})`);
      }
    }
  }
  return errors;
}
