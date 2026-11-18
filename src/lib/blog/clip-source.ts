/**
 * Brand check on a clip's source (`app/blog/<slug>/clips/clip-<n>.tsx`). Clips draw only
 * through the primitives and the `draw` layer, whose props accept brand tokens, so anything
 * that could paint off-brand (other modules, colour literals, raw SVG, inline styles) is
 * rejected here and `blog:check` fails. `draw/` and `primitives/` themselves are not checked.
 */

const ALLOWED_IMPORTS = new Set([
  "react",
  "@/app/components/blog/clips/clip-def",
  "@/app/components/blog/clips/primitives",
  "@/app/components/blog/clips/draw",
  "@/app/components/blog/clips/timing",
]);

const RAW_SVG = /<(rect|path|text|tspan|circle|ellipse|line|polyline|polygon|image|foreignObject|defs|filter|svg)\b/g;
const COLOUR = [/#[0-9a-fA-F]{3,8}\b/g, /["'`]#/g, /\b(?:rgba?|hsla?)\(/g];
const G_ALLOWED_ATTRS = new Set(["key", "transform", "opacity"]);

/** Removes comments, so they may mention anything. Keeps `://` (URLs) intact. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/** Returns one message per problem, each starting with `where`; empty means the clip passes. */
export function checkClipSource(where: string, source: string): string[] {
  const src = stripComments(source);
  const errors: string[] = [];
  const add = (msg: string) => errors.push(`${where}: ${msg}`);

  for (const m of src.matchAll(/\bimport\s+(?:[^"';]*?\s+from\s+)?["']([^"']+)["']/g)) {
    if (!ALLOWED_IMPORTS.has(m[1])) add(`import "${m[1]}" not allowed; use clip-def, primitives, draw or timing`);
  }

  const colours = new Set<string>();
  for (const re of COLOUR) for (const m of src.matchAll(re)) colours.add(m[0]);
  for (const c of colours) add(`colour literal "${c}": use a tone from draw (fill/stroke) or a primitive's tone`);

  const tags = new Set<string>();
  for (const m of src.matchAll(RAW_SVG)) tags.add(m[1]);
  for (const t of tags) add(`raw <${t}> not allowed: use Box, Path, Dot or Label from draw`);

  for (const m of src.matchAll(/<g(\s[^>]*)?>/g)) {
    const attrs = [...(m[1] ?? "").matchAll(/([A-Za-z][\w-]*)\s*=/g)].map((a) => a[1]);
    if (attrs.some((a) => !G_ALLOWED_ATTRS.has(a))) {
      add("<g> may only set key, transform or opacity: use Group");
      break;
    }
  }

  if (/\bstyle\s*=/.test(src)) add("style= not allowed: sizes and colours come from draw tokens");

  return errors;
}
