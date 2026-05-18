# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server with Turbopack (http://localhost:3000)
- `npm run build` — Production build
- `npm run lint` — ESLint (next/core-web-vitals + next/typescript)

## Architecture

Single-page personal portfolio built with **Next.js 15** (App Router), **React 19**, **Tailwind CSS v4**, and **shadcn/ui** (new-york style).

### Path aliases

- `@/*` → `./src/*` (tsconfig paths)

### Project layout

- `app/` — Next.js App Router: layout, page, globals.css, and page-level components
- `app/Components/` — Page section components (navbar, information, projects, footer, profile). Each in its own folder.
- `src/components/ui/` — shadcn/ui primitives (button, card, input, label, navigation-menu)
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

### Styling

- Tailwind CSS v4 with CSS-based config in `app/globals.css` (no `tailwind.config.ts`)
- Custom color palette: `white`, `palewhite`, `buttonwhite`, `beige`, `green`, `blue`, `solid-beige`, `text-white`
- Fonts: **Inter** and **Aleo** loaded via `next/font/google`, exposed as CSS variables `--font-inter` and `--font-aleo`
- Dark background by default (`--background: #111111`)

### Adding shadcn/ui components

Configured via `components.json`. Use `npx shadcn@latest add <component>` to add new UI primitives.
