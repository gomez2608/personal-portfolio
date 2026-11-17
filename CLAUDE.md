# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server with Turbopack (http://localhost:3000)
- `npm run build` — Production build
- `npm run lint` — ESLint (next/core-web-vitals + next/typescript)
- `npm run newsletter:send -- --issue N [--dry-run] [--test-to x] [--wait-min M]` — validate/preview (`--dry-run`), test-send, or broadcast an issue (CI does the real send)
- `npm test` — Vitest
- `npm run blog:check` — validates every post (`post.json` schema with real calendar dates, slug = folder name; a published post needs a non-empty `opinion` in `post.json`, no MDX may contain `<MiOpinion`, and the date can't be in the future), checks `clip-registry.generated.ts` is current, and loads every clip module to run `validateClipDef` on it
- `npm run blog:registry` — regenerates `clip-registry.generated.ts`
- `npm run blog:snap -- <slug>` — frame snapshots (stage + caption bar) of a post's clips into `.blog-snaps/` (needs `npm run dev`; set `CHROME_PATH` to use an installed Chrome instead of Playwright's Chromium)

## Architecture

Single-page personal portfolio built with **Next.js 15** (App Router), **React 19**, **Tailwind CSS v4**, **Framer Motion**, and **next-themes**. Design source: brand kit "Warm Calibrated · Ink & Tangerine" v1.0 (v2 handoff).

### Path aliases

- `@/*` → `./src/*`, falling back to `./*` (so `@/app/...` resolves to `app/`)

### Project layout

- `app/layout.tsx` — fonts, metadata/OG (`public/og-image.png`), JSON-LD, the pre-paint intro script, `<Providers>`
- `app/page.tsx` — composes the sections (server component; interactive leaves are `"use client"`)
- `app/components/<section>/` — one folder per section, in page order: `intro`, `cursor`, `header` (nav, Menu dropdown below 1180px, "Get in touch"; also the header of `/blog` and `/privacidad`, where it stays in its floating style and its links navigate to `/#section`), `hero`, `marquee`, `about` (incl. canvas `accuracy-chart`), `work` (tabs, expandable `experience-row`, project hover preview, `case-study-drawer`), `talks`, `education`, `credentials`, `footer` (incl. `contact-form`)
- `app/api/contact/route.ts` — contact form endpoint (Resend). Validates with the zod schema in `src/lib/contact-schema.ts`, has a `company` honeypot, and rate-limits in memory (5 requests / 10 min per IP)
- `app/components/providers/` — `ThemeProvider` (next-themes, `data-theme`, key `sg-theme`), `LangProvider` (`useLang()`, key `sga-lang`), `UIProvider` (`useUI()`: work tab, nav highlight, open case study, intro state/replay; `scrollToId()`)
- `app/components/shared/` — `TechLogo` (bundled simple-icons + AWS wordmark, `currentColor`), `LogoTag`/`LogoTagList`, `Reveal`
- `app/data/content.json` — **all copy (EN/ES)**, tags, certifications, publications, chart milestones. Typed via `app/data/content.ts`. Edit copy here, not in components.
- `app/data/site.ts` — name, URL, socials, résumé URL
- `app/mentoria/[slug]/` — private mentorship dashboards (Spanish, noindex): `/mentoria/<slug>` is the mentee view, `/mentoria/<slug>/panel` the mentor panel. Plans live in `app/data/mentoria/<slug>.ts` (registered in `index.ts`, server only); progress, session status, agreements and notes live in Neon (project `personal-portfolio`, table `mentoria_state`, one row per slug). Access codes are checked on the server (`src/lib/mentoria/auth.ts`, signed httpOnly cookie scoped to the slug's path); every server action in `actions.ts` re-checks the role. Mentor notes, the profile and mentor prep must never be passed to the mentee view (`toMenteePlan()` strips them). UI in `app/components/mentoria/`
- `app/blog/` — Spanish-only blog (indexable) with animated explainer clips. A post is a folder `app/blog/<slug>/` with `post.json` (schema in `src/lib/blog/schema.ts`), `page.mdx` (fixed header block using `PostShell`/`postMetadata` from `app/components/blog/post-shell.tsx`) and `clips/clip-N.tsx` (only files named `clip-<n>.tsx` are registered as clips). MDX components in `app/components/blog/mdx/`: `Profundizar`, `Destacado`. The author's opinion is the `opinion` field of `post.json` (`null` until written; only the `/opinion` workflow writes it), rendered by `PostShell` as the "Mi opinión" block after the content, with a "Pendiente" placeholder on drafts. Drafts (`status: "draft"`) show in dev and Vercel previews and 404 in production (`src/lib/blog/visibility.ts`). `src/lib/blog/entries.ts` is the fs reader (usable from scripts), `posts.ts` is server-only, and `clip-registry.generated.ts` is generated (don't edit; `predev`/`prebuild` regenerate it). Dev-only route `/blog/clip-preview/<slug>/<clip>?frame=N`; OG card at `/blog/og/<slug>`
- `app/components/blog/clips/` — clip engine (1280×720, 30 fps, always on a fixed Paper stage): `clip-types.ts` (player-free types + `validateClipDef`; captions ≤70 characters), `clip-def.ts` (`defineClip`, throws on an invalid definition in every environment, so the build fails), `clip-player.tsx` (autoplay only in view, reduced motion shows the final frame), `caption-bar.tsx` (the HTML caption bar under the stage, shared by the player and the snapshot route), `clip-frame.tsx` (the stage; never draws captions, so scenes use the full 1280×720), `primitives/` (every label ≥34px, Node sub-labels included), `timing.ts`. Tangerine is never text in clips
- `src/lib/newsletter/` + `app/api/newsletter/{subscribe,confirm}` — double-opt-in Spanish newsletter (Resend segment, consent rows in Neon, `db/newsletter.sql`). Signup form on the blog (`app/components/blog/newsletter-signup.tsx`, honeypot `nl_hp_field`), result page `/blog/suscripcion`, policy `/privacidad`. **Hidden until configured:** the form renders and `/privacidad` is indexable and in the sitemap only when `isNewsletterConfigured()` (`config.ts`, server-only) is true; it's evaluated at build, so set the env and redeploy. The signed confirm link (`token.ts`) carries the consent evidence (issuedAt, policy version, source, IP hash), written to Neon only on confirm. `decideConfirm` (`confirm.ts`, pure) drives `markConfirmed`: pending → confirmed, a link newer than `confirmed_at` → reconfirmed (fresh consent, re-subscribes in Resend), an older link → already (no write, and `syncContact` never sets `unsubscribed:false`), so a stale link can't undo an unsubscribe. The resend cooldown starts only after the confirmation email was sent
- `newsletter/issues/NNNN.json` — one file per issue (schema in `src/lib/newsletter/issue.ts`). **Merging a newly added file to `master` sends it** via `.github/workflows/newsletter-send.yml`; edits never send. Each issue is claimed in Neon first and sent at most once. A manual real send only runs on `master` (dry run / `test_to` on any ref). Setup: `docs/newsletter-setup.md`
- `newsletter/agent/` — instructions (Spanish) the cloud agent follows: `candidatos.md` (candidate issue, scheduled), `borradores.md` (draft PR on `edicion-NNNN`, label `aprobado`), `revision.md` (apply PR comments, label `revisar`), plus the shared `ESTILO.md`. The agent never pushes to `master`, merges, edits `opinion` or sends email. Setup: `docs/newsletter-automation-setup.md`
- `.github/workflows/` — `blog-pr-checks.yml` (job `blog-pr-checks`: test, lint, `blog:check`, build), `opinion.yml` (`/opinion` comment → `post.json`), `opinion-guard.yml` (`pull_request_target`; commit status `opinion-guard`), `newsletter-send.yml`
- **Opinion rule:** an `opinion` lives only in `post.json`, is written only by the `/opinion` workflow (a `/opinion <slug>` + newline + text PR comment by `gomez2608`, not via a GitHub App, committed as `github-actions[bot]` with message `opinion: <slug>`), and `opinion-guard` verifies every changed opinion against that comment. Never edit it by hand or from the agent. Both workflows run from `master`'s files, so changes to them only take effect once merged
- `public/resume.pdf` — **generated, don't edit**: the private `gomez2608/curriculum-vitae` repo's CI compiles `main.tex` and commits it here (deploy key `cv-publisher`). Served at `/resume.pdf` (noindex); `/cv` redirects to it
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `src/lib/contact.ts` — contact form constants shared by client and server (no zod, so it stays out of the client bundle)

