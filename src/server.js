import express from "express";
import pool from "./db.js";

const app = express();

app.get("/tables", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des tables" });
  }
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé : http://localhost:${PORT}`);
});