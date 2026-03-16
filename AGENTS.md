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

## Feature Workflow

- Before implementing a new feature, create a spec in `specs/` following `specs/AGENTS.md`.
- Keep implementation scope tight to what the spec/request asks for.
- Avoid broad migrations when a small vertical slice is requested.

## API Layer Patterns (tRPC + Next App Router)

- tRPC is the API layer pattern for app data access.
- Prefer RSC-first data fetching:
  - prefetch in Server Components
  - hydrate with React Query hydration boundary
  - consume in Client Components with Suspense hooks when needed
- Keep endpoint mounted at `/api/trpc`.
- Keep routers domain-oriented and explicit (example: `homepageMetrics`).
- Keep DB logic in query modules and expose them through tRPC procedures.
- For procedures without input, avoid unnecessary validation boilerplate.

## Home Metrics Pattern

- Homepage metrics should come from tRPC (`homepageMetrics.summary`).
- If a metric requires count-up animation, use `@number-flow/react` in a Client Component.
- Prefer a Server Component wrapper that handles prefetch + hydration, then render a Suspense client consumer.

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
