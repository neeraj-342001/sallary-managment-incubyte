function round(n) {
  return Math.round(n * 100) / 100;
}

export function getInsights(db) {
  const totals = db
    .prepare(
      `SELECT
         COUNT(*) AS headcount,
         SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS activeCount,
         SUM(CASE WHEN status = 'active' THEN e.annual_salary * f.usd_per_unit ELSE 0 END) AS activePayrollUsd,
         AVG(CASE WHEN status = 'active' THEN e.annual_salary * f.usd_per_unit END) AS avgUsd
       FROM employees e
       JOIN fx_rates f ON f.currency = e.currency`
    )
    .get();

  const medianRow = db
    .prepare(
      `SELECT AVG(usd_salary) AS medianUsd FROM (
         SELECT e.annual_salary * f.usd_per_unit AS usd_salary
         FROM employees e
         JOIN fx_rates f ON f.currency = e.currency
         WHERE e.status = 'active'
         ORDER BY usd_salary
         LIMIT 2 - (SELECT COUNT(*) FROM employees WHERE status = 'active') % 2
         OFFSET (
           SELECT (COUNT(*) - 1) / 2 FROM employees WHERE status = 'active'
         )
       )`
    )
    .get();

  const byCountry = db
    .prepare(
      `SELECT e.country,
              COUNT(*) AS headcount,
              SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) AS activeCount,
              SUM(CASE WHEN e.status = 'active' THEN e.annual_salary * f.usd_per_unit ELSE 0 END) AS payrollUsd,
              AVG(CASE WHEN e.status = 'active' THEN e.annual_salary * f.usd_per_unit END) AS avgUsd
       FROM employees e
       JOIN fx_rates f ON f.currency = e.currency
       GROUP BY e.country
       ORDER BY payrollUsd DESC`
    )
    .all();

  const byDepartment = db
    .prepare(
      `SELECT e.department,
              COUNT(*) AS headcount,
              SUM(CASE WHEN e.status = 'active' THEN e.annual_salary * f.usd_per_unit ELSE 0 END) AS payrollUsd,
              AVG(CASE WHEN e.status = 'active' THEN e.annual_salary * f.usd_per_unit END) AS avgUsd
       FROM employees e
       JOIN fx_rates f ON f.currency = e.currency
       GROUP BY e.department
       ORDER BY payrollUsd DESC`
    )
    .all();

  const byCurrency = db
    .prepare(
      `SELECT e.currency,
              COUNT(*) AS headcount,
              SUM(CASE WHEN e.status = 'active' THEN e.annual_salary ELSE 0 END) AS payrollLocal,
              SUM(CASE WHEN e.status = 'active' THEN e.annual_salary * f.usd_per_unit ELSE 0 END) AS payrollUsd
       FROM employees e
       JOIN fx_rates f ON f.currency = e.currency
       GROUP BY e.currency
       ORDER BY payrollUsd DESC`
    )
    .all();

  const topEarners = db
    .prepare(
      `SELECT e.id, e.employee_code AS employeeCode, e.first_name AS firstName,
              e.last_name AS lastName, e.department, e.country, e.currency,
              e.annual_salary AS annualSalary,
              e.annual_salary * f.usd_per_unit AS usdSalary
       FROM employees e
       JOIN fx_rates f ON f.currency = e.currency
       WHERE e.status = 'active'
       ORDER BY usdSalary DESC
       LIMIT 10`
    )
    .all();

  return {
    headcount: totals.headcount ?? 0,
    activeCount: totals.activeCount ?? 0,
    activePayrollUsd: round(totals.activePayrollUsd ?? 0),
    averageSalaryUsd: round(totals.avgUsd ?? 0),
    medianSalaryUsd: round(medianRow.medianUsd ?? 0),
    byCountry: byCountry.map((r) => ({
      ...r,
      payrollUsd: round(r.payrollUsd ?? 0),
      avgUsd: round(r.avgUsd ?? 0),
    })),
    byDepartment: byDepartment.map((r) => ({
      ...r,
      payrollUsd: round(r.payrollUsd ?? 0),
      avgUsd: round(r.avgUsd ?? 0),
    })),
    byCurrency: byCurrency.map((r) => ({
      ...r,
      payrollLocal: round(r.payrollLocal ?? 0),
      payrollUsd: round(r.payrollUsd ?? 0),
    })),
    topEarners: topEarners.map((r) => ({
      ...r,
      usdSalary: round(r.usdSalary),
    })),
  };
}
