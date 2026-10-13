# ACME Salary Management

Web app for ACME’s HR manager to manage salaries for 10,000 employees and answer how the org pays people — without Excel.

This is the Incubyte take-home assessment (Software Craftsperson / Java / Angular II). Stack is **Node.js + React + SQLite** so a full product could be built quickly. The same domain model would map to Java/Angular if that were the production standard.

## Product

See [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) for scope, out-of-scope, and why.

HR can:

- Browse a paginated directory (search, country, department, status)
- Open an employee and change annual salary with a mandatory reason
- See append-only salary history
- View USD-normalized payroll insights (static FX rates)
- Export the current filtered list as CSV

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/TRADEOFFS.md](docs/TRADEOFFS.md).

```
React (Vite)  →  Express  →  SQLite
```

## Run locally

Requires Node.js 20+.

```bash
npm run install:all
npm test
npm run seed          # 10,000 employees into backend/data/acme.sqlite
npm run dev:api       # http://localhost:4000
npm run dev:ui        # http://localhost:5173 (proxies /api)
```

First API start also seeds if the database is empty.

## Tests

```bash
npm test
```

Service tests use an in-memory SQLite database: list pagination, search/filter, salary validation + history, USD payroll math.

## Deploy

Build the UI, then run one Node process (API serves `frontend/dist`):

```bash
npm run install:all
npm run build
npm start
```

Set `PORT` and optional `SQLITE_PATH`. On a host with a persistent disk, point `SQLITE_PATH` at that disk so seed data survives restarts.

## Artifacts

- [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/TRADEOFFS.md](docs/TRADEOFFS.md)
- [docs/AI_WORKFLOW.md](docs/AI_WORKFLOW.md)
