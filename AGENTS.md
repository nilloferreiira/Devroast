# DevRoast - Project Guide

## Project Context

- DevRoast is a web app to paste code and receive roast-style feedback.
- Current stage uses static data for UI flows and previews.
- Main pages:
  - `/` Home (code input and leaderboard preview)
  - `/components` UI component gallery

## Global Patterns

- Use named exports only.
- Prefer direct imports from component files (no barrel file).
- Keep reusable UI in `src/components/ui`.
- Use composition pattern when a component has meaningful internal parts.
- Keep simple components simple (single API with `children` when enough).
- Use Tailwind + `tailwind-variants` for styles and variants.
- Avoid class string interpolation for Tailwind class composition.

## Styling Conventions

- Theme tokens are defined in `src/app/globals.css`.
- Fonts:
  - Inter for regular text (`font-sans`)
  - JetBrains Mono for technical/monospace text (`font-mono`)
- Prefer semantic color tokens (`bg-bg-*`, `text-*`, `border-*`, `accent-*`).

## Rendering Rules

- Components using Shiki must stay server-side.
- Keep layout/navbar patterns consistent across pages.

## Quality Checks

- Run `npm run check` for formatting/lint checks.
- Run `npm run build` before finalizing significant changes.
