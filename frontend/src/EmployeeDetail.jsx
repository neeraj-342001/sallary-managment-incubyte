import { useEffect, useState } from "react";
import { api } from "./api.js";
import { money } from "./format.js";

export default function EmployeeDetail({ id, onBack }) {
  const [employee, setEmployee] = useState(null);
  const [annualSalary, setAnnualSalary] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .employee(id)
      .then((e) => {
        setEmployee(e);
        setAnnualSalary(String(e.annualSalary));
        setReason("");
        setError("");
      })
      .catch((e) => setError(e.message));
  }, [id]);

  async function onSubmit(ev) {
    ev.preventDefault();
    setSaving(true);
    setError("");
    try {
      const updated = await api.updateSalary(id, {
        annualSalary: Number(annualSalary),
        reason,
      });
      setEmployee(updated);
      setAnnualSalary(String(updated.annualSalary));
      setReason("");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (!employee && !error) return <p className="muted">Loading employee…</p>;
  if (!employee) return <p className="error">{error}</p>;

  return (
    <section>
      <button className="link" onClick={onBack}>
        ← Back to directory
      </button>
      <header className="page-head">
        <div>
          <h1>
            {employee.firstName} {employee.lastName}
          </h1>
          <p>
            {employee.jobTitle} · {employee.department} · {employee.employeeCode}
          </p>
        </div>
        <span className={`pill ${employee.status}`}>{employee.status}</span>
      </header>

      <div className="grid-2">
        <article className="card">
          <h2>Current compensation</h2>
          <dl className="facts">
            <div>
              <dt>Country</dt>
              <dd>{employee.country}</dd>
            </div>
            <div>
              <dt>Hire date</dt>
              <dd>{employee.hireDate}</dd>
            </div>
            <div>
              <dt>Annual salary</dt>
              <dd>{money(employee.annualSalary, employee.currency)}</dd>
            </div>
            <div>
              <dt>USD equivalent</dt>
              <dd>{money(employee.usdSalary)}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{employee.email}</dd>
            </div>
          </dl>

          <form className="salary-form" onSubmit={onSubmit}>
            <h3>Update annual salary</h3>
            <p className="muted">Amount stays in {employee.currency}. A reason is required for the audit trail.</p>
            <label>
              New annual salary ({employee.currency})
              <input
                type="number"
                min="1"
                step="1"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(e.target.value)}
                required
              />
            </label>
            <label>
              Reason
              <textarea
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Promotion to Senior Engineer, effective April"
                required
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button className="btn" disabled={saving}>
              {saving ? "Saving…" : "Save salary change"}
            </button>
          </form>
        </article>

        <article className="card">
          <h2>Salary history</h2>
          {employee.history.length === 0 ? (
            <p className="muted">No changes recorded yet. Seeded pay is the starting point.</p>
          ) : (
            <ol className="timeline">
              {employee.history.map((h) => (
                <li key={h.id}>
                  <strong>
                    {money(h.previousSalary, h.currency)} → {money(h.newSalary, h.currency)}
                  </strong>
                  <p>{h.reason}</p>
                  <time>{new Date(h.changedAt).toLocaleString()}</time>
                </li>
              ))}
            </ol>
          )}
        </article>
      </div>
    </section>
  );
}
