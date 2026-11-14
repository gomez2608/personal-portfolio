# Blog + Explainer Clips Implementation Plan (Plan 1 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Spanish `/blog` on the portfolio where each post is an MDX file with self-playing animated diagram clips built from a small brand primitive library, plus the tooling (validator, clip registry, frame snapshots) the agent pipeline in Plan 3 will rely on.

**Architecture:** Each post is a route folder `app/blog/<slug>/` holding `page.mdx`, `post.json` (validated metadata) and `clips/*.tsx`. MDX is compiled by `@next/mdx`. A post's `page.mdx` default-exports a `PostShell` layout that renders header, source and draft gating. Clips are Remotion compositions played in-page by `@remotion/player`. They autoplay muted when in view and are built from shared primitives on a fixed Paper stage, with captions in an HTML caption bar under the stage (burned in only for snapshots). A generated clip registry feeds a dev-only preview route that a Playwright script screenshots at fixed moments.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind v4, `@next/mdx`, `remotion` + `@remotion/player` (4.x, identical pinned versions), zod 4, Vitest, Playwright, tsx.

**Spec:** `docs/superpowers/specs/2026-11-13-ai-newsletter-blog-design.md` (§4.1–4.3, §6.2 "Clips", §6.3). Plans 2 (newsletter signup/consent/sending) and 3 (agent pipeline + CI) follow and build on the file layout fixed here.

## Global Constraints

- Blog content and UI are **Spanish only**. Everything under `/blog` renders inside `lang="es"`, regardless of the site's EN/ES toggle.
- Brand: Paper `#f7f5f0`, ink `#0f1220`, navy `#1b2238`, slate `#43465a`, line `#e4e0d6`, fog `#ece8df`, tangerine `#f07a2e`. Fonts are Manrope (`font-sans`) and DM Mono (`font-mono`). **Tangerine is signal only: never text on Paper/Fog.** Use `muted-text`, never `muted`, for text.
- Clips: 16:9, `1280×720` composition, `30` fps, 10–20 s each. They always sit on a fixed Paper stage in both light and dark mode, autoplay **muted, looping, only while in view**, and have Spanish captions (at most 70 characters each) shown as an HTML caption bar under the stage, burned into the frame only for snapshots (ruling R8), plus a play/pause control and a progress bar.
- `prefers-reduced-motion: reduce` → clips do not autoplay; they show the final frame with a play button.
- `/blog` is indexable. Draft posts are visible in dev and Vercel previews but **404 in production** and are excluded from the index and the sitemap.
- Never name the employer's clients or confidential work in any content.
- Work on branch `feat/newsletter-blog`. Never commit `.env.local` or `design_handoff_portfolio_*`. Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Reduced-motion visitor:** no clip moves until they press play. Each clip shows its final frame. → `playbackPolicy` test, Task 5.
2. **A post with 3 clips, scrolled fast:** only clips in view play, and a clip scrolled out of view pauses. → `playbackPolicy` test, Task 5.
3. **Draft post in production:** `/blog/<slug>` returns 404 and the post appears in neither `/blog` nor `sitemap.xml`. → `isPostVisible` test, Task 4.
4. **Visitor who selected English on the homepage, then opens `/blog`:** `<html lang>` becomes `es` and the "Este blog está en español" note shows. → `documentLang` test, Task 3.
5. **Phone at 375 px:** the clip scales to the column width with readable captions and no horizontal page scroll, and long Spanish titles wrap. A caption longer than 70 characters is rejected. → `validateClipDef` test, Task 5. 375 px screenshot check, Task 7.

---

## File Structure

```
app/blog/layout.tsx                      blog shell: lang="es" wrapper, BlogTopBar, language note
app/blog/page.tsx                        index (published posts, newest first)
app/blog/og/[slug]/route.tsx             branded 1200×630 card per post (OG + index thumbnail)
app/blog/clip-preview/[slug]/[clip]/page.tsx   dev/preview-only single clip frame (404 in production)
app/blog/<slug>/{page.mdx,post.json,clips/*.tsx}   one folder per post
mdx-components.tsx                       MDX element styling + MiOpinion/Profundizar/Destacado
app/components/blog/post-shell.tsx       header, meta, source box, draft gating
app/components/blog/blog-top-bar.tsx     logo → home, "Blog", theme toggle
app/components/blog/lang-note.tsx        "Este blog está en español" (client)
app/components/blog/mdx/*.tsx            MiOpinion, Profundizar, Destacado
app/components/blog/clips/               clip engine
  timing.ts          pure helpers (tested)
  clip-def.ts        ClipDef types, defineClip, validateClipDef (tested)
  playback.ts        playbackPolicy (tested)
  clip-frame.tsx     Stage + scene + captions composition
  clip-player.tsx    client player with in-view autoplay, controls, reduced motion
  primitives/*.tsx   Node, Connector, FlowDot, Highlight, Dim, Counter, Title, Text
src/lib/blog/
  schema.ts          zod PostMeta schema + reserved slugs (tested)
  format.ts          formatDateEs (tested)
  visibility.ts      isPostVisible, deploymentEnv (tested)
  posts.ts           listPosts / getPost (fs, server-only)
  validate.ts        validatePosts (pure, tested)
  registry.ts        renderRegistrySource (pure, tested)
  clip-registry.generated.ts   generated, committed
src/lib/lang.ts      documentLang (tested)
scripts/blog/{check.ts,registry.ts,snap.ts}
vitest.config.ts
```

