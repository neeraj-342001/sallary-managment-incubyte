import { useEffect, useState } from "react";
import { api } from "./api.js";
import Insights from "./Insights.jsx";
import EmployeeDirectory from "./EmployeeDirectory.jsx";
import EmployeeDetail from "./EmployeeDetail.jsx";

export default function App() {
  const [view, setView] = useState("insights");
  const [selectedId, setSelectedId] = useState(null);
  const [meta, setMeta] = useState({ countries: [], departments: [] });

  useEffect(() => {
    api.meta().then(setMeta).catch(() => {});
  }, []);

  function openEmployee(id) {
    setSelectedId(id);
    setView("detail");
  }

  return (
    <div className="shell">
      <aside className="nav">
        <div className="brand">
          <span className="mark">ACME</span>
          <div>
            <strong>Salary Management</strong>
            <p>HR workspace</p>
          </div>
        </div>
        <button className={view === "insights" ? "active" : ""} onClick={() => setView("insights")}>
          Pay insights
        </button>
        <button
          className={view === "employees" || view === "detail" ? "active" : ""}
          onClick={() => setView("employees")}
        >
          Employee directory
        </button>
        <p className="nav-note">
          USD figures use static FX rates for comparison. Stored salaries stay in local currency.
        </p>
      </aside>

      <main>
        {view === "insights" && <Insights onOpenEmployee={openEmployee} />}
        {view === "employees" && (
          <EmployeeDirectory meta={meta} onOpenEmployee={openEmployee} />
        )}
        {view === "detail" && selectedId && (
          <EmployeeDetail
            id={selectedId}
            onBack={() => setView("employees")}
            onSaved={() => {}}
          />
        )}
      </main>
    </div>
  );
}
