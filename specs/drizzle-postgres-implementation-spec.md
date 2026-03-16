# DevRoast Drizzle + Postgres Implementation Spec

## Scope (from README + current layouts)

This spec covers persistence for the flows already documented and designed:

- Code input and submission (`/`)
- Roast mode toggle (normal vs roast tone)
- Roast result screen (score, summary, analysis, suggested diff)
- Shame leaderboard preview/full page

Out of scope for this first DB iteration:

- Authentication/users
- Billing
- Background jobs beyond a basic processing status field

---

## Database choice

- **ORM:** Drizzle ORM
- **Database:** PostgreSQL (via Docker Compose in local dev)
- **Migrations:** Drizzle Kit SQL migrations tracked in repo

---

## Data model overview

### 1) `submissions`

Stores the original pasted code and submission settings.

Main fields:

- `id` (uuid, pk)
- `source_code` (text, not null)
- `language` (`code_language` enum, not null)
- `roast_mode` (`roast_mode` enum, not null)
- `line_count` (integer, not null)
- `created_at` (timestamp with timezone, not null, default now)
- `updated_at` (timestamp with timezone, not null, default now)

Indexes:

- `created_at` desc (recent submissions)
- `language` (filtering/metrics)

### 2) `roasts`

Stores overall roast output for a submission.

Main fields:

- `id` (uuid, pk)
- `submission_id` (uuid, fk -> `submissions.id`, unique, not null)
- `status` (`roast_status` enum, not null)
- `score` (numeric(3,1), nullable until completed)
- `verdict` (`roast_verdict` enum, nullable until completed)
- `summary_quote` (text, nullable)
- `analysis_summary` (text, nullable)
- `error_message` (text, nullable)
- `created_at` (timestamp with timezone, not null, default now)
- `updated_at` (timestamp with timezone, not null, default now)
- `completed_at` (timestamp with timezone, nullable)

Indexes:

- `status`
- `score` asc (leaderboard queries)
- `completed_at` desc

### 3) `roast_issues`

Detailed analysis cards shown in roast results.

Main fields:

- `id` (uuid, pk)
- `roast_id` (uuid, fk -> `roasts.id`, not null)
- `severity` (`issue_severity` enum, not null)
- `title` (varchar(140), not null)
- `description` (text, not null)
- `display_order` (integer, not null)

Indexes:

- (`roast_id`, `display_order`)

### 4) `roast_diff_lines`

Suggested fix block line-by-line.

Main fields:

- `id` (uuid, pk)
- `roast_id` (uuid, fk -> `roasts.id`, not null)
- `line_type` (`diff_line_type` enum, not null)
- `content` (text, not null)
- `display_order` (integer, not null)

Indexes:

- (`roast_id`, `display_order`)

### 5) `leaderboard_snapshots` (optional, v1.1)

Optional denormalized cache for very fast leaderboard reads. Not required in v1.

---

## Enums

### `code_language`

- `javascript`
- `typescript`
- `tsx`
- `jsx`
- `json`
- `bash`
- `python`
- `plaintext`

### `roast_mode`

- `normal`
- `roast`

### `roast_status`

- `pending`
- `processing`
- `completed`
- `failed`

### `issue_severity`

- `critical`
- `warning`
- `good`

### `diff_line_type`

- `removed`
- `added`
- `context`

### `roast_verdict`

- `needs_serious_help`
- `needs_work`
- `not_great`
- `decent`
- `clean`

---

## Drizzle schema structure (proposed)

```text
src/db/
  index.ts                # drizzle client + connection
  schema/
    enums.ts
    submissions.ts
    roasts.ts
    roast-issues.ts
    roast-diff-lines.ts
    relations.ts
```

Key implementation notes:

- Use `pgEnum` for all enums above.
- Keep one-to-one between `submissions` and `roasts` using unique `submission_id`.
- Model ordered child collections (`roast_issues`, `roast_diff_lines`) with `display_order`.
- Add `relations(...)` for typed joins.

---

## Leaderboard query model

No dedicated table required for v1. Build leaderboard from joins:

- Source: `roasts` (completed only) + `submissions`
- Sort: `score ASC`, then `completed_at DESC`
- Shape per row:
  - rank (derived in query layer)
  - score
  - code preview (first N chars from `source_code`)
  - language

---

## Docker Compose (Postgres)

Create `docker-compose.yml` in project root with:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: devroast-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: devroast
      POSTGRES_USER: devroast
      POSTGRES_PASSWORD: devroast
    ports:
      - "5432:5432"
    volumes:
      - devroast_pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devroast -d devroast"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  devroast_pg_data:
```

Recommended env vars:

- `DATABASE_URL=postgresql://devroast:devroast@localhost:5432/devroast`

---

## Migration and rollout plan

1. Add dependencies: `drizzle-orm`, `drizzle-kit`, `pg`.
2. Add Drizzle config (`drizzle.config.ts`).
3. Create schema files and relations.
4. Generate first migration.
5. Run migration against local Docker Postgres.
6. Add seed script with realistic static data from current UI examples.
7. Replace static arrays on pages with DB reads.

---

## Implementation TODOs

- [ ] Add `docker-compose.yml` for local Postgres and verify healthcheck.
- [ ] Add `.env.example` with `DATABASE_URL`.
- [ ] Install Drizzle/Postgres packages and add scripts:
  - [ ] `db:generate`
  - [ ] `db:migrate`
  - [ ] `db:studio`
  - [ ] `db:seed`
- [ ] Create `src/db/index.ts` connection module.
- [ ] Implement enums in `src/db/schema/enums.ts`.
- [ ] Implement tables: `submissions`, `roasts`, `roast_issues`, `roast_diff_lines`.
- [ ] Implement relations and typed query helpers.
- [ ] Generate and commit initial migration SQL.
- [ ] Seed at least:
  - [ ] 10 submissions
  - [ ] 10 roast rows
  - [ ] 20+ issues
  - [ ] 30+ diff lines
- [ ] Replace static homepage leaderboard with Drizzle query.
- [ ] Replace static roast result mock with DB-backed query by `submission_id`.
- [ ] Add basic repository tests for:
  - [ ] insert submission
  - [ ] create roast + issues + diff lines
  - [ ] leaderboard ordering correctness
- [ ] Run `npm run check`.
- [ ] Run `npm run build`.

---

## Open decisions (track before implementation)

1. Keep one roast per submission (current spec) or allow multiple roast runs/history?
2. Store full diff as structured lines only (current spec) or also raw patch text?
3. Add soft-delete columns now or defer?
4. Add leaderboard materialized/cache table in v1 or only after perf evidence?
