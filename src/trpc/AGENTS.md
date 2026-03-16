# tRPC Patterns

Use this guide for all files under `src/trpc` and App Router tRPC route integration.

## Core Rules

- Keep routers domain-oriented (example: `homepageMetrics`, `leaderboard`, `roast`).
- Export named constants/types only.
- Keep `AppRouter` exported from `src/trpc/routers/_app.ts`.
- Mount the HTTP adapter at `/api/trpc` in `src/app/api/trpc/[trpc]/route.ts`.

## Server/Client split

- `src/trpc/server.tsx` must be server-only.
- `src/trpc/client.tsx` must be client-only and provide:
  - QueryClientProvider
  - TRPCProvider
  - `useTRPC` hooks
- Use request-scoped QueryClient on server and singleton QueryClient in browser.

## RSC + Suspense pattern

- Prefer this flow when data is rendered in client components:
  1. Prefetch in a Server Component with query options from `trpc.<router>.<procedure>.queryOptions(...)`
  2. Wrap subtree with hydration boundary (`HydrateClient`)
  3. Read data in a Client Component using `useSuspenseQuery(...)`
  4. Use a Suspense fallback in the Server Component wrapper

- If a page or wrapper needs multiple independent tRPC prefetches, execute them concurrently with `await Promise.all([...])`.

- If the data is needed only in Server Components and not for client cache hydration, call server-side procedures directly via a server caller pattern.

## Procedure design

- Keep procedures thin; delegate DB logic to `src/db/queries/*`.
- Use input validation only when procedure input exists.
- Return UI-ready shapes when it simplifies page composition, but avoid mixing presentational text in procedures.

## Metrics-specific note

- The homepage metrics contract is `homepageMetrics.summary`.
- Keep this contract stable unless a spec explicitly changes it.
