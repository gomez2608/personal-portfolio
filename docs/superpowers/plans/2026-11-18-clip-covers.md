# Clip covers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Share/newsletter cards show clip 1's last frame; the text fallback uses the brand fonts.

**Spec:** `docs/superpowers/specs/2026-11-18-clip-covers-design.md`

## Global Constraints
- Card 1200×630, Paper `#f7f5f0`; tangerine only as the dot; Manrope 800 for the title, DM Mono for meta.
- Cover file: `public/blog/<slug>/cover.png`, the 1280×720 stage only (no caption bar).
- Don't touch `.github/`, `scripts/blog/`, `src/lib/blog/opinion*`.

## Review Focus
- A post without a cover still gets a card (fallback), never a build error in the OG route.
- Accented Spanish titles render in Manrope (no tofu): á é í ó ú ñ ¿ ¡.
- A title over 2 lines is clamped, not overflowing the card.
- `blog:cover` on a slug without `clip-1` fails with a clear message.

### Task 1: Cover existence in entries + blog:check
- Modify `src/lib/blog/entries.ts`: `readPostEntries(root = "app/blog", coversRoot = "public/blog")`; `PostEntry.hasCover?: boolean` = `fs.existsSync(path.join(coversRoot, dir, "cover.png"))`.
- Modify `src/lib/blog/validate.ts`: published post with `hasCover === false` → `${slug}: falta la portada. Corre npm run blog:cover -- ${slug} (con npm run dev) y commitea public/blog/${slug}/cover.png.`
- Tests: entries test (temp dir with/without cover → true/false); validate tests (published + `hasCover:false` → error; `hasCover` undefined → no error; draft + false → no error).
- Commit `feat(blog): require a cover for published posts`.

### Task 2: `blog:cover` script
- Create `scripts/covers/cover.ts` (mirrors `scripts/blog/snap.ts`: `--base`, `resolveChromePath` from `../blog/chrome-path`, dev indicator hidden), screenshots `[data-stage]` at frame `duration - 1` of `clip-1`, writes `public/blog/<slug>/cover.png`; errors: no slug, no post, no `clip-1`, server unreachable.
- `package.json`: `"blog:cover": "tsx scripts/covers/cover.ts"`.
- Verify by generating covers for the four posts and reading them. Commit covers + script.

### Task 3: OG card with cover and brand fonts
- Add deps `@fontsource/manrope`, `@fontsource/dm-mono`; load `files/manrope-latin-800-normal.woff`, `files/dm-mono-latin-400-normal.woff` with `fs.readFile` in the route.
- `app/blog/og/[slug]/route.tsx`: if `public/blog/<slug>/cover.png` exists → cover layout (header, image as data URL 768×432, title clamped to 2 lines); else the text layout with the same fonts.
- Verify: `npm run build`, then fetch `/blog/og/<slug>` from `npm run start` for a post with a cover and a temp draft-free check of the fallback (rename a cover temporarily in dev), read both PNGs.
- Commit.

### Task 4: Agent + docs
- `borradores.md` step 5: after snaps, `npm run blog:cover -- <slug>` per post, open the PNG; step 6 `git add` includes `public/blog/<slug>/cover.png`. `revision.md`: re-run when `clip-1` changed. `ESTILO.md` §6 allowed paths include `public/blog/<slug>/cover.png`. `CLAUDE.md`: commands + OG card line.
- Commit; PR; checks green; ask Sebastián to merge.
