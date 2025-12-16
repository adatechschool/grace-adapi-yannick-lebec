import express from "express";
import pool from "./db.js";
import usersRouter from "./routes/users.js";

const app = express();
app.use(express.json());

// logger
app.use((req, _res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// route racine
app.get("/", (_req, res) => res.json({ message: "API OK ✅" }));

// ✅ branchement du router users
app.use("/users", usersRouter);

// ton endpoint tables (si tu veux le garder)
app.get("/tables", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des tables" });
  }
});

// 404
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`))