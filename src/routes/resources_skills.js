import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /resources-skills
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM resources_skills ORDER BY resource_id, skill_id"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

// GET /resources-skills/:resourceId/:skillId
router.get("/:resourceId/:skillId", async (req, res) => {
  const resourceId = Number(req.params.resourceId);
  const skillId = Number(req.params.skillId);

  if (Number.isNaN(resourceId) || Number.isNaN(skillId)) {
    return res.status(400).json({ error: "Invalid ids" });
  }

  try {
    const { rows, rowCount } = await pool.query(
      "SELECT * FROM resources_skills WHERE resource_id = $1 AND skill_id = $2",
      [resourceId, skillId]
    );
    if (rowCount === 0) return res.status(404).json({ error: "Link not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

// POST /resources-skills
// body: { "resource_id": 1, "skill_id": 2 }
router.post("/", async (req, res) => {
  const resourceId = Number(req.body?.resource_id);
  const skillId = Number(req.body?.skill_id);

  if (Number.isNaN(resourceId) || Number.isNaN(skillId)) {
    return res.status(400).json({ error: "resource_id and skill_id must be numbers" });
  }

  try {
    const { rows, rowCount } = await pool.query(
      `
      INSERT INTO resources_skills (resource_id, skill_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *
      `,
      [resourceId, skillId]
    );

    if (rowCount === 0) return res.status(200).json({ message: "Link already exists" });
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

// DELETE /resources-skills/:resourceId/:skillId
router.delete("/:resourceId/:skillId", async (req, res) => {
  const resourceId = Number(req.params.resourceId);
  const skillId = Number(req.params.skillId);

  if (Number.isNaN(resourceId) || Number.isNaN(skillId)) {
    return res.status(400).json({ error: "Invalid ids" });
  }

  try {
    const { rows, rowCount } = await pool.query(
      `
      DELETE FROM resources_skills
      WHERE resource_id = $1 AND skill_id = $2
      RETURNING *
      `,
      [resourceId, skillId]
    );

    if (rowCount === 0) return res.status(404).json({ error: "Link not found" });
    res.json({ message: "Link supprimé ✅", link: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;