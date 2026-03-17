# Roast Creation Design

## Goal

- Implement real roast creation from the home editor: user submits code and receives AI analysis on `/roast/[roastId]`.
- Support optional roast tone: serious analysis by default, sarcastic analysis only when roast mode toggle is enabled.
- Keep "share roast" out of scope for this slice.

## Confirmed decisions

- Persist data in DB.
- Use Gemini as AI provider.
- Use synchronous submit flow and redirect to `/roast/[roastId]` on success.
- Roast mode is optional; normal mode must stay serious.
- On Gemini failure, keep user on home and show friendly retry message.
- AI should generate full page content (score, verdict/quote, analysis cards, suggested fix).
- Store code exactly as submitted.

## Existing context to leverage

- The domain schema already exists:
  - `submissions` for source input metadata.
  - `roasts` for top-level result/status.
  - `roast_issues` for analysis cards.
  - `roast_diff_lines` for suggested fix diff lines.
- `/roast/[roastId]` route exists but currently uses static placeholder content.
- tRPC is the project API pattern and should remain the integration path.

## Recommended approach

- Use `roast.create` as a synchronous tRPC mutation:
  1. Validate payload.
  2. Insert submission + processing roast.
  3. Call Gemini with strict JSON contract.
  4. Persist completed roast bundle.
  5. Return `roastId` for redirect.
- Keep read rendering on `/roast/[roastId]` backed by DB query functions.
- Transaction boundary:
  - Create `submissions` + `roasts(status=processing)` first.
  - After Gemini returns valid payload, persist `roasts` completion update + `roast_issues` + `roast_diff_lines` in a single DB transaction.
  - If completion transaction fails, mark roast as `failed` in a best-effort update.

Why this approach:

- Fastest path to real end-to-end behavior.
- Fits existing tRPC + App Router patterns.
- Avoids queue/polling complexity not required for V1.

## Design

### 1) Architecture

- Add mutation procedure in roast router, e.g. `roast.create`.
- Keep Gemini-specific logic in a dedicated server module (for provider prompt/parse/normalization).
- Keep DB write/read shaping in `src/db/queries`.
- Update home submit flow to call mutation and navigate to result page.
- Update `/roast/[roastId]` to render persisted data instead of static mock blocks.

### 2) Data model usage (existing tables)

- `submissions`
  - `sourceCode`: exact submitted code (no normalization/truncation beyond validation reject).
  - `language`: accepted code language enum value only.
  - source of truth: server validates client-provided language against enum and stores that value.
  - invalid/missing language is normalized to `plaintext` (not rejected).
  - `roastMode`: `normal` or `roast`.
  - `lineCount`: derived as number of `\n`-separated lines (`code.split("\n").length`), minimum 1.
- `roasts`
  - `status`: `processing` -> `completed` or `failed`.
  - On completed: `score`, `verdict`, `summaryQuote`, `analysisSummary`, `completedAt`.
  - On failed: `errorMessage`.
- `roast_issues`
  - One row per AI issue card with stable `displayOrder`.
- `roast_diff_lines`
  - One row per suggested-fix diff line with stable `displayOrder`.

### 3) Submission and redirect flow

1. User pastes/edits code in home editor.
2. User optionally enables roast mode toggle.
3. Submit button calls `roast.create` with `{ code, roastMode, language }`.
4. Client shows loading state and blocks duplicate submits.
5. On success, client redirects to `/roast/[roastId]`.
6. On failure, client shows friendly message and preserves editor content for retry.

### 4) AI contract and mapping

- Gemini prompt must enforce JSON-only output with fields mapped to current schema model.
- Validate response with Zod before any final persistence.
- Contract includes:
  - `score` (0.0-10.0)
  - `verdict`
  - `summaryQuote`
  - `analysisSummary`
  - `issues[]`: severity/title/description/order
  - `diffLines[]`: lineType/content/order
- Enum constraints for provider output:
  - `verdict`: `needs_serious_help | needs_work | not_great | decent | clean`
  - `issues[].severity`: `critical | warning | good`
  - `diffLines[].lineType`: `removed | added | context`
