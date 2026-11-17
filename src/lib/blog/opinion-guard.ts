import { parseOpinionCommand } from "./opinion";

/** The only account whose `/opinion` comments count. */
export const OPINION_OWNER = "gomez2608";

export type OpinionComment = { user: string; viaApp: boolean; body: string; createdAt: string };

/**
 * Every changed post with a non-null opinion must hold exactly the text of the LATEST `/opinion <slug>`
 * PR comment written by the owner directly (not through a GitHub App). Commit authorship isn't
 * consulted: it's plain git metadata anyone can set. Null opinions pass (blog:check handles those).
 */
export function findUnauthorizedOpinions(
  changed: { slug: string; opinion: string | null }[],
  comments: OpinionComment[],
): string[] {
  const latest = new Map<string, { text: string; at: number }>();
  for (const c of comments) {
    if (c.user !== OPINION_OWNER || c.viaApp) continue;
    const cmd = parseOpinionCommand(c.body);
    if (!cmd) continue;
    const at = Date.parse(c.createdAt);
    const prev = latest.get(cmd.slug);
    // On equal timestamps the later comment in the list wins (the API lists oldest first).
    if (!prev || at >= prev.at) latest.set(cmd.slug, { text: cmd.text, at });
  }
  return changed
    .filter((p) => p.opinion !== null && latest.get(p.slug)?.text !== p.opinion)
    .map((p) => `${p.slug}: la opinión no coincide con un comentario /opinion tuyo`);
}

/**
 * Paths an edition PR must never touch: workflows (a PR could otherwise post its own
 * `opinion-guard: success` status) and the blog scripts / opinion code the checks rely on.
 * Prefix match on repo-relative paths.
 */
export const PROTECTED_PREFIXES = [".github/", "scripts/blog/", "src/lib/blog/opinion"] as const;

/** One Spanish error naming up to 5 protected paths the PR changes (added, edited, removed or renamed), or []. */
export function findProtectedPathChanges(paths: string[]): string[] {
  const hits = [...new Set(paths.filter((p) => PROTECTED_PREFIXES.some((prefix) => p.startsWith(prefix))))];
  if (hits.length === 0) return [];
  const shown = hits.slice(0, 5).join(", ");
  const more = hits.length > 5 ? ` y ${hits.length - 5} más` : "";
  return [`El PR modifica archivos protegidos (${shown}${more}); revísalo tú y aplica esos cambios fuera de una edición.`];
}
