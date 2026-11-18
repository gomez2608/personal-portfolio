# Clip covers for share cards and the newsletter — design (short)

**Intent:** the per-post card (`/blog/og/<slug>`, used by the newsletter email and social sharing) shows the post's animation instead of only its title. Approved by Sebastián 2026-11-18.

**Approaches:** (1) still frame — clip 1's last frame (which already sums the idea up alone) as a PNG; (2) animated GIF in the email. He chose **still**: works in every client and on every network, small, no frame-0-is-empty problem.

**Design**
- `npm run blog:cover -- <slug>` (needs `npm run dev`, Chrome like `blog:snap`) screenshots only the stage (`[data-stage]`, no caption bar) of `clip-1` at its last frame from `/blog/clip-preview/<slug>/clip-1?frame=N` into `public/blog/<slug>/cover.png` (1280×720).
- Card (1200×630, Paper): `● Edición N` (DM Mono) at the top, the cover (≈768×432, radius 12, `line` border), the title below (Manrope 800, ≤2 lines). Without a cover: today's text card, now in Manrope/DM Mono. Fonts are bundled (`@fontsource/manrope`, `@fontsource/dm-mono`, woff) so the static card build needs no network.
- `blog:check`: a published post must have `public/blog/<slug>/cover.png`.
- Agent: Borradores step 5 runs `blog:cover` per post and commits the cover; Revisión re-runs it when a post's `clip-1` changes; ESTILO §6 allows committing it.
- Covers made now for the four existing posts.

**Non-goals:** GIFs; choosing another frame; re-sending edition 0001.

**Constraint:** the script lives in `scripts/covers/` (not `scripts/blog/`), so the PR doesn't touch `opinion-guard`'s protected paths.
