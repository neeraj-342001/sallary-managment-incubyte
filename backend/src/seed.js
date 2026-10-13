import { FX_RATES } from "./fx.js";
import { defaultDbPath, openDb } from "./db.js";
import { COUNTRIES, DEPARTMENTS, FIRST_NAMES, LAST_NAMES } from "./seedData.js";

function mulberry32(seed) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rand, list) {
  return list[Math.floor(rand() * list.length)];
}

function salaryFor(rand, min, max) {
  const value = min + rand() * (max - min);
  return Math.round(value / 100) * 100;
}

export function seedDatabase(db, { count = 10000, seed = 42 } = {}) {
  const rand = mulberry32(seed);
  const departments = Object.keys(DEPARTMENTS);
  const now = new Date().toISOString();

  const insertFx = db.prepare("INSERT OR REPLACE INTO fx_rates (currency, usd_per_unit) VALUES (?, ?)");
  const insertEmp = db.prepare(`
    INSERT INTO employees (
      employee_code, first_name, last_name, email, department, job_title,
      country, currency, annual_salary, status, hire_date, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const run = db.transaction(() => {
    db.exec("DELETE FROM salary_history");
    db.exec("DELETE FROM employees");
    db.exec("DELETE FROM fx_rates");

    for (const [currency, usdPerUnit] of Object.entries(FX_RATES)) {
      insertFx.run(currency, usdPerUnit);
    }

    for (let i = 1; i <= count; i++) {
      const loc = pick(rand, COUNTRIES);
      const department = pick(rand, departments);
      const jobTitle = pick(rand, DEPARTMENTS[department]);
      const firstName = pick(rand, FIRST_NAMES);
      const lastName = pick(rand, LAST_NAMES);
      const code = `ACME-${String(i).padStart(5, "0")}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@acme.example`;
      const year = 2014 + Math.floor(rand() * 12);
      const month = String(1 + Math.floor(rand() * 12)).padStart(2, "0");
      const day = String(1 + Math.floor(rand() * 28)).padStart(2, "0");
      const status = rand() < 0.07 ? "inactive" : "active";

      insertEmp.run(
        code,
        firstName,
        lastName,
        email,
        department,
        jobTitle,
        loc.country,
        loc.currency,
        salaryFor(rand, loc.min, loc.max),
        status,
        `${year}-${month}-${day}`,
        now
      );
    }
  });

  run();
  return db.prepare("SELECT COUNT(*) AS n FROM employees").get().n;
}

const isMain = process.argv[1]?.endsWith("seed.js");
if (isMain) {
  const db = openDb();
  const n = seedDatabase(db, { count: Number(process.env.SEED_COUNT) || 10000 });
  console.log(`Seeded ${n} employees into ${defaultDbPath()}`);
  db.close();
}
