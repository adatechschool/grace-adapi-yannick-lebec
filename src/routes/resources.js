import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /resources  -> toutes les ressources
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM resources ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

// GET /resources/:id -> une ressource
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  try {
    const { rows, rowCount } = await pool.query("SELECT * FROM resources WHERE id = $1", [id]);
    if (rowCount === 0) return res.status(404).json({ error: "Resource not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

// POST /resources -> créer une ressource (data venant du body)
router.post("/", async (req, res) => {
  const { title, url, description = null, theme_id, type, is_ada } = req.body ?? {};

  if (!title || !url || theme_id === undefined || !type || typeof is_ada !== "boolean") {
    return res.status(400).json({
      error: "Body attendu: { title, url, description?, theme_id, type, is_ada }",
    });
  }

  try {
    const { rows } = await pool.query(
      `
      INSERT INTO resources (title, url, description, theme_id, type, is_ada, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())
      RETURNING *
      `,
      [title, url, description, Number(theme_id), type, is_ada]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

// PUT /resources/:id -> modifier une ressource
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const { title, url, description, theme_id, type, is_ada } = req.body ?? {};

  try {
    const { rows, rowCount } = await pool.query(
      `
      UPDATE resources
      SET
        title = COALESCE($1, title),
        url = COALESCE($2, url),
        description = COALESCE($3, description),
        theme_id = COALESCE($4, theme_id),
        type = COALESCE($5, type),
        is_ada = COALESCE($6, is_ada),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
      `,
      [
        title ?? null,
        url ?? null,
        description ?? null,
        theme_id !== undefined ? Number(theme_id) : null,
        type ?? null,
        is_ada ?? null,
        id,
      ]
    );

    if (rowCount === 0) return res.status(404).json({ error: "Resource not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

// DELETE /resources/:id -> supprimer (et supprimer les liens)
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query("DELETE FROM resources_skills WHERE resource_id = $1", [id]);
    const deleted = await client.query("DELETE FROM resources WHERE id = $1 RETURNING *", [id]);

    await client.query("COMMIT");

    if (deleted.rowCount === 0) return res.status(404).json({ error: "Resource not found" });
    res.json({ message: `Resource ${id} supprimée ✅`, resource: deleted.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  } finally {
    client.release();
  }
});

export default router;