# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server with Turbopack (http://localhost:3000)
- `npm run build` — Production build
- `npm run lint` — ESLint (next/core-web-vitals + next/typescript)

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
- `public/resume.pdf` — **generated, don't edit**: the private `gomez2608/curriculum-vitae` repo's CI compiles `main.tex` and commits it here (deploy key `cv-publisher`). Served at `/resume.pdf` (noindex); `/cv` redirects to it
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `src/lib/contact.ts` — contact form constants shared by client and server (no zod, so it stays out of the client bundle)

### Environment

- `RESEND_API_KEY`, `CONTACT_TO_EMAIL` — required for the contact form (Vercel + `.env.local`)
- `CONTACT_FROM_EMAIL` — optional sender override; use `onboarding@resend.dev` until `sebastiangomezahumada.com` is verified in Resend

### Styling

- Tailwind CSS v4 with CSS-based config in `app/globals.css` (no `tailwind.config.ts`)
- Theme tokens are CSS variables on `:root` / `html[data-theme="dark"]`, exposed as utilities: `bg`, `card`, `fog`, `line`, `ink`, `navy`, `slate`, `graphite`, `muted`, `footer`, `emph`, `emph-contrast`, `muted-text` (use for text instead of `muted`, which fails contrast)
- Focus ring uses `--focus` (navy in light mode, tangerine in dark mode)
- Whole page follows the theme. Feature surfaces use `s-*` tokens (hero, intro, drawer header: Paper in light, Navy in dark), the footer uses `f-*`, and the header over the hero uses `--hh-*`. Only the project preview card and "View code" button stay fixed dark (`hero`, `ink-fixed`, `paper`, `hero-meta`)
- Fixed colors: `tangerine` (signal only — never as text on Paper/Fog), plus `hero`, `paper`, `hero-meta`, `hero-line-strong`, `ink-fixed` for the always-dark preview card
- Fonts: **Manrope** (`font-sans`) and **DM Mono** (`font-mono`) via `next/font/google`
- `prefers-reduced-motion` disables the intro, parallax, marquee motion and custom cursor
