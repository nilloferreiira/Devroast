# Roast Creation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users submit code from home, generate a Gemini-backed analysis, persist roast data, and redirect to a DB-backed `/roast/[roastId]` result page with optional sarcastic mode.

**Architecture:** Add a synchronous `roast.create` tRPC mutation that validates input, writes `submissions` + `roasts(processing)`, calls Gemini, validates/maps response, and persists the completed roast bundle (`roasts`, `roast_issues`, `roast_diff_lines`). Keep AI/provider logic isolated in a dedicated server module and DB access in `src/db/queries`. Update home client submission UX and render `/roast/[roastId]` from real persisted data.

**Tech Stack:** Next.js App Router, tRPC v11, Drizzle ORM, PostgreSQL, React Server/Client Components, Base UI switch, Tailwind + tailwind-variants.

---

## File Structure Map

- Create: `src/lib/ai/gemini-roast.ts`
  - Gemini request builder, timeout handling, JSON parsing + Zod validation, output normalization.
- Create: `src/lib/roast-contract.ts`
  - Shared roast payload schemas, enums, constants/limits, and helper normalizers.
- Create: `src/db/queries/roast-create.ts`
  - Focused write operations for creating submission/roast and persisting completed/failed states.
- Modify: `src/db/queries/index.ts`
  - Export new roast-create query helpers.
- Create: `src/trpc/routers/roast.ts`
  - `roast.create` mutation and optional `roast.byId` query if needed.
- Modify: `src/trpc/routers/_app.ts`
  - Mount `roast` router.
- Modify: `src/components/home/editor-panel.tsx`
  - Controlled roast mode toggle + submit button loading/error/redirect behavior.
- Modify: `src/components/home/code-editor.tsx`
  - Expose current code and effective language to parent (submit payload source of truth for UI state).
- Create: `src/components/home/create-roast-action.ts`
  - Small client helper hook/function for calling tRPC mutation and handling UI error states.
- Modify: `src/app/roast/[roastId]/page.tsx`
  - Replace static content with DB-backed rendering and status-aware notFound behavior.
- Modify: `src/db/queries/roasts.ts`
  - Ensure `getRoastById` bundle retrieval has everything page render needs.
- Modify: `src/db/seed.ts`
  - Keep sample data aligned with any new constraints if required.

## Chunk 1: Domain Contract + AI Adapter

### Task 1: Define roast contract constants and schemas

**Files:**
- Create: `src/lib/roast-contract.ts`
- Create: `src/lib/roast-contract.check.ts` (committed executable contract check)

- [ ] **Step 1: Create shared constants and enum helpers**

Add constants matching spec:
- `MAX_CODE_CHARS = 2000`
- `MAX_ISSUES = 8`
- `MAX_DIFF_LINES = 12`
- `MAX_SUMMARY_QUOTE_CHARS = 300`
- `MAX_ANALYSIS_SUMMARY_CHARS = 2000`
- `MAX_ISSUE_TITLE_CHARS = 140`
- `MAX_ISSUE_DESCRIPTION_CHARS = 2000`
- `MAX_DIFF_LINE_CONTENT_CHARS = 500`
- `AI_TIMEOUT_MS = 20_000`

- [ ] **Step 2: Define input and output schemas using Zod**

Schema coverage:
- create-mutation input `{ code, roastMode, language }`
- input behavior contract:
  - reject empty code
  - reject code over 2000 chars
  - normalize invalid/missing language to `plaintext`
- Gemini normalized output fields (`score`, `verdict`, `summaryQuote`, `analysisSummary`, `issues`, `diffLines`)
  - `issues[]`: includes `severity`, `title`, `description`, `order`
  - `diffLines[]`: includes `lineType`, `content`, `order`
- enum constraints:
  - verdict: `needs_serious_help | needs_work | not_great | decent | clean`
  - issue severity: `critical | warning | good`
  - diff line type: `removed | added | context`

- [ ] **Step 3: Implement deterministic normalization helpers**

Helpers:
- `normalizeLanguageOrPlaintext`
- `normalizeScore` (clamp 0..10, round 1 decimal)
- `truncateToMaxLength`
- `normalizeIssueList` (truncate list + each text field)
- `normalizeDiffLineList` (truncate list + each text field)

Order normalization rule:
- if AI omits or duplicates `order`, derive deterministic order from array index (1-based).
- persisted `displayOrder` always uses normalized unique ascending values per roast.

- [ ] **Step 4: Add and run executable contract checks**

Create `src/lib/roast-contract.check.ts` to assert:
- invalid language maps to `plaintext`
- empty/too-long code is rejected by input parser
- score clamping and one-decimal rounding behavior
- list and text truncation behavior for issues/diff lines