---

### Task 1: Test tooling and post metadata schema

**Files:**
- Create: `vitest.config.ts`, `src/lib/blog/schema.ts`, `src/lib/blog/format.ts`, `src/lib/blog/schema.test.ts`, `src/lib/blog/format.test.ts`
- Modify: `package.json` (scripts + devDeps), `.gitignore` (add `.blog-snaps/`)

**Interfaces:**
- Produces:
  - `PostMetaSchema` (zod) and `type PostMeta = z.infer<typeof PostMetaSchema>` with fields `slug: string`, `title: string` (1–90), `hook: string` (1–200), `date: string` (`YYYY-MM-DD`), `issue: number` (int ≥ 1), `status: "draft" | "published"`, `paper: { title: string; url: string (URL); authors: string[] (≥1); published: string (YYYY-MM-DD) }`.
  - `RESERVED_SLUGS = ["og", "clip-preview"] as const`. The slug regex is `^[a-z0-9]+(?:-[a-z0-9]+)*$` and must not be reserved.
  - `formatDateEs(isoDate: string): string` → e.g. `"13 de noviembre de 2026"` (Intl `es-CO`, UTC, no weekday).

- [ ] **Step 1: Install tooling.** `npm i -D vitest vite-tsconfig-paths tsx`. Add scripts `"test": "vitest run"`, `"test:watch": "vitest"`. Create `vitest.config.ts` using the `vite-tsconfig-paths` plugin (so `@/*` resolves to `src/` then the root, as in `tsconfig.json`), `environment: "node"`, `include: ["src/**/*.test.ts", "app/**/*.test.ts"]`.

- [ ] **Step 2: Write failing tests**

```ts
// src/lib/blog/schema.test.ts
const valid = { slug: "mezcla-de-expertos", title: "Mezcla de expertos", hook: "Por qué los modelos gigantes no usan todo su cerebro.",
  date: "2026-11-13", issue: 1, status: "draft",
  paper: { title: "Outrageously Large Neural Networks", url: "https://arxiv.org/abs/1701.06538", authors: ["Noam Shazeer"], published: "2017-01-23" } };
test("accepts a valid post", () => expect(PostMetaSchema.parse(valid)).toEqual(valid));
test.each(["Mezcla", "mezcla_de", "-mezcla", "og", "clip-preview"])("rejects slug %s", (slug) =>
  expect(PostMetaSchema.safeParse({ ...valid, slug }).success).toBe(false));
test("rejects title over 90 chars", () => expect(PostMetaSchema.safeParse({ ...valid, title: "x".repeat(91) }).success).toBe(false));
test("rejects bad date", () => expect(PostMetaSchema.safeParse({ ...valid, date: "13/11/2026" }).success).toBe(false));
test("rejects missing authors", () => expect(PostMetaSchema.safeParse({ ...valid, paper: { ...valid.paper, authors: [] } }).success).toBe(false));
test("rejects non-URL paper link", () => expect(PostMetaSchema.safeParse({ ...valid, paper: { ...valid.paper, url: "arxiv 1701.06538" } }).success).toBe(false));

// src/lib/blog/format.test.ts
test("formats Spanish long date", () => expect(formatDateEs("2026-11-13")).toBe("13 de noviembre de 2026"));
test("does not shift day across time zones", () => expect(formatDateEs("2026-01-01")).toBe("1 de enero de 2026"));
```

- [ ] **Step 3: Run** `npm test` → FAIL (modules not found).
- [ ] **Step 4: Implement** `schema.ts` (zod 4, `.strict()` objects) and `format.ts`.
- [ ] **Step 5: Run** `npm test` → PASS.
- [ ] **Step 6: Commit** `feat(blog): post metadata schema and test tooling`.

---

### Task 2: Post loading, validator and clip registry generator

