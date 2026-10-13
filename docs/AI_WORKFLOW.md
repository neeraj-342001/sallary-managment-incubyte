# AI workflow (this assessment)

AI was used as an **implementation accelerator**, not as the decision maker.

## What I decided without the model

- Product cut: directory + salary update with history + insights; not payroll, not auth.
- SQLite as the system of record; USD only for reporting.
- Paginated list; aggregations in SQL.
- Node + React for delivery speed (role is Java/Angular; brief allows choice).

## What I used AI for

- Drafting the one-page requirements and architecture notes from those decisions.
- Scaffolding Express routes, React screens, and seed data.
- Generating unit tests around validation and insights.
- Boilerplate (Vite config, CSS layout).

## How I kept quality

- Domain rules live in small services and are tested against an in-memory SQLite DB — not only through the UI.
- After generation I read salary update + insights SQL myself: history must be append-only; list must never return 10k rows.
- Seed is transactional so a failed seed cannot leave a half-file.

## Prompts / instructions (representative)

1. “Write a one-page requirements doc for HR salary management: 10k employees, multi-country. Include in-scope, out-of-scope, and why.”
2. “Design a SQLite schema and REST API for directory, salary patch with reason, and grouped payroll insights in USD.”
3. “Implement Express + React; paginate employees; seed 10k; unit-test salary validation and insights.”
4. “Do not add auth, payroll, or live FX. Keep the design boring and maintainable.”

I treated AI output as a first draft: I cut features that were impressive but out of scope (approvals, live FX, bulk upload).
