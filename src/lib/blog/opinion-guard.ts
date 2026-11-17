import { parseOpinionCommand } from "./opinion";

/** The only account whose `/opinion` comments count. */
export const OPINION_OWNER = "gomez2608";

/** `createdAt` / `updatedAt` are the API's `created_at` / `updated_at` (ISO 8601). */
export type OpinionComment = { user: string; viaApp: boolean; body: string; createdAt: string; updatedAt: string };

/**
 * Every changed post with a non-null opinion must hold exactly the text of the LATEST `/opinion <slug>`
 * PR comment written by the owner directly (not through a GitHub App). Commit authorship isn't
 * consulted: it's plain git metadata anyone can set. Null opinions pass (blog:check handles those).
 *
 * If that latest comment was edited (`updatedAt` differs from `createdAt`), the post fails: anyone
 * with write access can edit a comment, and opinion.yml only ever applied the original text. A
 * newer unedited comment supersedes an edited one. Assumption: adding a reaction (opinion.yml's 👍)
 * doesn't change a comment's `updated_at` on GitHub, so the workflow's own reaction never trips this.
 */
export function findUnauthorizedOpinions(
  changed: { slug: string; opinion: string | null }[],
  comments: OpinionComment[],
): string[] {
  const latest = new Map<string, { text: string; at: number; edited: boolean }>();
  for (const c of comments) {
    if (c.user !== OPINION_OWNER || c.viaApp) continue;
    const cmd = parseOpinionCommand(c.body);
    if (!cmd) continue;
    const at = Date.parse(c.createdAt);
    const edited = Date.parse(c.updatedAt) !== at;
    const prev = latest.get(cmd.slug);
    // On equal timestamps the later comment in the list wins (the API lists oldest first).
    if (!prev || at >= prev.at) latest.set(cmd.slug, { text: cmd.text, at, edited });
  }
  const errors: string[] = [];
  for (const p of changed) {
    if (p.opinion === null) continue;
    const c = latest.get(p.slug);
    if (c?.edited) errors.push(`${p.slug}: tu comentario /opinion fue editado; publica un /opinion nuevo en vez de editar`);
    else if (c?.text !== p.opinion) errors.push(`${p.slug}: la opinión no coincide con un comentario /opinion tuyo`);
  }
  return errors;
}

/**
 * `pulls/N/files` lists at most 3000 files. If the PR's `changed_files` is larger than what was
 * listed, some files went unchecked: fail closed.
 */
export function findIncompleteFileList(changedFiles: number, listed: number): string[] {
  if (changedFiles <= listed) return [];
  return [
    `El PR cambia ${changedFiles} archivos pero la API solo listó ${listed}; no puedo verificarlo completo. Revísalo tú y divide el PR.`,
  ];
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
