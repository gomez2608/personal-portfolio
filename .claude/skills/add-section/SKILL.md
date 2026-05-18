---
name: add-section
description: Scaffold a new page section component following this portfolio's conventions — own folder under `app/Components/<name>/`, kebab-case `.tsx` file with PascalCase default export, and wired into `app/page.tsx`. Use when the user asks to add a new section (e.g., "add a blog section", "add testimonials").
---

# add-section

Add a new page section to the portfolio following existing conventions.

## Existing pattern (observed)

```
app/Components/
├── navbar/navbar.tsx
├── profile/profile.tsx
├── information/
│   ├── information-main.tsx
│   ├── experience.tsx
│   ├── education.tsx
│   └── certificates.tsx
├── projects/projects.tsx
└── footer/footer.tsx
```

- One folder per section, lowercase
- Component file is kebab-case `.tsx`
- Default export is PascalCase
- Section root element is a semantic tag (`<section>`, `<footer>`, `<nav>`) with `id` matching the folder name (for in-page anchor links)
- `"use client"` only when the component uses events, hooks, or browser APIs
- Imports for shadcn UI primitives: `@/components/ui/<name>`
- Icons: `lucide-react`

## Steps

1. **Ask** for the section name if not provided (e.g., `blog`, `testimonials`). Normalize to kebab-case folder name and PascalCase component name.
2. **Decide Server vs. Client**: default to Server Component. Only add `"use client"` if the section needs `onClick`, `useState`, `useEffect`, etc.
3. **Create** `app/Components/<folder>/<file>.tsx` using the template below.
4. **Wire** the new section into `app/page.tsx`:
   - Add the import alongside existing ones
   - Insert `<SectionName />` in the JSX in the appropriate position (ask the user where if not obvious)
5. **Run** `npm run lint` and report any issues.

## Template — Server Component (default)

```tsx
type <Name>Props = {
  // add props here if needed
};

export default function <Name>({}: <Name>Props) {
  return (
    <section id="<folder>" className="my-20">
      <h2 className="text-buttonwhite text-2xl font-aleo mb-6">
        <Name>
      </h2>
      {/* content */}
    </section>
  );
}
```

## Template — Client Component (when interactivity is needed)

```tsx
"use client";

import { useState } from "react";

export default function <Name>() {
  const [state, setState] = useState<boolean>(false);

  return (
    <section id="<folder>" className="my-20">
      {/* interactive content */}
    </section>
  );
}
```

## Conventions to follow

- Use the custom palette tokens: `text-buttonwhite`, `text-palewhite`, `bg-background`, `border-buttonwhite`, etc. (defined in `app/globals.css`).
- Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) for spacing — match the page-level `mx-[25px] lg:mx-[181px] md:mx-[100px] sm:mx-[50px]` rhythm with `my-20` vertical spacing.
- Use the `Aleo` font for section headings via `font-aleo` and `Inter` for body via the default sans stack.
- For icon-only buttons add `aria-label`.
- External links: `<a href="..." target="_blank" rel="noopener noreferrer">` (prefer over `window.open`).

## After creation

Briefly summarize:
- Path of the new file
- Whether it's Server or Client Component (and why)
- Where it was inserted in `page.tsx`
- Any lint warnings/errors
