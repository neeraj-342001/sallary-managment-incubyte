# Trade-offs

## Node.js + React vs Java + Angular

The role is Java/Angular. This submission uses **Node.js + React** because the brief allows another stack, and speed-to-a-working product matters for a take-home. Domain model, SQL, tests, and product cuts are the signal; the language is not.

If ACME’s production standard is Java, the same schema and API contract would port to Spring without changing the product.

## SQLite vs Postgres

**SQLite.** Zero ops, file-backed, excellent for 10k rows, easy CI (in-memory). Weakness: one-writer-at-a-time — fine for a single HR manager. Move to Postgres if ACME adds concurrent HR users or a payroll integration.

## Static FX vs live rates

**Static seeded rates.** Insights stay deterministic and testable. HR should treat USD totals as **indicative**, not treasury-grade. A later version can swap the `fx_rates` table for a dated feed without changing employees.

## One current salary vs compensation components

**One annual cash number.** Matches Excel mental model. Bonuses/equity would need a different schema and UI; including them half-done would make numbers look complete when they are not.

## No auth

**Skipped.** Would consume the assessment without showing salary-domain judgment. Production would need SSO and audit of *who* changed pay (history today records *what* and *why*, not identity).

## Pagination vs virtualized 10k table

**Server pagination.** Simpler, less RAM in the browser, works on slow machines. Virtualization is better for “scroll the whole company”; HR’s job is usually find-and-act, not scroll.
