# Backend Leaderboard Design

## Goal

- Implement `/leaderboard` with real backend data via tRPC.
- Keep the same interaction idea as the homepage shame leaderboard: server syntax highlighting plus collapsible code blocks.
- Support URL-driven pagination with 20 items per page.

## Current constraints

- `src/app/leaderboard/page.tsx` is static and uses mock entries.
- Homepage shame leaderboard already has the target interaction pattern:
  - server-side syntax highlighting (`CodeBlockDisplay`)
  - client-side collapsible wrapper (`HomeShameLeaderboardCode`)
  - data loaded through tRPC server caller.
- Leaderboard DB data currently comes from `roasts` joined with `submissions`.
- There is no persisted `views` field in schema yet.

## Recommendation

- Use a server-first page with `caller.leaderboard.page(...)`.
- Keep Shiki rendering on the server and reuse a small client component only for collapse/expand interaction.
- Keep pagination in URL query params (`page`, optional `perPage`).
- For this release, accept `perPage` in URL but ignore non-20 values and enforce `perPage = 20` on the server and in generated page links.

## Implementation plan

1. Add paginated leaderboard query function(s) in `src/db/queries/leaderboard.ts` with deterministic score handling.
2. Add `leaderboard.page` procedure in `src/trpc/routers/leaderboard.ts` with page normalization and metadata output.
3. Mount the leaderboard router in `src/trpc/routers/_app.ts`.
4. Replace static data in `src/app/leaderboard/page.tsx` with server-caller rendering and URL pagination links.
5. Reuse the existing collapsible client wrapper pattern for row code blocks while keeping Shiki rendering on server.
6. Run project checks and manual verification for pagination/clamping/empty states.

## Alternatives considered

1. Recommended: Server page + tRPC caller
   - Pros: follows existing project pattern, simple, strong SSR behavior, no extra client complexity.
   - Cons: full-page navigation between pages.
2. RSC prefetch + hydrated client Suspense query
   - Pros: better client cache reuse and smoother transitions.
   - Cons: unnecessary complexity for this scope.
3. HTTP fetch to API endpoint from page
   - Pros: transport realism.
   - Cons: extra hop and not aligned with current server-caller usage.

## Design

### Architecture

- Add `leaderboard` router in `src/trpc/routers/leaderboard.ts`.
- Mount it in `src/trpc/routers/_app.ts`.
- Keep data shaping in `src/db/queries/leaderboard.ts`.
- `src/app/leaderboard/page.tsx` remains a Server Component and reads `searchParams`.

### tRPC contract

- Procedure: `leaderboard.page`
- Input:
  - `page?: number`
  - `perPage?: number`
- Effective pagination behavior:
  - default `page = 1`
  - parse from URL before calling procedure; non-numeric/empty/float/non-finite values fallback to `1`
  - clamp `page < 1` to `1`
  - default `perPage = 20`
  - ignore non-20 `perPage` values and force effective `perPage = 20`
  - `totalPages = max(1, ceil(totalItems / perPage))`
  - clamp overflow page to `totalPages`
- Response:
  - `rows: Array<{ rank: string; score: string; lang: CodeLanguageOrPlaintext; views: string; code: string }>`
  - `pagination: { page: number; perPage: 20; totalItems: number; totalPages: number; hasPrev: boolean; hasNext: boolean }`

### Query behavior

- Filter to completed roasts.
- Exclude rows where `score` is null.
- Sort by `score ASC`, then `completedAt DESC`, then `roast.id ASC` as a stable tiebreaker.
- Fetch rows with `limit`/`offset`.
- Fetch total count with the same filter as rows (`status = completed` and `score IS NOT NULL`).
- Compute rank by global position:
  - `rank = #((page - 1) * perPage + index + 1)`
- Set `views` as placeholder `"--"` until real tracking exists.

### Page rendering behavior

- Parse and sanitize `searchParams` before calling tRPC.
- Render list rows with existing leaderboard visual style.
- Render per-row fields: `rank`, `score`, `lang`, `views`, collapsible highlighted `code`.
- Render pagination controls at bottom:
  - previous link
  - current page / total pages label
  - next link
  - links preserve `perPage=20`.

### Empty and error handling

- If no data (`totalItems = 0`), show a dedicated empty-state panel/message.
- For `totalItems = 0`, keep `totalPages = 1` and effective `page = 1`.
- If only one page exists, hide or disable page controls.
- Invalid query params never throw; sanitize to valid values.
- Procedure or DB failures bubble to route-level error boundary.

## Acceptance criteria

- `/leaderboard` reads live data through tRPC (no static array).
- Data path is `db query -> tRPC procedure -> server page`.
- Code blocks remain syntax highlighted on server and collapsible on client.
- Pagination behavior:
  - defaults to page 1
  - 20 entries per page
  - `?page` invalid values clamp to valid range
  - too-high page clamps to last page.
- Rows include `rank`, `score`, `lang`, `views` placeholder, and `code`.
- If leaderboard data loading fails, App Router route-level error UI is shown.

## TODOs

- [ ] Add paginated leaderboard query function(s) in `src/db/queries/leaderboard.ts`.
- [ ] Add `leaderboard.page` procedure in `src/trpc/routers/leaderboard.ts`.
- [ ] Mount leaderboard router in `src/trpc/routers/_app.ts`.
- [ ] Reuse or extract collapsible code wrapper for leaderboard row code blocks.
- [ ] Replace static implementation in `src/app/leaderboard/page.tsx` with tRPC-backed render flow.
- [ ] Implement URL pagination controls with `page` and generated links that include `perPage=20`.
- [ ] Add empty-state handling for zero completed roasts.
- [ ] Ensure row query and count query use the same filters (`completed` + `score IS NOT NULL`).
- [ ] Run manual verification for pagination math and clamping behavior (`page=-1`, `page=abc`, very large page, empty dataset, and rows with null scores).
- [ ] Run `npm run check`.
- [ ] Run `npm run build`.

## Open questions

- Real view tracking is out of scope for this slice; keep placeholder `"--"`.
- Whether to evolve to hydrated client pagination later depends on UX requirements.
- No dedicated automated test harness exists in current scripts; decide later whether to add one in a separate scoped change.
