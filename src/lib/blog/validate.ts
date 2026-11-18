import { validateClipDef, type ClipDef } from "../../../app/components/blog/clips/clip-types";
import { checkClipSource } from "./clip-source";
import type { PostEntry } from "./entries";
import { PostMetaSchema } from "./schema";

/** A Markdown heading or bold label "Mi opinión": the opinion is rendered from post.json only. */
const MI_OPINION_RE = /^\s{0,3}#{1,6}\s*mi\s+opini[oó]n\b|(\*\*|__)\s*mi\s+opini[oó]n/imu;

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

    for (const [clip, source] of Object.entries(entry.clipSources ?? {})) {
      errors.push(...checkClipSource(`${where}/clips/${clip}.tsx`, source));
    }

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

    if (entry.mdx.includes("<MiOpinion")) {
      errors.push(`${meta.slug}: MiOpinion ya no se usa; la opinión va en post.json`);
    }

    if (meta.status === "published") {
      if (meta.opinion === null || meta.opinion.trim() === "") {
        errors.push(`${meta.slug}: falta tu opinión. Escribe /opinion ${meta.slug} en el PR.`);
      }
      if (MI_OPINION_RE.test(entry.mdx)) {
        errors.push(`${meta.slug}: page.mdx no puede tener un encabezado ni una etiqueta "Mi opinión"; la opinión solo viene de post.json`);
      }
      if (entry.hasCover === false) {
        errors.push(
          `${meta.slug}: falta la portada. Corre npm run blog:cover -- ${meta.slug} (con npm run dev) y commitea public/blog/${meta.slug}/cover.png.`,
        );
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
