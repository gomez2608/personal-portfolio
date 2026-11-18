# Paper-tailored clips — design

## Intent

Today every clip is built from the same eight primitives (`Node`, `Connector`, `FlowDot`, `Highlight`, `Dim`, `Counter`, `Title`, `Text`), and `ESTILO.md` §4 forbids anything else. So every paper becomes rounded boxes joined by lines with a dot moving between them: edition 0001's three posts look like the same picture with different labels.

Sebastián wants to keep the current look (it's "perfect") but stop the animations from feeling recycled. The variety must come **from each paper itself**, not from a menu of styles (a menu repeats too, just more slowly). A clip about a reasoning trace should look like a reasoning trace; one about a payment destination should look like where that destination came from.

Validated by a throwaway spike (local branch `spike/paper-clips`): LoCo clip 1 redrawn as a page of paragraphs filling up, a confidence trace in the margin, a tangerine cut line at paragraph 11, the extra ending folding away and a counter rolling 1.247 → 296. His reaction: "Love it".

## Goals

- Each clip's shapes and motion come from the paper: the object it studies (a trace, a tool call, an episode, a layer stack, a token grid) or its key figure.
- The brand look stays locked **by code**, not by the agent's memory: colours, type, text floor, stroke weights, corner radii, easing.
- The agent checks new clips against already-published ones and changes course when a layout or motion repeats.
- The review stays easy: the PR says what each clip is built around and why.

## Non-goals

- Other visual styles (charts-only, illustrations, kinetic type, particles): shown in brainstorming and rejected.
- Interactive clips.
- Changing the clip format: still Remotion scenes on the 1280×720 Paper stage, 30 fps, captions in the HTML bar under the stage, 2–3 clips per post, 10–20 s.
- Redrawing `mezcla-de-expertos` (its clips stay as they are).

## Anti-goals

- Drift: off-brand colours, text under 34px, tangerine text, thin or inconsistent strokes, flashy easing. Variety in *structure*, never in *look*.
- Decoration for its own sake: a paper-specific shape that doesn't explain the mechanism better than boxes would is worse than boxes.
- Invented data presented as real: illustrative values (like the spike's confidence curve) must be declared as such in the post, as ESTILO already requires for invented examples.

## Constraints (unchanged, still enforced)

Paper stage in both themes; palette `C` only (`app/components/blog/clips/palette.ts`); tangerine is signal, never text; Manrope + DM Mono; every label ≥34px; ~40px clear of every edge; captions 3–5 per clip, ≤70 characters, no gaps; something visible at frame 0; the last frame sums the idea up alone (reduced motion shows only it) and holds ≥2 s; `defineClip` + `validateClipDef` must pass.

## Approaches considered

1. **Loosen the rules only.** Let the agent write raw SVG + Remotion with the brand tokens. Fastest, most freedom, but nothing checks the brand except review, so the look drifts edition by edition.
2. **Brand drawing layer + rules (chosen).** Add low-level drawing atoms whose props can only express brand values, plus a source check in `blog:check` that rejects anything outside them, plus new ESTILO rules that make the agent start from the paper. Real variety; the look is enforced by types and by the check. Cost: engine work before the agent can use it.
3. *(Not separate)* "Recreate the paper's key figure" is part of the agent's process under 2, not an alternative.

He chose 2.

## Design

### 1. Drawing layer: `app/components/blog/clips/draw/`

Low-level atoms, all SVG in stage coordinates, timings in frames. Props accept **brand tokens only** (never a raw colour, size or easing):

- **Tones** for fill and stroke: `ink` (white fill / ink stroke), `navy`, `fog`, `line`, `muted`, `accent` (tangerine), `none`. Mapped to `C`.
- **Stroke weights**: `thin` (2), `bold` (3). **Radii**: a small fixed set (e.g. 6, 10, 14).
- **Atoms** (the spike's set, hardened): `Box` (rect; fade or grow-from-edge), `Path` (any `d`, drawn on; optional dashed), `Dot`, `Label` (Manrope 600/700/800 or DM Mono; size clamped to ≥34; tones `ink`/`navy`/`slate`/`white`, never tangerine), `Group` (translate/scale, for reuse within a scene).
- **Motion helpers**: `useAppear(at, dur)`, `Fade`, `Fold` (collapse toward a line), `MoveAlong` (a child following a path), `Pulse`; all built on `progress()`/`easeInOutCubic` so motion matches the existing primitives.
- The eight existing primitives stay and keep working; scenes may mix both *(settled)*: atoms work inside `Dim` and `Group`, `Counter` is reused for rolling numbers, `Highlight` stays top-level and may wrap atoms. Nothing is replaced.

### 2. Brand check in `blog:check`

A source-level check of every `app/blog/*/clips/clip-*.tsx`, added to `src/lib/blog/validate.ts` with tests:

- Imports only from `@/app/components/blog/clips/{clip-def,primitives,draw,timing}` (and `react`). No `remotion`, no `palette` direct, no other modules.
- No colour literals (`#…`, `rgb(`, `hsl(`, named CSS colours in `fill`/`stroke`), no raw SVG elements (`<rect`, `<path`, `<text`, `<circle`, `<line`, …) in JSX, no `style=`. A bare `<g>` with only `key` / `transform` / `opacity` is allowed (`mezcla-de-expertos/clip-2` uses one for grouping).
- Scope *(builder's call, settled)*: only `app/blog/*/clips/clip-*.tsx`. `draw/` and `primitives/` are the trusted layer: they may import `remotion` and `palette` and use `style`. Every existing clip (`mezcla-de-expertos`, edition 0001) must pass; checked 2026-11-18, they do.
- Error messages say what to use instead.

Together with typed props this makes off-brand output fail CI rather than rely on review.

### 3. Agent rules: `newsletter/agent/ESTILO.md` §4 rewrite (+ `borradores.md` step 3, `revision.md`)

- **Start from the paper.** Before drawing, write down (in the PR notes) the paper's own object or figure and how each clip's picture comes from it. Boxes-and-arrows only when the mechanism really is a graph of components.
- **Don't repeat.** List the clips already on `master` (`app/blog/*/clips/`), look at their snapshots, and don't reuse a layout + motion pattern (e.g. "row of boxes, dimmed row below, link to answer") used in a previous edition or elsewhere in the same edition.
- **Allowed building blocks:** primitives + `draw/` atoms only; everything else as today (34px, tangerine never text, layout constants at the top, `T` timeline object, captions rules, final frame).
- **Illustrative values** (curves, numbers, examples not taken from the paper) are declared in the post text and the PR notes.
- **PR description**, per clip: "Construido a partir de: <objeto/figura del paper>" and what it shows.
- Visual review (`blog:snap`) keeps the same checklist, plus: "does this clip look like any previous clip?"
- **Layout safety** *(settled)*: no geometric check in code. Free-form shapes rely on the same snapshot review as today (40px margins, overlap, text overflowing its shape), which the agent already does frame by frame; `Label` documents the ≈20px/char (Manrope) and ≈21px/char (DM Mono) widths so text can be sized. Revisit if review keeps catching overflow.
- **How "don't repeat" is checked** *(settled)*: agent judgment, with tooling only where cheap. The cloud agent can run `blog:snap` (it did for 0001; Chrome is at `$CHROME_PATH`), so before drawing it snaps the published posts of the last two editions (and the other posts of its own edition as it goes) and looks at their last frames. Each clip file starts with a one-line comment `// Construido a partir de: <objeto/figura del paper>` so earlier choices are also greppable.

### 4. Docs

`CLAUDE.md` (clip engine paragraph mentions `draw/` and the brand check), `ESTILO.md` as above. A second reference clip in the new style, the cleaned-up spike, is added to ESTILO alongside `mezcla-de-expertos/clip-1.tsx`. It lives in `cuando-dejar-de-pensar` (see below).

## Left to the builder

Exact atom APIs and names beyond the list above; the precise set of radii; how the source check parses (regex vs. TypeScript AST — AST preferred if cheap); whether `Group` needs rotation; tests for each atom's clamping (Label ≥34, tones) and for the check's accept/reject cases.

## Edition 0001 (decided)

Edition 0001 (PR #8, not sent yet; only Sebastián is subscribed) is **redrawn with the new process before it's sent**. Order: (1) build the drawing layer, the brand check and the ESTILO rules, merged to `master`; (2) the cleaned-up spike becomes `cuando-dejar-de-pensar/clips/clip-1.tsx` and the second reference clip in ESTILO; (3) the agent redraws the other five clips of PR #8 (LoCo clip 2, SPILLWAY clips 1–2, actor/judge/teacher clips 1–2) following the new rules, on `edicion-0001`; (4) Sebastián reviews, writes the three `/opinion`s and merges. Posts' text changes only where a clip's change needs it (e.g. declaring illustrative values).
