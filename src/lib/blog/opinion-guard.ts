/** The only author/message pair allowed to change an `opinion`: the non-AI `/opinion` workflow. */
export const OPINION_BOT = "github-actions[bot]";
export const OPINION_MESSAGE_PREFIX = "opinion: ";

export type OpinionCommit = {
  sha: string;
  author: string;
  message: string;
  /** slug → opinion at this commit, for every post.json present. */
  opinions: Record<string, string | null>;
};

/**
 * Walks `commits` in order from `base` and returns one error per opinion change made by anything
 * other than the `/opinion` workflow. A post that doesn't exist counts as `opinion: null`, so a new
 * post with a null opinion is fine and a new or deleted post with text is a change.
 */
export function findIllegalOpinionEdits(
  commits: OpinionCommit[],
  base: Record<string, string | null>,
): string[] {
  const errors: string[] = [];
  let prev = base;
  for (const c of commits) {
    const allowed = c.author === OPINION_BOT && c.message.startsWith(OPINION_MESSAGE_PREFIX);
    if (!allowed) {
      const slugs = [...new Set([...Object.keys(prev), ...Object.keys(c.opinions)])].sort();
      for (const slug of slugs) {
        if ((prev[slug] ?? null) !== (c.opinions[slug] ?? null)) {
          errors.push(`${c.sha.slice(0, 7)} changed the opinion of ${slug}`);
        }
      }
    }
    prev = c.opinions;
  }
  return errors;
}