**Files:**
- Create: `src/lib/blog/posts.ts`, `src/lib/blog/validate.ts`, `src/lib/blog/validate.test.ts`, `src/lib/blog/registry.ts`, `src/lib/blog/registry.test.ts`, `scripts/blog/check.ts`, `scripts/blog/registry.ts`, `src/lib/blog/clip-registry.generated.ts`
- Modify: `package.json` scripts

**Interfaces:**
- Consumes: `PostMetaSchema`, `PostMeta`, `RESERVED_SLUGS` (Task 1).
- Produces:
  - `type PostEntry = { dir: string; meta: unknown; mdx: string | null; clipFiles: string[] }`. That's raw on-disk data for one `app/blog/<dir>/`; `clipFiles` are basenames without extension, sorted.
  - `readPostEntries(root = "app/blog"): PostEntry[]`, which skips `RESERVED_SLUGS`, files, and folders without `post.json` or `page.mdx` (the second still yields an entry with `mdx: null` if `post.json` exists).
  - `listPosts(): PostMeta[]` (all valid posts, newest `date` first, ties by `issue` desc) and `getPost(slug): PostMeta | null`, server-only (`import "server-only"`).
  - `validatePosts(entries: PostEntry[], today: string): string[]` returns human-readable Spanish-or-English error strings; empty = OK.
  - `renderRegistrySource(entries: PostEntry[]): string` → TS source for `clip-registry.generated.ts`:
    `export const clipRegistry: Record<string, Record<string, () => Promise<{ default: ClipComponent }>>>` mapping `slug → clipId → () => import("@/app/blog/<slug>/clips/<clipId>")`, keys sorted, with a header comment `// Generated by npm run blog:registry — do not edit.`
  - Scripts: `"blog:registry": "tsx scripts/blog/registry.ts"` (writes the file), `"blog:check": "tsx scripts/blog/check.ts"` (exits 1 and prints errors when `validatePosts` returns any, or when the committed registry differs from `renderRegistrySource`). Add `"predev"` and `"prebuild"` running `blog:registry`.

- [ ] **Step 1: Write failing tests**

```ts
// validate.test.ts — `entry(overrides)` builds a valid published entry for slug "a" with mdx "<MiOpinion>Texto</MiOpinion>"
test("valid entry passes", () => expect(validatePosts([entry()], "2026-11-13")).toEqual([]));
test("folder name must equal slug", () => expect(validatePosts([entry({ dir: "b" })], T)).toContainEqual(expect.stringContaining("b")));
test("invalid post.json is reported with the zod path", () => expect(validatePosts([entry({ meta: { ...meta, title: "" } })], T)[0]).toMatch(/title/));
test("missing page.mdx is reported", () => expect(validatePosts([entry({ mdx: null })], T)).toHaveLength(1));
test("published post with pending opinion fails", () =>
  expect(validatePosts([entry({ mdx: "<MiOpinion pending />" })], T)).toContainEqual(expect.stringMatching(/opini/i)));
test("draft post with pending opinion passes", () =>
  expect(validatePosts([entry({ mdx: "<MiOpinion pending />", meta: { ...meta, status: "draft" } })], T)).toEqual([]));
test("published post dated in the future fails", () => expect(validatePosts([entry({ meta: { ...meta, date: "2026-12-01" } })], "2026-11-13")).toHaveLength(1));
test("duplicate slugs are rejected", () => expect(validatePosts([entry(), entry()], T).length).toBeGreaterThan(0));

// registry.test.ts
test("renders sorted lazy imports per slug", () => {
  const src = renderRegistrySource([entry({ dir: "b", clipFiles: ["clip-2", "clip-1"] }), entry({ dir: "a", clipFiles: [] })]);
  expect(src).toContain('"b": {\n    "clip-1": () => import("@/app/blog/b/clips/clip-1"),\n    "clip-2"');
  expect(src.indexOf('"a"')).toBeLessThan(src.indexOf('"b"'));
  expect(src.startsWith("// Generated by npm run blog:registry")).toBe(true);
});
```

- [ ] **Step 2: Run** `npm test` → FAIL.
- [ ] **Step 3: Implement** `validate.ts` and `registry.ts` (pure), then `posts.ts` (`node:fs`) and the two scripts. The "pending opinion" check is the regex `/<MiOpinion\s+pending\b/`. The type import for `ClipComponent` in the generated file points at `@/app/components/blog/clips/clip-def` (created in Task 5). Until then, generate the file for zero posts (`export const clipRegistry = {}` with a local type) so the build stays green.
- [ ] **Step 4: Run** `npm test` → PASS. Run `npm run blog:registry && npm run blog:check` → exits 0.
- [ ] **Step 5: Commit** `feat(blog): post loader, validator and clip registry generator`.

