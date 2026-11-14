# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server with Turbopack (http://localhost:3000)
- `npm run build` — Production build
- `npm run lint` — ESLint (next/core-web-vitals + next/typescript)
- `npm test` — Vitest
- `npm run blog:check` — validates every post (`post.json` schema with real calendar dates, slug = folder name; a published post needs a non-empty `<MiOpinion>…</MiOpinion>`, no `<MiOpinion pending />`, and a date not in the future), checks `clip-registry.generated.ts` is current, and loads every clip module to run `validateClipDef` on it
- `npm run blog:registry` — regenerates `clip-registry.generated.ts`
- `npm run blog:snap -- <slug>` — frame snapshots of a post's clips into `.blog-snaps/` (needs `npm run dev`)

## Architecture

Single-page personal portfolio built with **Next.js 15** (App Router), **React 19**, **Tailwind CSS v4**, **Framer Motion**, and **next-themes**. Design source: brand kit "Warm Calibrated · Ink & Tangerine" v1.0 (v2 handoff).

### Path aliases

- `@/*` → `./src/*`, falling back to `./*` (so `@/app/...` resolves to `app/`)

### Project layout

- `app/layout.tsx` — fonts, metadata/OG (`public/og-image.png`), JSON-LD, the pre-paint intro script, `<Providers>`
- `app/page.tsx` — composes the sections (server component; interactive leaves are `"use client"`)
- `app/components/<section>/` — one folder per section, in page order: `intro`, `cursor`, `header` (nav, Menu dropdown below 1180px, "Get in touch"), `hero`, `marquee`, `about` (incl. canvas `accuracy-chart`), `work` (tabs, expandable `experience-row`, project hover preview, `case-study-drawer`), `talks`, `education`, `credentials`, `footer` (incl. `contact-form`)
- `app/api/contact/route.ts` — contact form endpoint (Resend). Validates with the zod schema in `src/lib/contact-schema.ts`, has a `company` honeypot, and rate-limits in memory (5 requests / 10 min per IP)
- `app/components/providers/` — `ThemeProvider` (next-themes, `data-theme`, key `sg-theme`), `LangProvider` (`useLang()`, key `sga-lang`), `UIProvider` (`useUI()`: work tab, nav highlight, open case study, intro state/replay; `scrollToId()`)
- `app/components/shared/` — `TechLogo` (bundled simple-icons + AWS wordmark, `currentColor`), `LogoTag`/`LogoTagList`, `Reveal`
- `app/data/content.json` — **all copy (EN/ES)**, tags, certifications, publications, chart milestones. Typed via `app/data/content.ts`. Edit copy here, not in components.
- `app/data/site.ts` — name, URL, socials, résumé URL
- `app/mentoria/[slug]/` — private mentorship dashboards (Spanish, noindex): `/mentoria/<slug>` is the mentee view, `/mentoria/<slug>/panel` the mentor panel. Plans live in `app/data/mentoria/<slug>.ts` (registered in `index.ts`, server only); progress, session status, agreements and notes live in Neon (project `personal-portfolio`, table `mentoria_state`, one row per slug). Access codes are checked on the server (`src/lib/mentoria/auth.ts`, signed httpOnly cookie scoped to the slug's path); every server action in `actions.ts` re-checks the role. Mentor notes, the profile and mentor prep must never be passed to the mentee view (`toMenteePlan()` strips them). UI in `app/components/mentoria/`
- `app/blog/` — Spanish-only blog (indexable) with animated explainer clips. A post is a folder `app/blog/<slug>/` with `post.json` (schema in `src/lib/blog/schema.ts`), `page.mdx` (fixed header block using `PostShell`/`postMetadata` from `app/components/blog/post-shell.tsx`) and `clips/clip-N.tsx` (only files named `clip-<n>.tsx` are registered as clips). MDX components in `app/components/blog/mdx/`: `MiOpinion` (`pending` placeholder; `npm run blog:check` fails a published post that still has it or has no non-empty opinion), `Profundizar`, `Destacado`. Drafts (`status: "draft"`) show in dev and Vercel previews and 404 in production (`src/lib/blog/visibility.ts`). `src/lib/blog/entries.ts` is the fs reader (usable from scripts), `posts.ts` is server-only, and `clip-registry.generated.ts` is generated (don't edit; `predev`/`prebuild` regenerate it). Dev-only route `/blog/clip-preview/<slug>/<clip>?frame=N`; OG card at `/blog/og/<slug>`
- `app/components/blog/clips/` — clip engine (1280×720, 30 fps, always on a fixed Paper stage): `clip-types.ts` (player-free types + `validateClipDef`; captions ≤70 characters), `clip-def.ts` (`defineClip`, throws on an invalid definition in every environment, so the build fails), `clip-player.tsx` (autoplay only in view, reduced motion shows the final frame, HTML caption bar under the stage), `clip-frame.tsx` (`burnCaptions` only for snapshots), `primitives/` (labels never below 34px), `timing.ts`. Tangerine is never text in clips
- `public/resume.pdf` — **generated, don't edit**: the private `gomez2608/curriculum-vitae` repo's CI compiles `main.tex` and commits it here (deploy key `cv-publisher`). Served at `/resume.pdf` (noindex); `/cv` redirects to it
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `src/lib/contact.ts` — contact form constants shared by client and server (no zod, so it stays out of the client bundle)

### Environment

- `RESEND_API_KEY`, `CONTACT_TO_EMAIL` — required for the contact form (Vercel + `.env.local`)
- `DATABASE_URL`, `MENTORIA_SECRET` (≥32 chars, signs the cookies), `MENTORIA_MENTOR_CODE`, and one `MENTORIA_<SLUG>_CODE` per mentee — required for `/mentoria`
- `CONTACT_FROM_EMAIL` — optional sender override; use `onboarding@resend.dev` until `sebastiangomezahumada.com` is verified in Resend

### Styling

- Tailwind CSS v4 with CSS-based config in `app/globals.css` (no `tailwind.config.ts`)
- Theme tokens are CSS variables on `:root` / `html[data-theme="dark"]`, exposed as utilities: `bg`, `card`, `fog`, `line`, `ink`, `navy`, `slate`, `graphite`, `muted`, `footer`, `emph`, `emph-contrast`, `muted-text` (use for text instead of `muted`, which fails contrast)
- Focus ring uses `--focus` (navy in light mode, tangerine in dark mode)
- Whole page follows the theme. Feature surfaces use `s-*` tokens (hero, intro, drawer header: Paper in light, Navy in dark), the footer uses `f-*`, and the header over the hero uses `--hh-*`. Only the project preview card and "View code" button stay fixed dark (`hero`, `ink-fixed`, `paper`, `hero-meta`)
- Fixed colors: `tangerine` (signal only — never as text on Paper/Fog), plus `hero`, `paper`, `hero-meta`, `hero-line-strong`, `ink-fixed` for the always-dark preview card
- Fonts: **Manrope** (`font-sans`) and **DM Mono** (`font-mono`) via `next/font/google`
- `prefers-reduced-motion` disables the intro, parallax, marquee motion and custom cursor
