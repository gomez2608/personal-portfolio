import { validateClipDef, type ClipDef } from "../../../app/components/blog/clips/clip-types";
import type { PostEntry } from "./entries";
import { PostMetaSchema } from "./schema";

const PENDING_OPINION_RE = /<MiOpinion\s+pending\b/;
const OPINION_RE = /<MiOpinion\s*>([\s\S]*?)<\/MiOpinion>/g;

/** True when the MDX has at least one `<MiOpinion>…</MiOpinion>` with real text in it. */
function hasOpinion(mdx: string): boolean {
  return [...mdx.matchAll(OPINION_RE)].some((m) => m[1].trim().length > 0);
}

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
      } else if (!hasOpinion(entry.mdx)) {
        errors.push(`${where}: published post needs a non-empty <MiOpinion>…</MiOpinion>`);
      }
      if (meta.date > today) {
        errors.push(`${where}: published post is dated in the future (${meta.date} > ${today})`);
      }
    }
  }
  return errors;
}

/** Loads one clip module, e.g. `import("app/blog/<dir>/clips/<clip>.tsx")`. */
export type ClipLoader = (dir: string, clip: string) => Promise<unknown>;

/**
 * Loads every clip of every post and runs `validateClipDef` on its definition. A module that
 * throws on load (defineClip throws on an invalid definition) is reported with its message.
 */
export async function validateClipModules(entries: PostEntry[], load: ClipLoader): Promise<string[]> {
  const errors: string[] = [];
  for (const entry of entries) {
    for (const clip of entry.clipFiles) {
      const where = `app/blog/${entry.dir}/clips/${clip}.tsx`;
      let mod: unknown;
      try {
        mod = await load(entry.dir, clip);
      } catch (e) {
        errors.push(`${where}: failed to load: ${(e as Error).message.replace(/\s*\n\s*/g, " ")}`);
        continue;
      }
      const def = (mod as { default?: { def?: ClipDef } } | null)?.default?.def;
      if (!def || typeof def !== "object") {
        errors.push(`${where}: must default-export defineClip({...})`);
        continue;
      }
      for (const problem of validateClipDef(def)) errors.push(`${where}: ${problem}`);
    }
  }
  return errors;
}
