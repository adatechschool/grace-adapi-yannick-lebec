import { Router } from "express";
import pool from "../db.js";

const router = Router();
const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

// GET /themes
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM themes ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

// GET /themes/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  try {
    const { rows, rowCount } = await pool.query("SELECT * FROM themes WHERE id = $1", [id]);
    if (rowCount === 0) return res.status(404).json({ error: "Theme not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

// POST /themes
router.post("/", async (req, res) => {
  const { name, description = null } = req.body ?? {};
  if (!isNonEmptyString(name)) return res.status(400).json({ error: "name is required" });

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO themes (name, description, created_at, updated_at)
      VALUES ($1,$2,NOW(),NOW())
      RETURNING *
      `,
      [name.trim(), description]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

// PUT /themes/:id
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const { name, description } = req.body ?? {};
  if (name !== undefined && !isNonEmptyString(name)) return res.status(400).json({ error: "Invalid name" });

  try {
    const { rows, rowCount } = await pool.query(
      `
      UPDATE themes
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
      `,
      [name?.trim() ?? null, description ?? null, id]
    );

    if (rowCount === 0) return res.status(404).json({ error: "Theme not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

// DELETE /themes/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  try {
    const { rows, rowCount } = await pool.query("DELETE FROM themes WHERE id = $1 RETURNING *", [id]);
    if (rowCount === 0) return res.status(404).json({ error: "Theme not found" });
    res.json({ message: `Theme ${id} supprimé ✅`, theme: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;