import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import {
  exportCsv,
  getEmployee,
  getMeta,
  listEmployees,
  updateSalary,
} from "./services/employeeService.js";
import { getInsights } from "./services/insightsService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(db) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/meta", (_req, res) => {
    res.json(getMeta(db));
  });

  app.get("/api/insights", (_req, res) => {
    res.json(getInsights(db));
  });

  app.get("/api/employees/export.csv", (req, res) => {
    const csv = exportCsv(db, req.query);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=acme-employees.csv");
    res.send(csv);
  });

  app.get("/api/employees", (req, res) => {
    res.json(listEmployees(db, req.query));
  });

  app.get("/api/employees/:id", (req, res, next) => {
    try {
      res.json(getEmployee(db, Number(req.params.id)));
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/employees/:id/salary", (req, res, next) => {
    try {
      res.json(updateSalary(db, Number(req.params.id), req.body ?? {}));
    } catch (err) {
      next(err);
    }
  });

  const uiDir = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(uiDir));
  app.get(/^(?!\/api).*/, (req, res, next) => {
    res.sendFile(path.join(uiDir, "index.html"), (err) => {
      if (err) next();
    });
  });

  app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Unexpected error" });
  });

  return app;
}
