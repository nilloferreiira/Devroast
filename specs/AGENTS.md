# Specs Guide

Create specs in this folder before implementing a feature.

## Naming

- Use lowercase kebab-case.
- End with `-spec.md`.

## Required sections

Use this order for every new spec:

1. `# <Feature> Spec`
2. `## Goal` or `## Scope`
3. `## Current constraints`
4. `## Recommendation`
5. `## Implementation plan`
6. `## Acceptance criteria`
7. `## TODOs`
8. `## Open questions`

## Writing rules

- Keep it practical and implementation-ready.
- Use short bullet points.
- Start with facts from the current codebase.
- Separate:
  - facts
  - decisions
  - open questions

## TODO format

- Use markdown checkboxes (`- [ ]`).
- Order by execution sequence.
- End with:
  - `npm run check`
  - `npm run build`

## Done criteria

Before coding, the spec must include:

- clear goal/scope
- implementation steps
- measurable acceptance criteria
- explicit open questions
