# Architecture

```
HR browser
    │
    ▼
React (Vite)  ──REST/JSON──►  Express API
                                  │
                                  ▼
                             SQLite (WAL)
                     employees | salary_history | fx_rates
```

In production the API also serves the built UI so one process can be deployed.

## Why this shape

- **One relational database.** Employees, history, and FX rates have clear relationships. SQLite is named in the brief, needs no server, and 10k rows is well within it. WAL + indexes keep list/filter/insights fast on a laptop.
- **Thin HTTP API + domain services.** Routes parse HTTP; `employeeService` / `insightsService` hold rules (validation, history writes, aggregations). Tests hit services with an in-memory DB.
- **USD is a reporting currency only.** Stored salary stays local. Insights multiply by `fx_rates.usd_per_unit` so India INR and US USD can sit on one dashboard.

## Data model

**employees** — current truth: identity, org placement, `annual_salary`, `currency`, `status`.

**salary_history** — append-only: old/new amount, currency, reason, timestamp. No updates/deletes in v1.

**fx_rates** — `currency → usd_per_unit`. Seeded, not live.

Indexes: `country`, `department`, `status`, `email`, `employee_code`, `last_name`.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Deploy check |
| GET | `/api/meta` | Distinct countries, departments, currencies |
| GET | `/api/employees` | Paginated search/filter/sort |
| GET | `/api/employees/:id` | Detail + history |
| PATCH | `/api/employees/:id/salary` | `{ annualSalary, reason }` |
| GET | `/api/insights` | KPIs + grouped payroll |
| GET | `/api/employees/export.csv` | Same filters as the list |

## Performance (10k)

- List is **always paginated** (default 25). Never send 10k rows to the browser.
- Aggregations are SQL `GROUP BY`, not JS loops over the full table.
- Seed uses a single transaction + prepared inserts.

## What we did not add

No Redis, ORM, or microservice split. Extra moving parts would not earn their complexity at this size.
