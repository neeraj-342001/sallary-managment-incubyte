import { useEffect, useState } from "react";
import { api } from "./api.js";
import { money, number } from "./format.js";

const emptyFilters = {
  q: "",
  country: "",
  department: "",
  status: "active",
  sort: "last_name",
  dir: "asc",
  page: 1,
  pageSize: 25,
};

export default function EmployeeDirectory({ meta, onOpenEmployee }) {
  const [filters, setFilters] = useState(emptyFilters);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      api
        .employees(filters)
        .then(setResult)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [filters]);

  function setField(key, value) {
    setFilters((f) => ({ ...f, [key]: value, page: key === "page" ? value : 1 }));
  }

  return (
    <section>
      <header className="page-head">
        <div>
          <h1>Employee directory</h1>
          <p>Search 10,000 people without opening a spreadsheet.</p>
        </div>
        <a className="btn secondary" href={api.exportUrl(filters)}>
          Export CSV
        </a>
      </header>

      <div className="filters">
        <input
          placeholder="Search name, email, code, title"
          value={filters.q}
          onChange={(e) => setField("q", e.target.value)}
        />
        <select value={filters.country} onChange={(e) => setField("country", e.target.value)}>
          <option value="">All countries</option>
          {meta.countries.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select value={filters.department} onChange={(e) => setField("department", e.target.value)}>
          <option value="">All departments</option>
          {meta.departments.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select value={filters.status} onChange={(e) => setField("status", e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <article className="card">
        <div className="table-meta">
          <span>{result ? `${number(result.total)} people` : "…"}</span>
          {loading && <span className="muted">Updating…</span>}
        </div>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Department</th>
              <th>Country</th>
              <th>Local salary</th>
              <th>USD</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {result?.data.map((e) => (
              <tr key={e.id} className="clickable" onClick={() => onOpenEmployee(e.id)}>
                <td>{e.employeeCode}</td>
                <td>
                  {e.firstName} {e.lastName}
                  <div className="tiny">{e.email}</div>
                </td>
                <td>
                  {e.department}
                  <div className="tiny">{e.jobTitle}</div>
                </td>
                <td>{e.country}</td>
                <td>{money(e.annualSalary, e.currency)}</td>
                <td>{money(e.usdSalary)}</td>
                <td>
                  <span className={`pill ${e.status}`}>{e.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pager">
          <button disabled={!result || result.page <= 1} onClick={() => setField("page", filters.page - 1)}>
            Previous
          </button>
          <span>
            Page {result?.page ?? 1} of {result?.totalPages ?? 1}
          </span>
          <button
            disabled={!result || result.page >= result.totalPages}
            onClick={() => setField("page", filters.page + 1)}
          >
            Next
          </button>
        </div>
      </article>
    </section>
  );
}
