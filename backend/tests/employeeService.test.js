import assert from "node:assert/strict";
import { test } from "node:test";
import { createDb } from "../src/db.js";
import { seedDatabase } from "../src/seed.js";
import {
  getEmployee,
  listEmployees,
  updateSalary,
} from "../src/services/employeeService.js";

function setup(count = 40) {
  const db = createDb(":memory:");
  seedDatabase(db, { count, seed: 7 });
  return db;
}

test("lists a page of employees, never the full table", () => {
  const db = setup(40);
  const result = listEmployees(db, { page: 1, pageSize: 10 });
  assert.equal(result.data.length, 10);
  assert.equal(result.total, 40);
  assert.equal(result.totalPages, 4);
});

test("search matches name or employee code", () => {
  const db = setup(40);
  const byCode = listEmployees(db, { q: "ACME-00001" });
  assert.equal(byCode.total, 1);
  assert.equal(byCode.data[0].employeeCode, "ACME-00001");
});

test("filter by country reduces the result set", () => {
  const db = setup(40);
  const all = listEmployees(db, { pageSize: 100 });
  const country = all.data[0].country;
  const filtered = listEmployees(db, { country, pageSize: 100 });
  assert.ok(filtered.total < all.total);
  assert.ok(filtered.data.every((e) => e.country === country));
});

test("updateSalary writes history and changes current pay", () => {
  const db = setup(5);
  const before = getEmployee(db, 1);
  const updated = updateSalary(db, 1, {
    annualSalary: before.annualSalary + 1000,
    reason: "Annual market adjustment",
  });
  assert.equal(updated.annualSalary, before.annualSalary + 1000);
  assert.equal(updated.history.length, 1);
  assert.equal(updated.history[0].previousSalary, before.annualSalary);
  assert.match(updated.history[0].reason, /market/);
});

test("updateSalary rejects invalid payloads", () => {
  const db = setup(3);
  assert.throws(() => updateSalary(db, 1, { annualSalary: -1, reason: "raise" }), /greater than 0/);
  assert.throws(() => updateSalary(db, 1, { annualSalary: 90000, reason: "no" }), /at least 5/);
  assert.throws(() => updateSalary(db, 9999, { annualSalary: 90000, reason: "valid reason" }), /not found/);
});

test("updateSalary rejects an unchanged amount", () => {
  const db = setup(3);
  const current = getEmployee(db, 1);
  assert.throws(
    () => updateSalary(db, 1, { annualSalary: current.annualSalary, reason: "same number" }),
    /same as the current/
  );
});