Run: `npx tsx src/lib/roast-contract.check.ts`
Expected: PASS (no thrown errors).

- [ ] **Step 5: Commit**

```bash
git add src/lib/roast-contract.ts src/lib/roast-contract.check.ts
git commit -m "feat: add roast contract and normalization helpers"
```

### Task 2: Implement Gemini adapter with strict parsing

**Files:**
- Create: `src/lib/ai/gemini-roast.ts`
- Modify: `src/lib/roast-contract.ts` (if small contract adjustments are required)
- Create: `src/lib/ai/gemini-roast.check.ts` (committed executable adapter check)

- [ ] **Step 1: Implement provider call function with timeout**

Create function signature:

```ts
export const generateRoastAnalysis = async (
  params: {
    code: string;
    roastMode: "normal" | "roast";
    language: string;
  },
  deps?: {
    callModel: (input: {
      prompt: string;
      timeoutMs: number;
    }) => Promise<string>;
  },
): Promise<NormalizedRoastOutput> => {
  // timeout + provider call + parse + normalize
};
```

Implementation seam requirement:
- adapter must accept an injectable transport/model caller (with Gemini default) so checks can run offline without real provider calls.
- timeout behavior must be testable through injected transport stubs.

Ownership boundary:
- adapter does not own lifecycle logging with IDs.
- adapter returns/throws typed errors only; router logs lifecycle events with `submissionId`/`roastId`.

- [ ] **Step 2: Implement prompt contract and tone switching**

Prompt requirements:
- JSON-only response.
- Tone conditional by roast mode (`normal` serious, `roast` sarcastic).
- Required fields exactly match parser contract.

Single source-of-truth rule:
- prompt field list and enum values must be generated from shared constants/schema metadata in `src/lib/roast-contract.ts` to avoid drift.

- [ ] **Step 3: Implement parse/validation failure behavior**

If provider response is malformed or structurally invalid:
- throw typed error category (e.g. `parse_error` or `provider_error`).

Typed error taxonomy for adapter:
- `provider_timeout`
- `provider_error`
- `parse_error`

Expose typed adapter error surface explicitly (exported union/class + mapping helper) so router can map categories to logs and tRPC errors.

- [ ] **Step 4: Add adapter-safe logging rule comments and error mapping notes**

Do not emit lifecycle logs from adapter with IDs.
Document in-code that router is responsible for:
- `roast.create.provider_timeout`
- `roast.create.provider_error`
- `roast.create.parse_error`
and safe payload constraints.

- [ ] **Step 5: Add and run adapter verification checks**

Create `src/lib/ai/gemini-roast.check.ts` to assert:
- normal mode prompt path marks tone as serious/objective
- roast mode prompt path allows sarcastic tone
- malformed provider JSON results in typed parse error
- timeout path results in typed `provider_timeout` category only

Run: `npx tsx src/lib/ai/gemini-roast.check.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/ai/gemini-roast.ts src/lib/ai/gemini-roast.check.ts src/lib/roast-contract.ts src/lib/roast-contract.check.ts
git commit -m "feat: add gemini roast adapter with strict validation"
```

## Chunk 2: DB Writes + tRPC Mutation

### Task 3: Add roast creation write queries

**Files:**
- Create: `src/db/queries/roast-create.ts`
- Modify: `src/db/queries/index.ts`

- [ ] **Step 1: Add query helpers for submission + processing roast creation**

Create helpers:
- `createSubmissionRecord(...)`
- `createProcessingRoastRecord(...)`

- [ ] **Step 2: Add completion transaction helper**

Create helper:
- `completeRoastWithDetails(...)`

Behavior:
- one DB transaction for:
  - updating `roasts` to `completed` with summary fields + completedAt
  - inserting ordered `roast_issues`
  - inserting ordered `roast_diff_lines`

- [ ] **Step 3: Add failure update helper**

Create helper:
- `markRoastAsFailed(roastId, errorMessage)`

Constraints:
- sanitize message before persistence.

- [ ] **Step 4: Export new helpers from index**

Update `src/db/queries/index.ts` with named exports only.

- [ ] **Step 5: Commit**

```bash
git add src/db/queries/roast-create.ts src/db/queries/index.ts
git commit -m "feat: add roast creation persistence queries"
```

### Task 4: Add tRPC roast router and mutation

**Files:**
- Create: `src/trpc/routers/roast.ts`
- Modify: `src/trpc/routers/_app.ts`

- [ ] **Step 1: Implement `roast.create` mutation skeleton**

Flow:
1. Parse/validate input with shared contract.
2. Create submission row.
3. Create `roasts(status=processing)` row.
4. Call Gemini adapter.
5. Persist completion transaction.
6. Return `{ roastId }`.

