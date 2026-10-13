import { openDb } from "./db.js";
import { createApp } from "./app.js";
import { seedDatabase } from "./seed.js";

const db = openDb();
const existing = db.prepare("SELECT COUNT(*) AS n FROM employees").get().n;
if (existing === 0) {
  const n = seedDatabase(db, { count: Number(process.env.SEED_COUNT) || 10000 });
  console.log(`Empty database — seeded ${n} employees`);
}
const app = createApp(db);
const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`ACME salary API listening on http://localhost:${port}`);
});
