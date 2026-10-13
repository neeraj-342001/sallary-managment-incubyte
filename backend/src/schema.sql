CREATE TABLE IF NOT EXISTS fx_rates (
  currency TEXT PRIMARY KEY,
  usd_per_unit REAL NOT NULL CHECK (usd_per_unit > 0)
);

CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_code TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  job_title TEXT NOT NULL,
  country TEXT NOT NULL,
  currency TEXT NOT NULL,
  annual_salary REAL NOT NULL CHECK (annual_salary > 0),
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  hire_date TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (currency) REFERENCES fx_rates(currency)
);

CREATE TABLE IF NOT EXISTS salary_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  previous_salary REAL NOT NULL,
  new_salary REAL NOT NULL,
  currency TEXT NOT NULL,
  reason TEXT NOT NULL,
  changed_at TEXT NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE INDEX IF NOT EXISTS idx_employees_country ON employees(country);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_last_name ON employees(last_name);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_salary_history_employee ON salary_history(employee_id);
