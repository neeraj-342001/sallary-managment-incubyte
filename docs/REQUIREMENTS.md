# ACME Salary Management — Requirements

**Product:** Web software for ACME’s HR manager to manage salary data for ~10,000 employees across countries, replacing Excel.

**Primary user:** HR Manager. Single operator in this version. Goal is to find people, keep salaries accurate, and answer “how does ACME pay people?” without spreadsheets.

## Goal

Give HR a fast, trustworthy system to:

1. Browse, search, and filter the employee directory.
2. View and update annual salary (with a written reason and an audit trail).
3. See org-level pay insights: headcount, payroll, averages, and breakdowns by country, department, and currency.

## In scope (v1)

| Feature | Why it matters |
|---|---|
| Employee directory with pagination, search (name, email, code), filters (country, department, status), sort | 10k rows cannot live in one Excel sheet; HR must find people in seconds |
| Employee detail: role, location, currency, salary, hire date | Context before changing pay |
| Update annual salary + mandatory reason; append-only salary history | Replaces informal Excel edits with accountability |
| Insights dashboard: KPIs and breakdowns | Answers “how the org pays people” |
| USD-normalized payroll using **static** FX rates | Cross-country comparison without a live FX dependency |
| Seed 10,000 employees across countries, departments, currencies | Matches ACME’s stated scale |
| CSV export of the current filtered list | Off-ramp for finance / offline review |

Salary is **annual cash compensation in the employee’s local currency**. One current salary per employee.

## Deliberately out of scope

| Left out | Reason |
|---|---|
| Login, SSO, RBAC | One HR persona; auth would dominate the take-home without proving salary-domain thinking |
| Payroll runs, tax, benefits, equity, bonuses, proration | Different product (payroll). HR asked to **manage salary data**, not run payroll |
| Live FX APIs | Flaky, billed, and not needed for a decision-support view; rates documented and seeded |
| Excel import / bulk upload | Risky without validation UX; directory + export is enough to leave Excel |
| Approval workflows / manager self-service | Process product, not data product |
| Historical org snapshots / fiscal-year budgets | Needs a dating model we are not claiming |
| Multi-tenant / multiple companies | ACME is one org |

If ACME later needs payroll or approvals, this app stays the **source of salary truth**, not a payroll engine.

## Success (HR)

- Open the app and see org pay health (headcount, payroll in USD, average) in one screen.
- Find an employee in < 3 seconds (search + filters) on 10k records.
- Change a salary, record why, and see previous amounts.
- Compare pay by country and department without building a pivot table.

## Non-goals for quality

Not the most complex architecture. Prefer a boring stack (Node + SQLite + React), indexed queries, and tests around salary updates and insights — the parts that would be wrong in Excel.
