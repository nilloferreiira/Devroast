# Backend Leaderboard Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static `/leaderboard` data with tRPC-backed paginated data (20 per page) while preserving server-side syntax highlighting and collapsible code rows.

**Architecture:** Keep DB read/shaping in `src/db/queries/leaderboard.ts`, expose a thin `leaderboard.page` tRPC procedure, and render data in the Server Component page via `caller`. Use URL-driven pagination (`page`, `perPage`) with server-side normalization and clamping. Keep syntax highlighting on server (`CodeBlockDisplay`) and interaction in a small client collapsible wrapper.

**Tech Stack:** Next.js App Router, tRPC v11, Drizzle ORM, React Server Components, Base UI Collapsible, Tailwind + tailwind-variants.

---

## File Structure Map

- Modify: `src/db/queries/leaderboard.ts`
  - Add paginated leaderboard query + metadata function(s).
  - Ensure list and count use identical filters (`completed` + `score IS NOT NULL`).
- Modify: `src/db/queries/index.ts`
  - Re-export new paginated leaderboard query function/type.
- Create: `src/trpc/routers/leaderboard.ts`
  - Add `leaderboard.page` procedure and output contract.
- Modify: `src/trpc/routers/_app.ts`
  - Mount `leaderboard` router.
- Create: `src/components/leaderboard/leaderboard-code.tsx`
  - Client collapsible wrapper for code block content (same UX as home leaderboard).
- Modify: `src/app/leaderboard/page.tsx`
  - Remove static array.
  - Parse URL params.
  - Call `caller.leaderboard.page(...)`.
  - Render rows + empty state + pagination controls.

## Chunk 1: Data Layer and Contract

### Task 1: Add paginated leaderboard query

**Files:**
- Modify: `src/db/queries/leaderboard.ts`
- Modify: `src/db/queries/index.ts`

- [ ] **Step 1: Write a failing query-level executable check for DB responsibilities only**

Create `src/db/queries/leaderboard.pagination.check.ts` asserting:
- rank offset (`page=2`, first rank should be `#21`)
- deterministic ordering (`score ASC`, `completedAt DESC`, `roast.id ASC`)
- rows/count filter parity (`completed` + `score IS NOT NULL`)
- row shape includes `views: "--"`
- row shape includes `rank`, `score`, `lang`, `views`, and `code`

- [ ] **Step 2: Run the check and verify it fails first**

Run: `npx tsx src/db/queries/leaderboard.pagination.check.ts`
Expected: failure due to missing function/contract.

- [ ] **Step 3: Implement minimal paginated query function**

In `src/db/queries/leaderboard.ts`, add a function shaped like:

```ts
export type PaginatedLeaderboardSummary = {
  rows: LeaderboardRow[];
  totalItems: number;
};

export const getPaginatedLeaderboardSummary = async (
  page: number,
  perPage = 20,
): Promise<PaginatedLeaderboardSummary> => {
  // same WHERE predicate for rows and count:
  // status = completed AND score IS NOT NULL
  // order: score asc, completedAt desc, id asc
  // map rows to rank using offset
  // set views placeholder as "--"
};
```

- [ ] **Step 4: Re-export the new query function**

Update `src/db/queries/index.ts` to export `getPaginatedLeaderboardSummary` (and types if needed).

- [ ] **Step 5: Re-run the check and verify pass**

Run: `npx tsx src/db/queries/leaderboard.pagination.check.ts`
Expected: PASS (or no thrown errors).

- [ ] **Step 6: Remove temporary check file after passing**

Delete `src/db/queries/leaderboard.pagination.check.ts` so it does not stay as repo noise.

- [ ] **Step 7: Commit**

```bash
git add src/db/queries/leaderboard.ts src/db/queries/index.ts
git commit -m "feat: add paginated leaderboard query"
```

### Task 2: Add tRPC leaderboard router

**Files:**
- Create: `src/trpc/routers/leaderboard.ts`
- Modify: `src/trpc/routers/_app.ts`

- [ ] **Step 1: Write failing contract check for router behavior**

Create `src/trpc/routers/leaderboard.page.check.ts` asserting:
- default `page=1`
- invalid/empty/non-finite/float page coerces to 1
- high page clamps to last page
- effective `perPage` is always 20
- invalid params do not throw
- empty dataset behavior: `totalPages=1`, effective `page=1`, `hasPrev=false`, `hasNext=false`

- [ ] **Step 2: Run check and verify it fails first**

Run: `npx tsx src/trpc/routers/leaderboard.page.check.ts`
Expected: FAIL because `leaderboard.page` does not exist.

- [ ] **Step 3: Implement `leaderboard.page` procedure**

In `src/trpc/routers/leaderboard.ts`:

```ts
export const leaderboardRouter = createTRPCRouter({
  page: baseProcedure
    .input(/* non-throwing parser for unknown input -> { page?: unknown; perPage?: unknown } */)
    .query(async ({ input }) => {
    // router owns normalization and must never throw for malformed URL-derived values
    // normalize from unknown input values:
    // invalid/empty/float/non-finite page -> 1
    // page < 1 -> 1
    // force perPage = 20
    // call getPaginatedLeaderboardSummary
    // compute totalPages/hasPrev/hasNext
    // clamp overflow page to totalPages and re-query if needed
    // return rows + pagination metadata contract
    }),
});
```

Keep output fields consistent with spec: `rows[].lang`, `rows[].views`, `pagination` metadata.

- [ ] **Step 4: Mount router in app router**

In `src/trpc/routers/_app.ts`, add:

```ts
leaderboard: leaderboardRouter,
```

- [ ] **Step 5: Assert full response contract shape in check file**

