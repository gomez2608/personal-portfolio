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

/** A lowercase JSX element (`<rect`, `<style`, `<div`…) where JSX can start; skips TS generics (`Array<number>`) and comparisons. */
const INTRINSIC = /(?:^|[(>{}?:&|,=;]|\breturn)\s*<([a-z][\w.-]*)/gm;
const COLOUR = [/["'`]#/g, /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color)\(/g];
const G_ALLOWED_ATTRS = new Set(["key", "transform", "opacity"]);

/**
 * Removes comments so they may mention anything. A comment only starts after whitespace or
 * the start of a line (or `{` for JSX comments), so `"//"` inside a string and URLs survive.
 */
function stripComments(source: string): string {
  return source.replace(/(^|[\s{])\/\*[\s\S]*?\*\//g, "$1").replace(/(^|\s)\/\/.*$/gm, "$1");
}

/** The text of each `<g …>` opening tag, read past `>` inside `{…}` expressions and strings. */
function gTags(src: string): string[] {
  const tags: string[] = [];
  for (const m of src.matchAll(/<g(?=[\s>/])/g)) {
    let depth = 0;
    let quote = "";
    let i = (m.index ?? 0) + 2;
    for (; i < src.length; i++) {
      const c = src[i];
      if (quote) {
        if (c === quote) quote = "";
      } else if (c === '"' || c === "'" || c === "`") quote = c;
      else if (c === "{") depth++;
      else if (c === "}") depth--;
      else if (c === ">" && depth === 0) break;
    }
    tags.push(src.slice((m.index ?? 0) + 2, i));
  }
  return tags;
}

/** Returns one message per problem, each starting with `where`; empty means the clip passes. */
export function checkClipSource(where: string, source: string): string[] {
  const src = stripComments(source);
  const errors: string[] = [];
  const add = (msg: string) => errors.push(`${where}: ${msg}`);

  const modules = [
    ...src.matchAll(/\b(?:import|export)\s+(?:[^"';]*?\s+from\s+)?["']([^"']+)["']/g),
    ...src.matchAll(/\b(?:require|import)\s*\(\s*["']([^"']+)["']/g),
  ].map((m) => m[1]);
  for (const m of new Set(modules)) {
    if (!ALLOWED_IMPORTS.has(m)) add(`import "${m}" not allowed; use clip-def, primitives, draw or timing`);
  }

  const colours = new Set<string>();
  for (const re of COLOUR) for (const m of src.matchAll(re)) colours.add(m[0]);
  for (const c of colours) add(`colour literal "${c}": use a tone from draw (fill/stroke) or a primitive's tone`);

  const tags = new Set<string>();
  for (const m of src.matchAll(INTRINSIC)) if (m[1] !== "g") tags.add(m[1]);
  for (const t of tags) add(`raw <${t}> not allowed: use Box, Path, Dot or Label from draw`);

  for (const tag of gTags(src)) {
    let flat = tag;
    while (/\{[^{}]*\}/.test(flat)) flat = flat.replace(/\{[^{}]*\}/g, (b) => (b.startsWith("{...") ? " ...spread " : "_"));
    const attrs = [...flat.matchAll(/([A-Za-z][\w-]*)\s*=/g)].map((a) => a[1]);
    if (flat.includes("...spread") || attrs.some((a) => !G_ALLOWED_ATTRS.has(a))) {
      add("<g> may only set key, transform or opacity: use Group");
      break;
    }
    if (/scale\s*\(/.test(tag)) {
      add("<g> may not scale (it would shrink text below 34px): use Group, which never scales below 1");
      break;
    }
  }

  if (/\bstyle\s*=/.test(src)) add("style= not allowed: sizes and colours come from draw tokens");
  if (/\bcreateElement\b/.test(src)) add("createElement not allowed: use the primitives and draw components");
  if (/\bdangerouslySetInnerHTML\b/.test(src)) add("dangerouslySetInnerHTML not allowed");

  return errors;
}