---

### Task 3: Spanish blog shell

**Files:**
- Create: `src/lib/lang.ts`, `src/lib/lang.test.ts`, `app/blog/layout.tsx`, `app/components/blog/blog-top-bar.tsx`, `app/components/blog/lang-note.tsx`
- Modify: `app/components/providers/lang-provider.tsx` (the `document.documentElement.lang` effect), `next.config.ts` (nothing for headers; `/blog` stays indexable)

**Interfaces:**
- Produces: `documentLang(pathname: string, lang: "en" | "es"): "en" | "es"` returns `"es"` for `/blog`, `/blog/...`, `/mentoria/...`, `/privacidad`, otherwise `lang`.

- [ ] **Step 1: Failing test**

```ts
test.each([["/blog", "en", "es"], ["/blog/mezcla-de-expertos", "en", "es"], ["/mentoria/ana", "en", "es"], ["/privacidad", "en", "es"],
  ["/", "en", "en"], ["/", "es", "es"], ["/blogger", "en", "en"]])("documentLang(%s, %s) = %s", (p, l, want) => expect(documentLang(p, l as "en")).toBe(want));
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** `documentLang`, and use it in `LangProvider`'s effect with `usePathname()` (dependency on pathname too).
- [ ] **Step 4: Build the shell.** `app/blog/layout.tsx` wraps children in `<div lang="es" className="min-h-svh bg-bg text-ink">` with `<BlogTopBar />` and `<LangNote />`, mirroring `app/mentoria/[slug]/layout.tsx`. Set `metadata` with `title: { default: "Blog", template: "%s | Blog de Sebastián Gómez" }` and `openGraph.locale: "es_CO"`. `BlogTopBar` mirrors `MentoriaTopBar` (logo → `/`), adds a `Blog` link to `/blog`, and reuses the theme toggle. Move `ThemeToggle` from `mentoria-shell.tsx` into `app/components/shared/theme-toggle.tsx` and import it in both. `LangNote` (client) renders only when `useLang().lang === "en"`: a slim `bg-fog` bar with the text **"Este blog está en español."**
- [ ] **Step 5: Run** `npm test` → PASS. `npm run build` → succeeds.
- [ ] **Step 6: Commit** `feat(blog): Spanish blog shell and document language per route`.

---

### Task 4: MDX posts, index, OG card, sitemap, draft gating

**Files:**
- Create: `mdx-components.tsx`, `app/components/blog/post-shell.tsx`, `app/components/blog/mdx/mi-opinion.tsx`, `app/components/blog/mdx/profundizar.tsx`, `app/components/blog/mdx/destacado.tsx`, `src/lib/blog/visibility.ts`, `src/lib/blog/visibility.test.ts`, `app/blog/page.tsx`, `app/blog/og/[slug]/route.tsx`
- Modify: `next.config.ts` (wrap with `createMDX()`, `pageExtensions: ["ts","tsx","mdx"]`), `app/sitemap.ts`, `package.json` (`@next/mdx @mdx-js/loader @mdx-js/react @types/mdx`)

**Interfaces:**
- Consumes: `PostMeta`, `listPosts`, `getPost`, `formatDateEs`.
- Produces:
  - `deploymentEnv(): "production" | "preview" | "development"` from `VERCEL_ENV`, falling back to `NODE_ENV`.
  - `isPostVisible(post: Pick<PostMeta,"status">, env: ReturnType<typeof deploymentEnv>): boolean`, which is false only for a draft in production.
  - `<PostShell post={unknown}>{children}</PostShell>` (server). It takes the raw JSON import and parses it with `PostMetaSchema` (throwing on invalid data, so a broken `post.json` fails the build). `postMetadata(post: unknown)` parses the same way. It calls `notFound()` when not visible and renders: a draft banner "Borrador: no visible en producción" when `status === "draft"`; `h1` title; hook; meta line `formatDateEs(date) · Edición {issue}`; children; a "Fuente" box with the paper title (link, `rel="noopener"`, new tab), authors (first 3 + "et al."), and the paper's publication year.
  - Every post's `page.mdx` follows this exact shape (Plan 3's agent writes it):
    ```mdx
    import post from "./post.json";
    import { PostShell, postMetadata } from "@/app/components/blog/post-shell";
    export const metadata = postMetadata(post);
    export default function Layout({ children }) { return <PostShell post={post}>{children}</PostShell>; }
    ```
  - `postMetadata(post: unknown): Metadata` → title, description = hook, `openGraph` (type article, locale es_CO, image `/blog/og/<slug>`), `robots` noindex when draft.
  - MDX components (registered globally in `mdx-components.tsx`): `<MiOpinion pending? >children</MiOpinion>` (renders a titled "Mi opinión" block; with `pending` it renders a visible placeholder "Pendiente: opinión de Sebastián" in dev/preview and nothing in production), `<Profundizar title?>children</Profundizar>` (a native `<details>` with summary "Profundizar", closed by default), `<Destacado>children</Destacado>` (callout for the plain-language metaphor). Element styles for `h2, h3, p, a, ul, ol, li, strong, code, blockquote` use the theme tokens, with a reading column max-width of about 68ch.
  - `/blog/og/[slug]` uses `ImageResponse` (1200×630, Paper background, ink title, tangerine dot accent, "sebastiangomezahumada.com/blog" in DM Mono-like styling), and returns 404 for unknown or non-visible slugs.

- [ ] **Step 1: Failing test**

```ts
test("draft hidden in production only", () => {
  expect(isPostVisible({ status: "draft" }, "production")).toBe(false);
  expect(isPostVisible({ status: "draft" }, "preview")).toBe(true);
  expect(isPostVisible({ status: "draft" }, "development")).toBe(true);
  expect(isPostVisible({ status: "published" }, "production")).toBe(true);
});
test("deploymentEnv prefers VERCEL_ENV", () => { vi.stubEnv("VERCEL_ENV", "preview"); expect(deploymentEnv()).toBe("preview"); vi.unstubAllEnvs(); });
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** `visibility.ts` → PASS.
- [ ] **Step 4: MDX + shell + components.** Install packages, configure `next.config.ts`, and create `mdx-components.tsx` and the shell/components above. Keep the existing `redirects`/`headers` intact.
- [ ] **Step 5: Index page** `app/blog/page.tsx` (static). It renders `h1` "Blog" and an intro line **"Investigación reciente en IA, explicada en simple."**, then a list of visible posts: OG card thumbnail (`next/image`, `/blog/og/<slug>`), title, hook, date. Empty state: **"Pronto: la primera edición está en camino."**
- [ ] **Step 6: Sitemap.** Append visible posts (`${site.url}/blog/${slug}`, `lastModified: date`) plus `/blog`.
- [ ] **Step 7: Throwaway check.** Create `app/blog/prueba/{post.json,page.mdx}` (draft, `<MiOpinion pending />`). Run `npm run dev`. `/blog/prueba` shows the draft banner and placeholder. `VERCEL_ENV=production npm run build && npm start` → `/blog/prueba` 404, and `/blog` shows the empty state. **Delete `app/blog/prueba/`.**
- [ ] **Step 8: Run** `npm test`, `npm run lint`, `npm run build` → all pass.
- [ ] **Step 9: Commit** `feat(blog): MDX posts, index, OG cards, sitemap and draft gating`.