- [ ] **Step 2: Implement error categories and failure path**

On provider/parse/db-completion errors:
- best effort `markRoastAsFailed`
- throw generic retry-safe tRPC error (`INTERNAL_SERVER_ERROR`).

On invalid code payload:
- throw `BAD_REQUEST`.

- [ ] **Step 3: Add structured lifecycle logs**

Emit categories:
- `roast.create.started`
- `roast.create.completed`
- `roast.create.db_commit_error`

- [ ] **Step 4: Mount router in app router**

In `_app.ts` add:

```ts
roast: roastRouter,
```

- [ ] **Step 5: Commit**

```bash
git add src/trpc/routers/roast.ts src/trpc/routers/_app.ts
git commit -m "feat: add roast.create tRPC mutation"
```

## Chunk 3: Home Submit UX + Result Page Rendering

### Task 5: Wire submit action from home editor

**Files:**
- Modify: `src/components/home/editor-panel.tsx`
- Modify: `src/components/home/code-editor.tsx`
- Create: `src/components/home/create-roast-action.ts`

- [ ] **Step 1: Expose editor state required for submission**

In `CodeEditor` add callback props that provide current:
- `code`
- effective language (`manual` or detected)

Ensure parent (`EditorPanel`) has these values in sync.

- [ ] **Step 2: Make roast toggle controlled at parent level**

Replace implicit default-only behavior with explicit boolean state so submission payload is deterministic.

- [ ] **Step 3: Add submit behavior with loading + duplicate-submit guard**

In `EditorPanel`:
- disable button while pending
- update button label while pending
- call `roast.create` with `{ code, roastMode, language }`
- on success navigate to `/roast/${roastId}`

- [ ] **Step 4: Add retry-safe inline error rendering**

If mutation fails:
- show short message near submit controls
- keep code intact
- allow immediate retry

- [ ] **Step 5: Commit**

```bash
git add src/components/home/editor-panel.tsx src/components/home/code-editor.tsx src/components/home/create-roast-action.ts
git commit -m "feat: wire home submit flow to roast.create mutation"
```

### Task 6: Render roast result page from DB data

**Files:**
- Modify: `src/app/roast/[roastId]/page.tsx`
- Modify: `src/db/queries/roasts.ts`

- [ ] **Step 1: Replace static roast content with DB query-driven data**

Use roast query layer to fetch:
- roast header fields (score, verdict, quote, summary)
- submission metadata (language, lineCount, roastMode)
- issues and diff lines

- [ ] **Step 2: Implement status matrix behavior**

For `roastId` route:
- `completed` => render page
- `failed`/`processing`/missing => `notFound()`

- [ ] **Step 3: Map persisted issue/diff rows to existing UI components**

Keep current visual layout, replacing mock arrays with DB content.

- [ ] **Step 4: Keep share action out of scope**

Hide share button or keep inert, but do not implement share behavior.

- [ ] **Step 5: Commit**

```bash
git add src/app/roast/[roastId]/page.tsx src/db/queries/roasts.ts
git commit -m "feat: render roast page from persisted roast data"
```

## Chunk 4: Verification and Hardening

### Task 7: Manual and automated verification

**Files:**
- Modify (if needed): `src/db/seed.ts`

- [ ] **Step 1: Run code quality checks**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Manual smoke flow in dev server**

Run: `npm run dev`

Verify:
- normal mode submit -> serious analysis result page
- roast mode submit -> sarcastic analysis result page
- provider failure path shows retry-safe inline error and keeps input
- duplicate submit is blocked while pending
- result URL loads via refresh for completed roast IDs

- [ ] **Step 4: Optional seed alignment update (only if needed)**

If constraints changed seed assumptions, update `src/db/seed.ts` minimally.

- [ ] **Step 5: Final integration commit**

```bash
git add src/lib/roast-contract.ts src/lib/ai/gemini-roast.ts src/db/queries/roast-create.ts src/db/queries/index.ts src/trpc/routers/roast.ts src/trpc/routers/_app.ts src/components/home/create-roast-action.ts src/components/home/editor-panel.tsx src/components/home/code-editor.tsx src/app/roast/[roastId]/page.tsx src/db/queries/roasts.ts src/db/seed.ts
git commit -m "feat: implement end-to-end roast creation with gemini"
```

## Notes for Executor

- Keep this vertical slice focused; do not add async job queue, polling UI, or share flow.
- Preserve existing named export conventions.
- Prefer focused modules over expanding `editor-panel.tsx` and roast page into large multi-responsibility files.
- If provider SDK setup needs env vars, document required variable names in code comments near adapter init and surface clear runtime error when missing.
