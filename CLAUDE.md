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
- `app/components/<section>/` — one folder per section: `intro`, `cursor`, `header`, `hero`, `marquee`, `about` (incl. canvas `accuracy-chart`), `work` (tabs, hover preview, `case-study-drawer`), `credentials`, `footer`
- `app/components/providers/` — `ThemeProvider` (next-themes, `data-theme`, key `sg-theme`), `LangProvider` (`useLang()`, key `sga-lang`), `UIProvider` (`useUI()`: work tab, nav highlight, intro state/replay; `scrollToId()`)
- `app/components/shared/` — `TechLogo` (bundled simple-icons + AWS wordmark, `currentColor`), `LogoTag`/`LogoTagList`, `Reveal`
- `app/data/content.json` — **all copy (EN/ES)**, tags, certifications, publications, chart milestones. Typed via `app/data/content.ts`. Edit copy here, not in components.
- `app/data/site.ts` — name, socials, résumé URL
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

### Styling

- Tailwind CSS v4 with CSS-based config in `app/globals.css` (no `tailwind.config.ts`)
- Theme tokens are CSS variables on `:root` / `html[data-theme="dark"]`, exposed as utilities: `bg`, `card`, `fog`, `line`, `ink`, `navy`, `slate`, `graphite`, `muted`, `footer`, `emph`, `emph-contrast`, `muted-text` (use for text instead of `muted`, which fails contrast)
- Focus ring uses `--focus` (navy on light surfaces, tangerine in dark mode); add `surface-dark` to navy/ink surfaces so they keep the tangerine ring
- Fixed (theme-independent) colors: `tangerine` (signal only — never as text on Paper/Fog), `hero`, `paper`, `haze`, `hero-meta`, `hero-line`, `hero-line-strong`, `ink-fixed`
- Fonts: **Manrope** (`font-sans`) and **DM Mono** (`font-mono`) via `next/font/google`
- `prefers-reduced-motion` disables the intro, parallax, marquee motion and custom cursor
