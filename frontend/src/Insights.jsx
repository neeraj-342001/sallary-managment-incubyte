import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "./api.js";
import { money, number } from "./format.js";

export default function Insights({ onOpenEmployee }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .insights()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="muted">Loading insights…</p>;

  return (
    <section>
      <header className="page-head">
        <div>
          <h1>How ACME pays people</h1>
          <p>Active payroll converted to USD for a single org-wide view.</p>
        </div>
      </header>

      <div className="kpis">
        <article>
          <span>Headcount</span>
          <strong>{number(data.headcount)}</strong>
          <em>{number(data.activeCount)} active</em>
        </article>
        <article>
          <span>Active payroll (USD)</span>
          <strong>{money(data.activePayrollUsd)}</strong>
          <em>Indicative, static FX</em>
        </article>
        <article>
          <span>Average salary (USD)</span>
          <strong>{money(data.averageSalaryUsd)}</strong>
          <em>Active employees</em>
        </article>
        <article>
          <span>Median salary (USD)</span>
          <strong>{money(data.medianSalaryUsd)}</strong>
          <em>Active employees</em>
        </article>
      </div>

      <div className="grid-2">
        <article className="card">
          <h2>Payroll by department</h2>
          <div className="chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.byDepartment} layout="vertical" margin={{ left: 24, right: 16 }}>
                <XAxis type="number" tickFormatter={(v) => `${Math.round(v / 1e6)}M`} />
                <YAxis type="category" dataKey="department" width={110} />
                <Tooltip formatter={(v) => money(v)} />
                <Bar dataKey="payrollUsd" fill="#1f4d3a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="card">
          <h2>Payroll by country</h2>
          <div className="chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.byCountry.slice(0, 8)} margin={{ left: 8, right: 8 }}>
                <XAxis dataKey="country" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={70} />
                <YAxis tickFormatter={(v) => `${Math.round(v / 1e6)}M`} />
                <Tooltip formatter={(v) => money(v)} />
                <Bar dataKey="payrollUsd" fill="#2f6f9f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="grid-2">
        <article className="card">
          <h2>Currency mix</h2>
          <table>
            <thead>
              <tr>
                <th>Currency</th>
                <th>People</th>
                <th>Local payroll</th>
                <th>USD</th>
              </tr>
            </thead>
            <tbody>
              {data.byCurrency.map((row) => (
                <tr key={row.currency}>
                  <td>{row.currency}</td>
                  <td>{number(row.headcount)}</td>
                  <td>{money(row.payrollLocal, row.currency)}</td>
                  <td>{money(row.payrollUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
        <article className="card">
          <h2>Highest USD salaries (active)</h2>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Dept</th>
                <th>USD</th>
              </tr>
            </thead>
            <tbody>
              {data.topEarners.map((row) => (
                <tr key={row.id} className="clickable" onClick={() => onOpenEmployee(row.id)}>
                  <td>
                    {row.firstName} {row.lastName}
                    <div className="tiny">{row.country}</div>
                  </td>
                  <td>{row.department}</td>
                  <td>{money(row.usdSalary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>
    </section>
  );
}
