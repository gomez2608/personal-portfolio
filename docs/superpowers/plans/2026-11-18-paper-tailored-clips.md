# Paper-tailored clips Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let each clip draw shapes that come from its paper, with the brand look enforced by code, and redraw edition 0001's clips that way.

**Architecture:** A brand drawing layer (`app/components/blog/clips/draw/`) whose props accept only brand tokens; a source check on every `clip-*.tsx`, run by the existing `validatePosts` (so `scripts/blog/` stays untouched and the PR passes `opinion-guard`); new agent rules in `ESTILO.md`. Then LoCo clip 1 is replaced by the cleaned-up spike, and the cloud agent redraws the other five clips of PR #8.

**Tech Stack:** Next.js 15, React 19, Remotion 4 (`useCurrentFrame`), TypeScript, Vitest (node env, `*.test.ts` only).

**Spec:** `docs/superpowers/specs/2026-11-18-paper-tailored-clips-design.md`. Spike for reference: local branch `spike/paper-clips` (`app/components/blog/clips/draw/index.tsx`, `app/blog/cuando-dejar-de-pensar/clips/clip-3.tsx`).

## Global Constraints

- Stage 1280×720, 30 fps, Paper background in both themes; colours only from `C` in `app/components/blog/clips/palette.ts`.
- Tangerine (`C.tangerine`) is never text.
- Every label ≥34px (Manrope or DM Mono).
- Stroke weights 2 (`thin`) and 3 (`bold`) only; radii 6, 10, 14 only.
- Motion eases with `progress()` / `easeInOutCubic` from `timing.ts`.
- The eight existing primitives keep working, unchanged.
- Do not touch `.github/`, `scripts/blog/` or `src/lib/blog/opinion*` (otherwise `opinion-guard` fails the PR by design).
- Never commit `.env.local`, `design_handoff_portfolio_*`, `.blog-snaps/`, `.superpowers/`.
- Agent-facing text (`ESTILO.md`, `borradores.md`, `revision.md`) is in Spanish.
- Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

- A clip with a hex colour inside a template string or a variable (`` fill={`#${x}`} ``, `const red = "#f00"`): the check must reject any colour literal anywhere in the file, not only in a `fill=` attribute.
- A `<g>` carrying styling (`<g fill=…>`, `<g style=…>`): rejected; a bare `<g key transform opacity>` is accepted.
- `Label size={20}`: renders at 34, not 20 (clamped, not an error, so a mistake never breaks a build).
- A clip importing `remotion`, `../palette` or a relative helper file: rejected with a message naming the allowed modules.
- A post with no `clips/` folder or a non-clip helper file in it: the check ignores files not named `clip-<n>.tsx`.

---

### Task 1: Brand drawing layer

**Files:**
- Create: `app/components/blog/clips/draw/tokens.ts` (pure, no React)
- Create: `app/components/blog/clips/draw/tokens.test.ts`
- Create: `app/components/blog/clips/draw/atoms.tsx`, `app/components/blog/clips/draw/motion.tsx`, `app/components/blog/clips/draw/index.tsx`