- Tone rules:
  - `roastMode = roast`: sarcasm allowed.
  - `roastMode = normal`: serious/objective analysis only.

### 5) Error handling

- Validation errors: reject early as bad request for invalid code payload only (empty code, over 2000 chars).
- Language normalization is not a hard failure: invalid/missing language becomes `plaintext`.
- Provider/network/parse errors:
  - mark roast row as `failed` and store a sanitized operational message in `errorMessage` (no raw provider payloads, no secrets, no user code echo).
  - return generic retry-safe error to client.
- Home page shows retryable message without losing entered code.

### 6) Result page rendering

- Load roast bundle by `roastId` from DB query layer.
- For completed roasts, render:
  - score ring
  - verdict and summary quote
  - language/mode/line metadata
  - issue cards from `roast_issues`
  - suggested fix diff from `roast_diff_lines`
- Behavior matrix for `/roast/[roastId]`:
  - `completed`: render full result page.
  - `failed`: show not found behavior in V1.
  - `processing`: show not found behavior in V1.
  - missing roast id: show not found behavior.
- Keep share action out of scope (hidden or inert).

### 7) Validation and limits

- Enforce server-side max code size of 2000 chars.
- Reject empty code submissions.
- Enforce deterministic limits before persisting:
  - max issues: 8
  - max diff lines: 12
  - issue title max length: 140 chars (schema-aligned)
  - issue description max length: 2000 chars
  - summaryQuote max length: 300 chars
  - analysisSummary max length: 2000 chars
  - diff line content max length: 500 chars
- Overflow behavior is deterministic:
  - issues/diff arrays longer than max are truncated to max items.
  - text fields longer than max are truncated to max length.
  - score outside 0.0-10.0 is clamped to bounds and rounded to one decimal.
  - structural contract violations (missing required fields, wrong enums/types) fail the request and set roast to `failed`.
- Never execute submitted code.

### 8) Duplicate submission semantics (V1)

- Duplicate-submit protection is UX-level in V1: client disables submit while request is in flight.
- V1 does not guarantee server-side idempotency for replayed HTTP requests.
- If a replay occurs, multiple roasts may be created; this is accepted scope for V1.

### 9) Timeout budget

- Keep synchronous mutation provider timeout at 20 seconds.
- On timeout, mark roast as `failed` and return retry-safe client error.

### 10) Observability

- Log structured server events for `roast.create` lifecycle:
  - started, provider-timeout, provider-error, parse-error, db-commit-error, completed.
- Log identifiers only (`submissionId`, `roastId`) and safe error categories.
- Do not log full user code or raw provider responses.

- Required lifecycle event categories for this slice:
  - `roast.create.started`
  - `roast.create.completed`
  - `roast.create.provider_timeout`
  - `roast.create.provider_error`
  - `roast.create.parse_error`
  - `roast.create.db_commit_error`

### 11) Testing strategy

- Unit:
  - AI payload parser/validator and tone rules.
  - mapping from validated AI payload to DB insert/update payloads.
- Integration:
  - `roast.create` success writes expected rows across all four tables.
  - failure path sets roast status to `failed` and returns expected client error.
  - invalid/missing language value falls back to `plaintext`.
- E2E smoke:
  - submit from home, redirect to `/roast/[id]`, key result blocks render.
  - duplicate submit is blocked while request is in flight.
  - provider failure shows retry message and preserves editor content.
  - `/roast/[failed-or-processing-id]` resolves to not found behavior in V1.

## Out of scope

- Share roast flow.
- Async queue/polling/retry orchestration.
- Re-running or editing an existing roast from result page.

## Acceptance criteria

- Home submit creates a persisted roast via Gemini-backed tRPC mutation.
- Roast mode toggle controls tone (serious vs sarcastic) exactly as specified.
- Successful submit redirects to `/roast/[roastId]` and renders persisted analysis.
- Failures return user-friendly retry path on home and do not drop editor content.
- Existing roast tables are reused; no new feature-only tables required.
