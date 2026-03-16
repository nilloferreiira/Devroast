# tRPC API Layer Spec

## Goal

- Implement tRPC as the typed API layer for DevRoast.
- Use Next.js App Router + React Server Components with SSR-friendly setup.
- Keep data fetching compatible with streaming/hydration patterns from tRPC + TanStack React Query docs.

## Current constraints

- Project is Next.js App Router (`src/app`).
- Data layer already exists with Drizzle queries in `src/db/queries`.
- Current pages still call DB queries directly in server components.
- No tRPC packages are installed yet.
- Project conventions from root `AGENTS.md`:
  - named exports only
  - no barrel imports for components
  - run `npm run check` and `npm run build` for validation
- Required references for implementation:
  - https://trpc.io/docs/client/tanstack-react-query/setup
  - https://trpc.io/docs/client/tanstack-react-query/server-components

## Recommendation

- Adopt `@trpc/tanstack-react-query` (v11 pattern) as the default client integration.
- Use request-scoped QueryClient on server + singleton QueryClient in browser.
- Add both access styles:
  - RSC prefetch + `HydrationBoundary` for client components
  - direct server caller for server-only reads when cache hydration is not needed
- Keep DB access behind tRPC procedures (pages should stop importing DB queries directly).

## Implementation plan

- Install dependencies:
  - `@trpc/server`
  - `@trpc/client`
  - `@trpc/tanstack-react-query`
  - `@tanstack/react-query`
  - `zod`
  - `superjson` (recommended for transformer support)
  - `client-only` and `server-only`
- Add tRPC server core:
  - `src/trpc/init.ts` for `initTRPC`, context, base procedure helpers
  - `src/trpc/routers/_app.ts` root router + `AppRouter` export
  - feature routers (ex: leaderboard, roast) under `src/trpc/routers/*`
- Add Next route adapter:
  - `src/app/api/trpc/[trpc]/route.ts` with fetch adapter
  - expose both `GET` and `POST`
- Add React Query client factory:
  - `src/trpc/query-client.ts` with SSR defaults (`staleTime > 0`)
  - include pending query dehydration support for RSC streaming
- Add client provider:
  - `src/trpc/client.tsx` with `createTRPCContext<AppRouter>()`
  - `TRPCReactProvider` creates tRPC client and wraps `QueryClientProvider`
  - mount provider in `src/app/layout.tsx`
- Add server utilities for RSC:
  - `src/trpc/server.tsx` marked `server-only`
  - `getQueryClient` using `cache(makeQueryClient)`
  - `trpc` proxy via `createTRPCOptionsProxy`
  - `HydrateClient` helper
  - optional `prefetch` helper
  - `caller` for direct server component calls
- Add first API procedures mapped from current DB queries:
  - `leaderboard.top` -> uses `getLeaderboardRows`
  - `roast.byId` -> uses `getRoastById`
  - `roast.issues` -> uses `getRoastIssues`
  - `roast.diffLines` -> uses `getRoastDiffLines`
  - input validation via `zod`
- Integrate pages incrementally:
  - Home page leaderboard: prefetch in server component, consume in client component with `useQuery`
  - Roast detail page: choose server caller or prefetch path based on whether client cache reuse is needed
  - keep fallback UI behavior equivalent during migration
- Error and serialization behavior:
  - standardize typed tRPC errors for not-found/invalid-id cases
  - enable `superjson` on both server and client if non-primitive fields are returned

## Acceptance criteria

- tRPC endpoint is available at `/api/trpc` and serves typed procedures.
- `AppRouter` is the single API contract used by client and server utilities.
- Root app is wrapped with `TRPCReactProvider` and QueryClient is SSR-safe.
- At least leaderboard and roast read paths are available as tRPC procedures with `zod` validation.
- At least one route uses RSC prefetch + hydration pattern from docs.
- At least one route uses direct server caller pattern correctly.
- No page imports DB query modules directly for migrated features.
- Existing behavior remains functional after migration.

## TODOs

- [ ] Install tRPC + TanStack Query dependencies.
- [ ] Create `src/trpc/init.ts` and base helpers.
- [ ] Create `src/trpc/routers/_app.ts` and feature routers.
- [ ] Create `src/app/api/trpc/[trpc]/route.ts` adapter.
- [ ] Create `src/trpc/query-client.ts` with SSR defaults/dehydrate config.
- [ ] Create `src/trpc/client.tsx` provider and `useTRPC` hooks.
- [ ] Create `src/trpc/server.tsx` with `trpc`, `getQueryClient`, `HydrateClient`, `caller`.
- [ ] Mount provider in `src/app/layout.tsx`.
- [ ] Add procedures for leaderboard and roast queries.
- [ ] Migrate Home leaderboard flow to tRPC.
- [ ] Migrate roast detail flow to tRPC.
- [ ] Remove direct DB imports from migrated pages.
- [ ] Add basic API tests for input validation and happy paths.
- [ ] Run `npm run check`.
- [ ] Run `npm run build`.

## Open questions

- Should writes (submission creation / roast generation trigger) be included in this first tRPC iteration, or only read procedures?
- Do we want one combined `roast.bundle` procedure now, or keep separate procedures and compose in UI?
- Should we introduce auth-aware context now, or keep anonymous context and add auth later?
- Do we standardize on `superjson` from day one, or only add when we return non-JSON-native data?
