# DB Queries Patterns

Use this guide for files under `src/db/queries`.

## Responsibilities

- Keep raw DB access and SQL shaping in this layer.
- Export small, focused query functions per domain.
- Return typed results that can be used directly by tRPC procedures.

## Conventions

- Use named exports only.
- Keep query functions async and deterministic.
- When multiple independent DB reads are needed, run them concurrently with `await Promise.all([...])`.
- Handle basic null/empty fallbacks close to data access when they are domain defaults (example: metrics defaulting to zero).
- Avoid importing UI components or presentation-specific modules.

## Integration with tRPC

- tRPC procedures should call query functions from this folder instead of duplicating DB logic.
- Keep business/data shaping here when shared by more than one procedure/page.
