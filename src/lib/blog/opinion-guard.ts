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
