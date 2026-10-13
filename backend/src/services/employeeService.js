const SORTABLE = new Set([
  "last_name",
  "first_name",
  "department",
  "country",
  "annual_salary",
  "hire_date",
  "employee_code",
]);

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function mapEmployee(row) {
  if (!row) return null;
  return {
    id: row.id,
    employeeCode: row.employee_code,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    department: row.department,
    jobTitle: row.job_title,
    country: row.country,
    currency: row.currency,
    annualSalary: row.annual_salary,
    status: row.status,
    hireDate: row.hire_date,
    updatedAt: row.updated_at,
    usdSalary: row.usd_salary ?? null,
  };
}

function filtersSql(query) {
  const clauses = [];
  const params = {};

  if (query.q) {
    clauses.push(
      `(first_name LIKE @q OR last_name LIKE @q OR email LIKE @q OR employee_code LIKE @q OR job_title LIKE @q)`
    );
    params.q = `%${query.q}%`;
  }
  if (query.country) {
    clauses.push("country = @country");
    params.country = query.country;
  }
  if (query.department) {
    clauses.push("department = @department");
    params.department = query.department;
  }
  if (query.status) {
    clauses.push("status = @status");
    params.status = query.status;
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

export function listEmployees(db, query = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 25));
  const sort = SORTABLE.has(query.sort) ? query.sort : "last_name";
  const dir = query.dir === "desc" ? "DESC" : "ASC";
  const { where, params } = filtersSql(query);

  const total = db.prepare(`SELECT COUNT(*) AS n FROM employees ${where}`).get(params).n;
  const rows = db
    .prepare(
      `SELECT e.*, e.annual_salary * f.usd_per_unit AS usd_salary
       FROM employees e
       JOIN fx_rates f ON f.currency = e.currency
       ${where}
       ORDER BY ${sort} ${dir}, id ASC
       LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit: pageSize, offset: (page - 1) * pageSize });

  return {
    data: rows.map(mapEmployee),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function getEmployee(db, id) {
  const row = db
    .prepare(
      `SELECT e.*, e.annual_salary * f.usd_per_unit AS usd_salary
       FROM employees e
       JOIN fx_rates f ON f.currency = e.currency
       WHERE e.id = ?`
    )
    .get(id);
  if (!row) throw httpError(404, "Employee not found");

  const history = db
    .prepare(
      `SELECT id, previous_salary AS previousSalary, new_salary AS newSalary,
              currency, reason, changed_at AS changedAt
       FROM salary_history
       WHERE employee_id = ?
       ORDER BY changed_at DESC, id DESC`
    )
    .all(id);

  return { ...mapEmployee(row), history };
}

export function updateSalary(db, id, { annualSalary, reason }) {
  const salary = Number(annualSalary);
  if (!Number.isFinite(salary) || salary <= 0) {
    throw httpError(400, "annualSalary must be a number greater than 0");
  }
  const trimmedReason = typeof reason === "string" ? reason.trim() : "";
  if (trimmedReason.length < 5) {
    throw httpError(400, "reason must be at least 5 characters");
  }

  const existing = db.prepare("SELECT * FROM employees WHERE id = ?").get(id);
  if (!existing) throw httpError(404, "Employee not found");
  if (existing.annual_salary === salary) {
    throw httpError(400, "New salary is the same as the current salary");
  }

  const now = new Date().toISOString();
  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO salary_history (employee_id, previous_salary, new_salary, currency, reason, changed_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, existing.annual_salary, salary, existing.currency, trimmedReason, now);

    db.prepare("UPDATE employees SET annual_salary = ?, updated_at = ? WHERE id = ?").run(
      salary,
      now,
      id
    );
  });
  tx();

  return getEmployee(db, id);
}

export function getMeta(db) {
  const countries = db
    .prepare("SELECT DISTINCT country FROM employees ORDER BY country")
    .all()
    .map((r) => r.country);
  const departments = db
    .prepare("SELECT DISTINCT department FROM employees ORDER BY department")
    .all()
    .map((r) => r.department);
  const currencies = db
    .prepare("SELECT currency, usd_per_unit AS usdPerUnit FROM fx_rates ORDER BY currency")
    .all();
  return { countries, departments, currencies };
}

export function exportCsv(db, query = {}) {
  const { where, params } = filtersSql(query);
  const rows = db
    .prepare(
      `SELECT e.*, e.annual_salary * f.usd_per_unit AS usd_salary
       FROM employees e
       JOIN fx_rates f ON f.currency = e.currency
       ${where}
       ORDER BY last_name ASC, id ASC`
    )
    .all(params);

  const header = [
    "employee_code",
    "first_name",
    "last_name",
    "email",
    "department",
    "job_title",
    "country",
    "currency",
    "annual_salary",
    "usd_salary",
    "status",
    "hire_date",
  ];

  const escape = (value) => {
    const s = String(value ?? "");
    if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
    return s;
  };

  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.employee_code,
        row.first_name,
        row.last_name,
        row.email,
        row.department,
        row.job_title,
        row.country,
        row.currency,
        row.annual_salary,
        Number(row.usd_salary).toFixed(2),
        row.status,
        row.hire_date,
      ]
        .map(escape)
        .join(",")
    );
  }
  return lines.join("\n");
}
