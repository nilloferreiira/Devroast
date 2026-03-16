# Home Components Patterns

Use this guide for components under `src/components/home`.

## Data fetching

- Prefer Server Component wrappers for data prefetch.
- When using tRPC + React Query:
  - prefetch in server wrapper
  - hydrate with `HydrateClient`
  - consume with `useSuspenseQuery` in a dedicated client component
- Keep fallback/loading state in the server wrapper via `<Suspense fallback={...}>`.
- If a server wrapper needs multiple independent prefetches, use `await Promise.all([...])`.

## Shiki + interactions

- When a section needs syntax highlight and client-side interaction (example: collapsible code), keep highlight rendering in a Server Component.
- Use a small Client Component only for interaction primitives (Base UI), and pass server-rendered code blocks as `children`.
- Do not move Shiki calls into client components.

## Animation and metrics

- For animated numeric metrics, use `@number-flow/react`.
- Start at `0` and animate to fetched value when mounted.
- Use `font-mono` + `tabular-nums` classes for stable number layout.

## Scope discipline

- Keep changes in this folder scoped to the requested vertical slice.
- Do not migrate unrelated home sections when implementing a focused feature.
