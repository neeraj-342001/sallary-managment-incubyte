import assert from "node:assert/strict";
import { test } from "node:test";
import { createDb } from "../src/db.js";
import { FX_RATES, toUsd } from "../src/fx.js";
import { getInsights } from "../src/services/insightsService.js";

test("toUsd converts with the seeded static rate", () => {
  assert.equal(toUsd(100, "USD"), 100);
  assert.equal(toUsd(100, "INR"), 1.2);
  assert.throws(() => toUsd(1, "XXX"), /Unknown currency/);
});

test("insights payroll in USD matches SUM of active local * fx", () => {
  const db = createDb(":memory:");
  db.prepare("INSERT INTO fx_rates (currency, usd_per_unit) VALUES (?, ?)").run("USD", FX_RATES.USD);
  db.prepare("INSERT INTO fx_rates (currency, usd_per_unit) VALUES (?, ?)").run("INR", FX_RATES.INR);

  const insert = db.prepare(`
    INSERT INTO employees (
      employee_code, first_name, last_name, email, department, job_title,
      country, currency, annual_salary, status, hire_date, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const now = "2026-01-01T00:00:00.000Z";
  insert.run("A-1", "A", "One", "a@x.com", "Engineering", "Engineer", "United States", "USD", 100000, "active", "2020-01-01", now);
  insert.run("A-2", "B", "Two", "b@x.com", "Engineering", "Engineer", "India", "INR", 2000000, "active", "2020-01-01", now);
  insert.run("A-3", "C", "Three", "c@x.com", "Sales", "SDR", "United States", "USD", 80000, "inactive", "2020-01-01", now);

  const insights = getInsights(db);
  assert.equal(insights.headcount, 3);
  assert.equal(insights.activeCount, 2);
  assert.equal(insights.activePayrollUsd, 100000 + 2000000 * FX_RATES.INR);
  assert.equal(insights.byDepartment.find((d) => d.department === "Engineering").headcount, 2);
  assert.equal(insights.byCountry.find((c) => c.country === "India").payrollUsd, 24000);
  assert.equal(insights.topEarners[0].employeeCode, "A-1");
});