**Interfaces:**
- Produces (from `@/app/components/blog/clips/draw`):
  - `type Tone = "ink" | "navy" | "fog" | "line" | "muted" | "accent" | "none"`; `toneColors(t: Tone): { fill: string; stroke: string }` (`ink` = white fill / ink stroke; `none` = `"none"` for both; the rest map to their `C` colour).
  - `type Weight = "thin" | "bold"`; `STROKE: Record<Weight, 2 | 3>`; `type Radius = 6 | 10 | 14`.
  - `type LabelTone = "ink" | "navy" | "slate" | "white"`; `labelFill(t: LabelTone): string`; `labelSize(n?: number): number` = `Math.max(34, n ?? 34)`.
  - Atoms: `Box({ x, y, w, h, r?: Radius = 10, at?, dur?, fill?: Tone = "ink", stroke?: Tone = "none", weight?: Weight = "thin", grow?: boolean, opacity?: number })`, `Path({ d, at?, dur?, stroke?: Tone = "ink", weight?, dashed?: boolean })`, `Dot({ x, y, r?: number = 10, at?, fill?: Tone = "accent" })`, `Label({ x, y, children, at?, size?, mono?: boolean, tone?: LabelTone = "ink", anchor?: "start" | "middle" | "end", weight?: 600 | 700 | 800 })`, `Group({ x?, y?, scale?, opacity?, children })`.
  - Motion: `useAppear(at: number, dur?: number): number`, `Fade({ from, to?: number = 0.2, dur?, children })`, `Fold({ from, originY, dur?, children })`, `MoveAlong({ points: Point[], from: number, to: number, children })` (children translated to the point at eased progress along the polyline through `points`, interpolated by length), `Pulse({ at, x, y, children })` (one scale 1→1.06→1 about `(x, y)` over `sec(0.6)`), `useClipFrame(): number` (a one-line wrapper over Remotion's `useCurrentFrame`, so clips never import `remotion`; untested).
- Consumes: `C`, `FONT_SANS`, `FONT_MONO` from `../palette`; `progress`, `sec`, `type Point` from `../timing`.

- [ ] **Step 1: Write the failing tests** in `tokens.test.ts`: `labelSize(20) === 34`, `labelSize(96) === 96`, `labelSize() === 34`; `toneColors("accent").fill === C.tangerine`; `toneColors("ink")` is `{ fill: C.white, stroke: C.ink }`; `toneColors("none")` is `{ fill: "none", stroke: "none" }`; every `LabelTone` maps to a colour that is not `C.tangerine`; `STROKE` equals `{ thin: 2, bold: 3 }`.
- [ ] **Step 2: Run** `npx vitest run app/components/blog/clips/draw` → FAIL (module not found).
- [ ] **Step 3: Implement `tokens.ts`**, then `atoms.tsx` and `motion.tsx` by porting the spike's `draw/index.tsx` to the interfaces above (`Label` uses `labelSize`, `labelFill`; `Path` draws on with `pathLength={1}` and dash offset; `dashed` uses `strokeDasharray="0.02 0.015"`, fading in instead). Header comment in `index.tsx` like `primitives/index.tsx`: what the layer is for, that props accept brand tokens only, the 34px floor, text widths (≈20px/char Manrope 700 at 34px, ≈21px/char DM Mono), keep ~40px clear of every edge.
- [ ] **Step 4: Run** `npx vitest run app/components/blog/clips/draw && npx tsc --noEmit -p .` → PASS, no type errors.
- [ ] **Step 5: Commit** `feat(clips): brand drawing layer`.

### Task 2: Brand source check

**Files:**
- Create: `src/lib/blog/clip-source.ts`, `src/lib/blog/clip-source.test.ts`
- Modify: `src/lib/blog/entries.ts` (add optional `clipSources`), `src/lib/blog/validate.ts` (call the check), `src/lib/blog/validate.test.ts`, `src/lib/blog/entries.test.ts`

**Interfaces:**
- Produces: `checkClipSource(where: string, source: string): string[]` (each error prefixed with `where`, e.g. `app/blog/x/clips/clip-1.tsx`); `PostEntry.clipSources?: Record<string, string>` (clip basename → file text, filled by `readPostEntries` for every `clipFiles` entry); `validatePosts` appends `checkClipSource` errors for every clip in `clipSources`.

Rules (strip `//` and `/* */` comments first, so comments may mention anything):
1. Every `import … from "<m>"` must have `m` in: `react`, `@/app/components/blog/clips/clip-def`, `@/app/components/blog/clips/primitives`, `@/app/components/blog/clips/draw`, `@/app/components/blog/clips/timing`. Message: `import "<m>" not allowed; use clip-def, primitives, draw or timing`.
2. No colour literal anywhere: `/#[0-9a-fA-F]{3,8}\b/`, `/\b(rgb|rgba|hsl|hsla)\(/`. Message: `colour literal "<match>": use a tone from draw (fill/stroke) or a primitive's tone`.
3. No raw SVG elements: `/<(rect|path|text|tspan|circle|ellipse|line|polyline|polygon|image|foreignObject|defs|filter|svg)\b/`. Message: `raw <tag> not allowed: use Box, Path, Dot or Label from draw`.
4. `<g` is allowed only with attributes from `key`, `transform`, `opacity`. Message: `<g> may only set key, transform or opacity: use Group`.
5. No `style=`. Message: `style= not allowed: sizes and colours come from draw tokens`.

- [ ] **Step 1: Write failing tests** in `clip-source.test.ts`: a clip source importing only `clip-def`, `draw` (incl. `useClipFrame`), `timing` and `react` → `[]`; the same source importing `useCurrentFrame` from `remotion` → one error; one test per rule with a minimal source that breaks it, asserting the error contains the quoted message stem; `` fill={`#${x}`} ``-style and `const red = "#f00"` both rejected; `<g key="a" transform="translate(1 2)">` accepted, `<g fill="x">` rejected; a colour inside a `// #fff` comment accepted.
- [ ] **Step 2: Add tests** in `validate.test.ts`: an entry whose `clipSources` has a clip with `style=` yields an error containing `app/blog/<dir>/clips/clip-1.tsx`; an entry without `clipSources` yields no clip-source errors. In `entries.test.ts`: `readPostEntries` on the existing temp-dir fixture fills `clipSources` with each clip's text and ignores non-`clip-<n>.tsx` files.
- [ ] **Step 3: Run** `npx vitest run src/lib/blog` → the new tests FAIL.
- [ ] **Step 4: Implement** `clip-source.ts`, the `entries.ts` field and the `validatePosts` call.
- [ ] **Step 5: Verify** `npx vitest run && npm run lint && npm run blog:check` → tests pass; `blog:check` prints `blog:check ok` on master (existing clips pass; `mezcla-de-expertos/clip-2.tsx:113` uses a bare `<g key>`).
- [ ] **Step 6: Commit** `feat(blog): brand source check for clips`.

### Task 3: Agent rules and docs

**Files:**
- Modify: `newsletter/agent/ESTILO.md` §4 (and the §7 commands table if needed), `newsletter/agent/borradores.md` steps 3 and 5 and the PR template, `newsletter/agent/revision.md` (step that reruns snaps), `CLAUDE.md` (clip engine paragraph + `blog:check` description)

- [ ] **Step 1: Rewrite `ESTILO.md` §4** (Spanish), replacing the "Solo primitivas" and "Estilo" bullets with:
  - **Parte del paper.** Antes de dibujar, identifica el objeto que estudia el paper (una traza de razonamiento, una llamada a herramienta, un episodio, una pila de capas, una cuadrícula de tokens) o su figura clave, y construye cada clip a partir de eso. Cajas y flechas solo cuando el mecanismo de verdad es un grafo de componentes. Cada clip empieza con `// Construido a partir de: <objeto o figura del paper>`.
  - **No repitas.** Antes de dibujar, corre `npm run blog:snap -- <slug>` de los posts publicados de las dos últimas ediciones y mira sus últimos frames; tampoco repitas dentro de la edición. No reutilices un mismo esquema de layout y movimiento.
  - **Piezas permitidas:** las primitivas y `@/app/components/blog/clips/draw` (`Box`, `Path`, `Dot`, `Label`, `Group`, `useAppear`, `Fade`, `Fold`, `MoveAlong`, `Pulse`, `useClipFrame`). Nada de `remotion` directo, colores literales, SVG crudo ni `style=`: `npm run blog:check` lo rechaza.
  - **Valores ilustrativos** (curvas, cifras o ejemplos que no salen del paper) se declaran en el texto del post y en las notas del PR.
  - Referencias: `app/blog/mezcla-de-expertos/clips/clip-1.tsx` (diagrama clásico) y `app/blog/cuando-dejar-de-pensar/clips/clip-1.tsx` (dibujado desde el paper; existe tras la edición 0001).
  Keep every other §4 rule (durations, 34px, tangerine, captions, last frame, `T`, layout constants).
- [ ] **Step 2: `borradores.md`:** step 3 points to the new §4; step 5's snap checklist adds "¿se parece a un clip anterior?"; the PR template's `- Clips:` line becomes `- Clips: \`clip-1\` construido a partir de <…>: <qué muestra>; …`. **`revision.md`:** a request to redraw clips follows the same §4.
- [ ] **Step 3: `CLAUDE.md`:** the clip engine bullet mentions `draw/` (brand tokens only) and that `blog:check` also runs the clip source check (allowed imports, no colour literals, raw SVG or `style=`).
- [ ] **Step 4: Verify** `npm run lint && npm run blog:check` still pass; `grep -n "Solo primitivas" newsletter/agent/ESTILO.md` prints nothing.
- [ ] **Step 5: Commit** `docs(newsletter): agent draws clips from the paper`.

### Task 4: Merge the engine to master

- [ ] **Step 1:** Push the branch as gomez2608 (one-off credential helper) and open a PR to `master` with the spec + plan + Tasks 1–3.
- [ ] **Step 2:** Wait for `blog-pr-checks` and `opinion-guard` green (`gh pr checks <n>`).
- [ ] **Step 3:** Ask Sebastián to merge (or merge with `--merge` if he says so); then `git pull` on master.

### Task 5: LoCo clip 1 from the spike (on `edicion-0001`)

**Files:**
- Modify: `app/blog/cuando-dejar-de-pensar/clips/clip-1.tsx` (replace), `app/blog/cuando-dejar-de-pensar/page.mdx` (only if the text around clip 1 needs to declare the illustrative confidence values), `src/lib/blog/clip-registry.generated.ts` (regenerated)

- [ ] **Step 1:** `git checkout edicion-0001 && git pull --ff-only && git merge --no-edit origin/master`.
- [ ] **Step 2:** Replace `clip-1.tsx` with the spike's `clip-3.tsx` ported to the final `draw` API: `id: "clip-1"`, `title: "La idea general"`, first line `// Construido a partir de: la traza de razonamiento (párrafos) y la señal de confianza por paso (paper, secciones 3–4.2, apéndice B)`, no `remotion` import (counter via `useClipFrame` or the `Counter` primitive). Keep the spike's captions, layout and timing.
- [ ] **Step 3:** In `page.mdx`, add one sentence near clip 1 saying the confidence curve in the clip is illustrative (not the paper's data), in the post's voice.
- [ ] **Step 4: Verify** `npm run blog:registry && npm test && npm run lint && npm run blog:check` → only the three "falta tu opinión" lines fail; `npm run dev` + `npm run blog:snap -- cuando-dejar-de-pensar` and inspect every `clip-1-*.png` (edges ≥40px, no overlap, frame 0 not empty, last frame sums up).
- [ ] **Step 5: Commit** `edición 0001: clip 1 de LoCo dibujado desde el paper` and push `edicion-0001`.

### Task 6: Agent redraws the other five clips

- [ ] **Step 1:** Ask Sebastián to comment on PR #8 (as himself) asking for the redraw, e.g. "Rehaz los clips siguiendo la nueva sección 4 de ESTILO: cuando-dejar-de-pensar clip-2, agentes-contra-instrucciones-ocultas clip-1 y clip-2, mal-jugador-buen-entrenador clip-1 y clip-2. No toques clip-1 de cuando-dejar-de-pensar." and add `revisar`.
- [ ] **Step 2:** If Revisión doesn't start within 2 minutes (GitHub triggers have not fired so far), run it manually: `RemoteTrigger run trig_01Ff2RFMmkoSdPETrHkHsfo6` with body `{"text": "Ejecución manual: el PR que dispara la tarea es el #8 (etiqueta revisar)."}`.
- [ ] **Step 3:** When the agent posts `🤖 Revisión aplicada`, review the diff: only those five clip files (+ text where needed, registry), each with the `// Construido a partir de:` line, no clip repeating another's layout; `blog-pr-checks` fails only on the three missing opinions; `opinion-guard` green. Snap the three posts locally and look at the last frames side by side.
- [ ] **Step 4:** Report to Sebastián with the preview link; he writes the three `/opinion`s, checks each `opinion: <slug>` commit, and merges.
