async function request(path, options) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  meta: () => request("/api/meta"),
  insights: () => request("/api/insights"),
  employees: (params) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null))
    );
    return request(`/api/employees?${qs}`);
  },
  employee: (id) => request(`/api/employees/${id}`),
  updateSalary: (id, payload) =>
    request(`/api/employees/${id}/salary`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  exportUrl: (params) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null))
    );
    return `/api/employees/export.csv?${qs}`;
  },
};