### Environment

- `RESEND_API_KEY`, `CONTACT_TO_EMAIL` — required for the contact form (Vercel + `.env.local`)
- `DATABASE_URL`, `MENTORIA_SECRET` (≥32 chars, signs the cookies), `MENTORIA_MENTOR_CODE`, and one `MENTORIA_<SLUG>_CODE` per mentee — required for `/mentoria`
- `RESEND_API_KEY`, `RESEND_NEWSLETTER_SEGMENT_ID`, `NEWSLETTER_SECRET` (≥32 chars), `DATABASE_URL` — required for the newsletter; `NEWSLETTER_FROM_EMAIL` optional sender override. The send workflow also needs `DATABASE_URL`, `RESEND_API_KEY`, `RESEND_NEWSLETTER_SEGMENT_ID` (and optionally `NEWSLETTER_FROM_EMAIL`) as GitHub secrets. Without the first four (and a ≥32-char secret) the newsletter UI stays hidden
- `CONTACT_FROM_EMAIL` — optional sender override; use `onboarding@resend.dev` until `sebastiangomezahumada.com` is verified in Resend

### Styling

- Tailwind CSS v4 with CSS-based config in `app/globals.css` (no `tailwind.config.ts`)
- Theme tokens are CSS variables on `:root` / `html[data-theme="dark"]`, exposed as utilities: `bg`, `card`, `fog`, `line`, `ink`, `navy`, `slate`, `graphite`, `muted`, `footer`, `emph`, `emph-contrast`, `muted-text` (use for text instead of `muted`, which fails contrast)
- Focus ring uses `--focus` (navy in light mode, tangerine in dark mode)
- Whole page follows the theme. Feature surfaces use `s-*` tokens (hero, intro, drawer header: Paper in light, Navy in dark), the footer uses `f-*`, and the header over the hero uses `--hh-*`. Only the project preview card and "View code" button stay fixed dark (`hero`, `ink-fixed`, `paper`, `hero-meta`)
- Fixed colors: `tangerine` (signal only — never as text on Paper/Fog), plus `hero`, `paper`, `hero-meta`, `hero-line-strong`, `ink-fixed` for the always-dark preview card
- Fonts: **Manrope** (`font-sans`) and **DM Mono** (`font-mono`) via `next/font/google`
- `prefers-reduced-motion` disables the intro, parallax, marquee motion and custom cursor
