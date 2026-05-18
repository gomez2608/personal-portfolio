# Personal Portfolio — Sebastian Gomez

ML Engineer portfolio at [sebastiangomez.me](https://www.sebastiangomez.me).

## Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** strict
- **Tailwind v4** (CSS-based config in `app/globals.css`)
- **shadcn/ui** (new-york style) for primitives
- **Framer Motion** for subtle scroll reveals
- **Vercel Analytics**
- Deployed on **Vercel**

## Local development

```bash
npm install
npm run dev      # http://localhost:3000 (Turbopack)
npm run build    # production build
npm run lint     # ESLint (next/core-web-vitals + next/typescript)
```

## Structure

```
app/
├── components/         # Page section components
│   ├── footer/
│   ├── information/    # Experience / Education / Certificates
│   ├── navbar/         # Sticky nav with scroll-spy + hide-on-scroll
│   ├── profile/        # Hero section
│   ├── projects/       # Project case-study cards
│   ├── shared/         # Section, AnimatedSection, SectionHeading, Tag
│   └── skills/         # Categorized stack grid
├── data/               # Single source of truth for content
│   ├── site.ts         # Name, role, tagline, bio, socials, resume URL
│   ├── skills.ts
│   ├── experience.ts
│   ├── education.ts
│   ├── certifications.ts
│   └── projects.ts
├── layout.tsx          # Fonts, metadata, JSON-LD, analytics
├── page.tsx            # Section composition
├── globals.css         # Tailwind theme + radial gradient + reduced-motion
├── opengraph-image.tsx # OG image (edge runtime, next/og)
├── robots.ts
└── sitemap.ts

src/
├── components/ui/      # shadcn primitives
└── lib/utils.ts        # cn() helper
```

## Content updates

Almost all content lives in `app/data/*.ts`. To update:

- **Bio / tagline / socials**: edit `app/data/site.ts`
- **Skills / tools**: edit `app/data/skills.ts`
- **Experience**: edit `app/data/experience.ts`
- **Education**: edit `app/data/education.ts`
- **Certifications**: edit `app/data/certifications.ts`
- **Projects**: edit `app/data/projects.ts` (also drop the image into `public/`)
- **Resume**: the URL is in `app/data/site.ts` → `resumeUrl`. Defaults to a Google Drive link so updates don't require a redeploy. To switch to a local file, change `resumeUrl` to `"/resume.pdf"` and place the PDF in `public/`.

## Design

- Dark-only palette: background `#0b0b0c`, foreground `#fafafa`, brand accent `#68b0ab` (teal)
- Typography: **Inter** for body/headings, **Geist Mono** for accents (dates, tool chips, eyebrow labels)
- Motion: scroll-triggered fade + translate via Framer Motion; respects `prefers-reduced-motion`
- Layout: `max-w-3xl` centered column

## Deploy

This repo is connected to Vercel and auto-deploys on push to `master`.

## License

MIT
