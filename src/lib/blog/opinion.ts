import { PostMetaSchema } from "./schema";

/** First line of an `/opinion` comment. Slug charset is a subset of post slugs, so no path tricks. */
const COMMAND_RE = /^\/opinion\s+([a-z0-9-]{1,80})\s*$/;

/**
 * Parses an `/opinion <slug>` PR comment. The text is everything after the first newline, kept
 * verbatim except for trailing whitespace. Returns null when the first line isn't a valid command
 * or there is no newline at all. An empty text is returned as "" (applyOpinion rejects it).
 */
export function parseOpinionCommand(body: string): { slug: string; text: string } | null {
  const nl = body.indexOf("\n");
  if (nl === -1) return null;
  const match = COMMAND_RE.exec(body.slice(0, nl));
  if (!match) return null;
  return { slug: match[1], text: body.slice(nl + 1).trimEnd() };
}

/** The same rules post.json is validated with (max length, no {{{ / }}}), so they can't drift. */
const OpinionSchema = PostMetaSchema.shape.opinion.unwrap();

/**
 * Writes `text` into a post.json's `opinion`, keeping every other key and its order.
 * Output is 2-space indented with a trailing newline.
 */
export function applyOpinion(
  postJson: string,
  text: string,
): { ok: true; json: string } | { ok: false; error: string } {
  let post: unknown;
  try {
    post = JSON.parse(postJson);
  } catch {
    return { ok: false, error: "post.json no es JSON válido." };
  }
  if (typeof post !== "object" || post === null || Array.isArray(post)) {
    return { ok: false, error: "post.json no es un objeto JSON válido." };
  }

  if (text.trim() === "") {
    return { ok: false, error: "La opinión está vacía: escribe el texto en las líneas debajo de /opinion <slug>." };
  }
  const checked = OpinionSchema.safeParse(text);
  if (!checked.success) {
    const tooBig = checked.error.issues.some((i) => i.code === "too_big");
    return {
      ok: false,
      error: tooBig
        ? `La opinión tiene ${text.length} caracteres; el máximo es 1500.`
        : "La opinión no puede contener {{{ ni }}}.",
    };
  }

  const next = { ...(post as Record<string, unknown>), opinion: checked.data };
  return { ok: true, json: `${JSON.stringify(next, null, 2)}\n` };
}