---

### Task 5: Clip engine

**Files:**
- Create: `app/components/blog/clips/{timing.ts,timing.test.ts,clip-def.ts,clip-def.test.ts,playback.ts,playback.test.ts,clip-frame.tsx,clip-player.tsx}`, `app/components/blog/clips/primitives/{node,connector,flow-dot,highlight,dim,counter,title,text,index}.tsx`
- Modify: `package.json` (`remotion`, `@remotion/player`, both pinned to the same exact latest 4.x, no caret), `vitest.config.ts` include `app/**/*.test.ts`

**Interfaces:**
- Produces:
  - `timing.ts`: `FPS = 30`, `WIDTH = 1280`, `HEIGHT = 720`. `sec(s: number): number` (frames, rounded). `progress(frame: number, start: number, end: number, ease?: (t:number)=>number): number` (clamped 0–1, default ease-in-out cubic). `connectorPoint(from: [number,number], to: [number,number], curve: number, t: number): [number,number]` (point on the cubic Bézier `connectorPath` uses; `curve` 0 = straight, positive bends toward −y). `connectorPath(from, to, curve): string` (SVG `d`). `activeCaption(captions: Caption[], frame: number): Caption | null`. `formatNumberEs(n: number): string` (`es-CO`, e.g. `1.000.000`).
  - `clip-def.ts`: `type Caption = { from: number; to: number; text: string }` (frames, `to` exclusive). `type ClipDef = { id: string; title: string; durationInFrames: number; captions: Caption[]; Scene: React.FC }`. `validateClipDef(def: ClipDef): string[]`. `defineClip(def: ClipDef): ClipComponent`, where `type ClipComponent = React.FC & { def: ClipDef }`. The component renders `<ClipPlayer def={def} />`. In development, `defineClip` throws if `validateClipDef` returns errors.
  - Validation rules: duration between `sec(8)` and `sec(25)`; captions sorted, non-overlapping, within duration, each `text` 1–70 chars, first caption starts at 0; `id` matches `^clip-\d+$`; `title` non-empty (used as the player's accessible label).
  - `playback.ts`: `playbackPolicy(s: { reducedMotion: boolean; inView: boolean; userPaused: boolean; userStarted: boolean }): { autoplay: boolean; showFinalFrame: boolean }`. `autoplay = inView && !userPaused && (!reducedMotion || userStarted)`; `showFinalFrame = reducedMotion && !userStarted`. `userStarted` becomes true the first time the visitor presses play; `userPaused` is true while they have paused it themselves.
  - `<ClipFrame def>` (Remotion composition component): Paper stage `#f7f5f0` full-bleed, renders `def.Scene`, then a caption band at the bottom (Manrope 30px, ink on a translucent Paper pill, centered, max 2 lines) from `activeCaption`.
  - `<ClipPlayer def>` (`"use client"`): `@remotion/player` `Player` at `compositionWidth/Height = 1280/720`, `fps = 30`, `loop`, no built-in controls, `style={{ width: "100%" }}`, wrapped in a rounded container with a 1px `line` border. It has custom controls: a play/pause button (`aria-label` "Reproducir"/"Pausar") and a 3px progress bar (tangerine fill on fog track). An `IntersectionObserver` (threshold 0.5) plays and pauses per `playbackPolicy`, and `matchMedia("(prefers-reduced-motion: reduce)")` drives `reducedMotion`. The container has `role="group"` and `aria-label={def.title}`.
  - Primitives (all coordinates in the 1280×720 space, all timings in frames; each reads `useCurrentFrame()`):
    - `Node({ x, y, w=180, h=72, label, sub?, appearAt=0, tone="ink" })`: rounded box (tones `"ink"` = white fill + ink border, `"navy"` = navy fill + white text, `"accent"` = navy fill + tangerine border, `"muted"` = fog fill + slate text). It springs in (scale 0.7→1, opacity) over `sec(0.5)` from `appearAt`; `x, y` is the center.
    - `Connector({ from, to, curve=0, drawFrom, drawTo, tone="ink" | "accent" | "muted", width=2 })`: the path draws on between `drawFrom` and `drawTo` via dash offset.
    - `FlowDot({ from, to, curve=0, start, end, tone="accent" })`: moves along `connectorPoint`; hidden outside `[start, end]`.
    - `Highlight({ from, children })`: from frame `from` it eases a tangerine 3px ring/glow onto its children (wraps in a `<g>`/`<div>` filter).
    - `Dim({ from, amount=0.3, children })`: fades children's opacity to `amount`.
    - `Counter({ x, y, from, to, start, end, size=96, suffix?, tone="ink" | "accent" })`: an eased count with `formatNumberEs`, Manrope 800. Note: tangerine is allowed inside clips only for numbers or shapes at ≥ 48px.
    - `Title({ text, appearAt, exitAt?, y=330, size=64 })`: centered Manrope 800, slides up and fades in, and out at `exitAt`.
    - `Text({ x, y, text, appearAt, size=22, mono=false, tone="slate" | "ink", align="left" })`.
  - Primitives render SVG inside one shared `<svg viewBox="0 0 1280 720">` that `ClipFrame` provides through Remotion's `AbsoluteFill`. Scenes are written as `() => <>...primitives...</>`.

- [ ] **Step 1: Failing tests**

```ts
// timing.test.ts
test("sec converts at 30fps", () => expect(sec(1.5)).toBe(45));
test("progress clamps and eases", () => { expect(progress(0, 10, 20)).toBe(0); expect(progress(30, 10, 20)).toBe(1); expect(progress(15, 10, 20)).toBeCloseTo(0.5); });
test("connectorPoint endpoints", () => { expect(connectorPoint([0,0],[100,0],0,0)).toEqual([0,0]); expect(connectorPoint([0,0],[100,0],0,1)).toEqual([100,0]); });
test("curved connector bends toward -y at midpoint", () => expect(connectorPoint([0,100],[200,100],60,0.5)[1]).toBeLessThan(100));
test("activeCaption picks the caption covering the frame", () => {
  const caps = [{ from: 0, to: 30, text: "a" }, { from: 30, to: 60, text: "b" }];
  expect(activeCaption(caps, 29)?.text).toBe("a"); expect(activeCaption(caps, 30)?.text).toBe("b"); expect(activeCaption(caps, 60)).toBeNull();
});
test("Spanish number format", () => expect(formatNumberEs(1000000)).toBe("1.000.000"));

// clip-def.test.ts — `def(overrides)` builds a valid 12s clip with captions [0,180),[180,360)
test("valid def has no errors", () => expect(validateClipDef(def())).toEqual([]));
test("caption over 70 chars rejected", () => expect(validateClipDef(def({ captions: [{ from: 0, to: 360, text: "x".repeat(71) }] }))).toHaveLength(1));
test("overlapping captions rejected", () => expect(validateClipDef(def({ captions: [{ from: 0, to: 200, text: "a" }, { from: 180, to: 360, text: "b" }] })).length).toBeGreaterThan(0));
test("too long clip rejected", () => expect(validateClipDef(def({ durationInFrames: sec(26) })).length).toBeGreaterThan(0));
test("first caption must start at 0", () => expect(validateClipDef(def({ captions: [{ from: 10, to: 360, text: "a" }] })).length).toBeGreaterThan(0));

// playback.test.ts
test.each([
  [{ reducedMotion: false, inView: true,  userPaused: false, userStarted: false }, { autoplay: true,  showFinalFrame: false }],
  [{ reducedMotion: false, inView: false, userPaused: false, userStarted: false }, { autoplay: false, showFinalFrame: false }],
  [{ reducedMotion: false, inView: true,  userPaused: true,  userStarted: true  }, { autoplay: false, showFinalFrame: false }],
  [{ reducedMotion: true,  inView: true,  userPaused: false, userStarted: false }, { autoplay: false, showFinalFrame: true  }],
  [{ reducedMotion: true,  inView: true,  userPaused: false, userStarted: true  }, { autoplay: true,  showFinalFrame: false }],
  [{ reducedMotion: true,  inView: false, userPaused: false, userStarted: true  }, { autoplay: false, showFinalFrame: false }],
])("playbackPolicy(%o)", (input, want) => expect(playbackPolicy(input)).toEqual(want));
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** `timing.ts`, `clip-def.ts`, `playback.ts` → `npm test` PASS.
- [ ] **Step 4: Implement** `ClipFrame`, `ClipPlayer` and the primitives. `ClipPlayer` holds `inView`, `userPaused`, `userStarted` and `reducedMotion` in state, and applies `playbackPolicy` in one effect: play or pause the player ref, and seek to `durationInFrames - 1` when `showFinalFrame`.
- [ ] **Step 5: Run** `npm test`, `npm run lint`, `npm run build` → pass.
- [ ] **Step 6: Commit** `feat(blog): clip engine with brand primitives and in-view playback`.

---

### Task 6: Clip preview route and frame snapshots

**Files:**
- Create: `app/blog/clip-preview/[slug]/[clip]/page.tsx`, `app/blog/clip-preview/[slug]/[clip]/frame-view.tsx` (client), `scripts/blog/snap.ts`
- Modify: `package.json` (`playwright` devDep, script `"blog:snap": "tsx scripts/blog/snap.ts"`), `src/lib/blog/registry.ts` generated type import (now real `ClipComponent`)

**Interfaces:**
- Consumes: `clipRegistry`, `ClipComponent`, `ClipFrame`, `deploymentEnv`.
- Produces:
  - `/blog/clip-preview/<slug>/<clip>?frame=<n>` calls `notFound()` when `deploymentEnv() === "production"` or the slug/clip isn't registered. It renders only the composition at that frame via `@remotion/player`'s `Thumbnail` (1280×720 CSS px, no page chrome; a `data-ready="true"` attribute on the root once fonts have loaded via `document.fonts.ready`). Response header `X-Robots-Tag: noindex` via `next.config.ts` for `/blog/clip-preview/:path*`.
  - `npm run blog:snap -- <slug> [--base http://localhost:3000]` loads every clip of `<slug>` at frames `0, 25%, 50%, 75%, durationInFrames-1` (rounded), waits for `[data-ready="true"]`, and saves `.blog-snaps/<slug>/<clip>-<frame>.png`. It prints the list of files and exits 1 if any page 404s. It requires a running dev server and says so if the base URL is unreachable.

- [ ] **Step 1: Implement** the route, the client frame view and the script. Run `npx playwright install chromium` once (document it in the script's error message if the browser is missing).
- [ ] **Step 2: Verify** with a throwaway post `app/blog/prueba/` containing one trivial clip (`clips/clip-1.tsx` with a `Node` and a `Title`). `npm run blog:registry`, `npm run dev`, then `npm run blog:snap -- prueba` → 5 PNGs. Open one and confirm the stage, node and caption render. `VERCEL_ENV=production npm run build && npm start` → preview URL 404. **Delete `app/blog/prueba/` and regenerate the registry.**
- [ ] **Step 3: Run** `npm test`, `npm run lint`, `npm run build`, `npm run blog:check` → pass.
- [ ] **Step 4: Commit** `feat(blog): dev-only clip preview route and frame snapshot script`.

---

### Task 7: Sample post: "Mezcla de expertos" (draft)

**Files:**
- Create: `app/blog/mezcla-de-expertos/{post.json,page.mdx,clips/clip-1.tsx,clips/clip-2.tsx}`, `src/lib/blog/clip-registry.generated.ts` (regenerated)

**Interfaces:**
- Consumes: everything above. This post is the reference example Plan 3's agent will imitate, so its structure follows spec §4.2 exactly.

- [ ] **Step 1: `post.json`:** `slug "mezcla-de-expertos"`, `issue 1`, `status "draft"`, today's date. `paper`: "Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer", `https://arxiv.org/abs/1701.06538`, authors Noam Shazeer, Azalia Mirhoseini, Krzysztof Maziarz, Andy Davis, Quoc Le, Geoffrey Hinton, Jeff Dean, published `2017-01-23`. Verify the link resolves and the title and authors match before committing.
- [ ] **Step 2: Clips.**
  - `clip-1` "La idea general" (~13 s): the word "París" → router → 8 expert nodes (Gramática, Lugares, Matemáticas, Código, Fechas, Nombres, Tono, Lógica). Two light up (Lugares, Gramática), the rest dim, and a counter ends on "25 %" with the text "del modelo trabaja en cada palabra".
  - `clip-2` "Cómo decide el router" (~15 s): the router scores all 8 experts (bars as `Node` widths or `Text` percentages), the top 2 are selected, their outputs combine into one result node weighted by score.
  - Spanish captions of at most 70 chars, per the Global Constraints.
- [ ] **Step 3: `page.mdx`** in Spanish, in this order: intro with a `<Destacado>` metaphor (hospital front desk sending a patient to 2 of 8 specialists), `<Clip1 />`, a short explanation, `<Clip2 />`, `## Por qué importa`, `<Profundizar>` (gating network, top-k, load balancing, sparse vs. dense, in plain words), `<MiOpinion pending />`. Technical terms stay in English with a Spanish gloss on first use, e.g. "router (enrutador)".
- [ ] **Step 4: Visual check.** `npm run blog:registry`, `npm run dev`, `npm run blog:snap -- mezcla-de-expertos`. Look at every PNG and fix any overlap, clipping, text outside the stage, or tangerine text under 48px. Repeat until clean. Then screenshot `/blog/mezcla-de-expertos` with Playwright at 375×812 and 1280×800 (save to `.blog-snaps/`). Confirm there's no horizontal scroll (`document.documentElement.scrollWidth <= innerWidth`), the clips scale, the captions are legible and the title wraps.
- [ ] **Step 5: Run** `npm test`, `npm run lint`, `npm run build`, `npm run blog:check` → pass. (The draft with a pending opinion is allowed.)
- [ ] **Step 6: Commit** `feat(blog): sample draft post on mixture of experts`.

---

### Task 8: Homepage link, docs, final verification

**Files:**
- Modify: `app/components/header/header.tsx`, `app/data/content.json` (+ `app/data/content.ts` if types are explicit), `CLAUDE.md`

- [ ] **Step 1: Header link.** Add a `Blog` link (`next/link` to `/blog`) after the section nav items, in both the desktop nav and the Menu dropdown (below 1180px), styled like the existing nav items. Label key `blog` in `content.json` for `en` ("Blog") and `es` ("Blog").
- [ ] **Step 2: CLAUDE.md.** Add `app/blog/` to Project layout (post folder shape, `post.json` schema location, clip engine path, primitives, draft gating, `clip-preview` dev route). Add the commands `npm test`, `npm run blog:check`, `npm run blog:registry`, `npm run blog:snap -- <slug>`.
- [ ] **Step 3: Final verification.** Run `npm test`, `npm run lint`, `npm run build`, `npm run blog:check` → all pass. Then `npm run dev` and click through `/` → Blog link → `/blog` (empty state in production mode; the sample appears in dev) → post → clip plays when scrolled in and pauses when scrolled out. Toggle OS reduced motion and confirm the final frame shows with no autoplay. Toggle dark theme and confirm the stage stays Paper. Use the `ui-accessibility-reviewer` agent on the new components and fix anything at WCAG AA.
- [ ] **Step 4: Commit** `feat(blog): link blog from the homepage and document it`.