In `src/trpc/routers/leaderboard.page.check.ts`, assert:
- `rows` item keys: `rank`, `score`, `lang`, `views`, `code`
- `pagination` keys: `page`, `perPage`, `totalItems`, `totalPages`, `hasPrev`, `hasNext`
- row value guarantees: `rank` is string, `score` is string, `views === "--"`
- `pagination.perPage === 20`
- pagination invariants: `totalPages >= 1`, `page >= 1`, `page <= totalPages`
- flag invariants: `hasPrev === (page > 1)`, `hasNext === (page < totalPages)`

- [ ] **Step 6: Re-run check and verify pass**

Run: `npx tsx src/trpc/routers/leaderboard.page.check.ts`
Expected: PASS.

- [ ] **Step 7: Remove temporary router check file after passing**

Delete `src/trpc/routers/leaderboard.page.check.ts`.

- [ ] **Step 8: Commit**

```bash
git add src/trpc/routers/leaderboard.ts src/trpc/routers/_app.ts
git commit -m "feat: add leaderboard tRPC pagination procedure"
```

## Chunk 2: Page UI Integration

### Task 3: Add reusable collapsible code wrapper for leaderboard rows

**Files:**
- Create: `src/components/leaderboard/leaderboard-code.tsx`

- [ ] **Step 1: Implement client wrapper with same UX contract as home leaderboard**

Copy the established pattern from `src/components/home/home-shame-leaderboard-code.tsx` into a leaderboard-scoped component:
- collapsed max height
- gradient fade when collapsed
- toggle label `show more`/`show less`
- exported API: `children: React.ReactNode`
- done criteria: identical interaction behavior to home leaderboard code panel

- [ ] **Step 2: Manual check in dev server**

Run: `npm run dev`
Expected:
- component compiles with no client/server boundary errors
- toggle text switches between `show more` and `show less`
- collapsed state shows fade overlay; expanded state hides fade overlay

- [ ] **Step 3: Commit**

```bash
git add src/components/leaderboard/leaderboard-code.tsx
git commit -m "feat: add leaderboard collapsible code wrapper"
```

### Task 4: Replace static leaderboard page with tRPC-backed rendering

**Files:**
- Modify: `src/app/leaderboard/page.tsx`

- [ ] **Step 1: Remove static mock data and wire server caller**

Implement:
- parse `searchParams.page` and `searchParams.perPage` defensively
- call `caller.leaderboard.page({ page, perPage })`
- render rows from returned data
- render all required row fields from contract: `rank`, `score`, `lang`, `views`, `code`

- [ ] **Step 2: Keep server-side syntax highlighting**

Render `CodeBlockDisplay` directly in page/server path.

- [ ] **Step 3: Wrap each row block in `LeaderboardCode` client wrapper**

Pass server-rendered code block as `children`.

- [ ] **Step 4: Add empty state panel**

If no rows, render a clear empty panel message.

- [ ] **Step 5: Add pagination controls**

Render:
- previous/next links with disabled states
- current page of total pages
- links include `?page=<n>&perPage=20`
- single-page behavior: hide or disable controls when `totalPages === 1`
- disabled-state semantics: non-clickable visual state for unavailable prev/next

- [ ] **Step 6: Manual URL behavior verification**

Verify all URLs:
- `/leaderboard`
- `/leaderboard?page=-1`
- `/leaderboard?page=abc`
- `/leaderboard?page=999999`

Expected: sanitized/clamped behavior, no crashes.

Also verify:
- current page label reflects clamped effective page
- prev/next enabled state matches `hasPrev`/`hasNext`
- generated links always include `perPage=20`
- row code panels remain collapsible with preserved syntax highlighting

- [ ] **Step 7: Commit**

```bash
git add src/app/leaderboard/page.tsx
git commit -m "feat: render leaderboard page from paginated tRPC data"
```

## Chunk 3: Verification and Stabilization

### Task 5: Validate deterministic ordering and pagination stability

**Files:**
- Modify: `src/db/queries/leaderboard.ts` (if needed)
- Optional create: `src/db/queries/leaderboard.ordering.check.ts`

- [ ] **Step 1: Add/verify stable tie-break ordering**

Ensure ordering chain is exactly:
1. `score ASC`
2. `completedAt DESC`
3. `roast.id ASC`

- [ ] **Step 2: Validate null-score exclusion consistency**

Ensure both rows query and count query apply `score IS NOT NULL`.

- [ ] **Step 3: Run quick regression check**

Run: `npm run dev`
Expected:
- `/` renders successfully
- `/leaderboard` renders successfully
- no terminal runtime errors
- no browser console errors while loading both pages

- [ ] **Step 4: Commit (if any changes were needed)**

If `src/db/queries/leaderboard.ordering.check.ts` was created for local verification, delete it before commit.

```bash
git add src/db/queries/leaderboard.ts
git commit -m "fix: stabilize leaderboard ordering and pagination count"
```

### Task 6: Project-level verification

**Files:**
- No new files expected.

- [ ] **Step 1: Run formatting/lint checks**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: If failures happen, debug systematically**

Use `superpowers:systematic-debugging` and resolve root causes before continuing.

- [ ] **Step 4: Final integration commit**

```bash
git add src/app/leaderboard/page.tsx src/components/leaderboard/leaderboard-code.tsx src/db/queries/leaderboard.ts src/db/queries/index.ts src/trpc/routers/leaderboard.ts src/trpc/routers/_app.ts
git commit -m "feat: ship backend paginated leaderboard page"
```

## Notes for Executor

- Keep scope tight: do not add persistent views tracking in this plan.
- Keep row contract naming consistent (`lang`, not `language`) across query, router, and page.
- If any pre-commit hook edits files, stage those edits and create a new commit if needed (do not amend unless explicitly requested).
