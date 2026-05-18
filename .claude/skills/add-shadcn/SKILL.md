---
name: add-shadcn
description: Install a shadcn/ui component into this project using the configured `components.json` (new-york style, neutral base, `@/components/ui` alias). Use when the user asks to add a shadcn component (e.g., "add the dialog component", "install shadcn accordion").
disable-model-invocation: true
---

# add-shadcn

Install a shadcn/ui primitive using the project's configuration.

## Project config (from `components.json`)

- Style: `new-york`
- RSC: true
- TSX: true
- Tailwind CSS: `app/globals.css` (v4, CSS-based config)
- Base color: `neutral`
- CSS variables: true
- Icon library: `lucide` (already in deps as `lucide-react`)
- Aliases:
  - components → `@/components`
  - ui → `@/components/ui` (lands in `src/components/ui/`)
  - utils → `@/lib/utils`

## Usage

User invokes this skill with the component name(s) — e.g.:

```
/add-shadcn dialog
/add-shadcn accordion tabs sheet
```

## Steps

1. **Validate** the component name(s) — common shadcn components: `accordion`, `alert`, `alert-dialog`, `avatar`, `badge`, `breadcrumb`, `button`, `card`, `carousel`, `checkbox`, `dialog`, `dropdown-menu`, `form`, `hover-card`, `input`, `label`, `menubar`, `navigation-menu`, `popover`, `progress`, `radio-group`, `scroll-area`, `select`, `separator`, `sheet`, `skeleton`, `slider`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toggle`, `tooltip`.
2. **Run** `npx shadcn@latest add <name> [<name> ...]` from the project root.
3. **Verify** the component was added to `src/components/ui/<name>.tsx`.
4. **Run** `npm run lint` on the new file(s).
5. **Report**:
   - Files added (paths)
   - Any new dependencies installed (check `package.json` diff vs. before)
   - Suggested import: `import { <Component> } from "@/components/ui/<name>";`

## Notes

- shadcn components are copied into the repo (not installed as a package) — they become part of the codebase and can be customized freely.
- Some components depend on additional Radix UI packages; the CLI installs them automatically.
- If the user wants to customize the component immediately after install, ask what variant/behavior they want before editing.
