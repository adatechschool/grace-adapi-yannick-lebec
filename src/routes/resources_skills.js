import { Router } from "express";
import pool from "../db.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Resources-Skills
 *     description: Gestion des liens entre ressources et compétences
 */

/**
 * @swagger
 * /resources-skills:
 *   get:
 *     summary: Récupère tous les liens ressources-compétences
 *     tags: [Resources-Skills]
 *     responses:
 *       200:
 *         description: Liste des liens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/ResourceSkill' }
 */
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

/**
 * @swagger
 * /resources-skills/{resourceId}/{skillId}:
 *   get:
 *     summary: Récupère un lien ressource-compétence
 *     tags: [Resources-Skills]
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lien trouvé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ResourceSkill' }
 *       400:
 *         description: IDs invalides
 *       404:
 *         description: Lien introuvable
 */
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

/**
 * @swagger
 * /resources-skills:
 *   post:
 *     summary: Crée un lien entre une ressource et une compétence
 *     tags: [Resources-Skills]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ResourceSkillCreate' }
 *     responses:
 *       201:
 *         description: Lien créé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ResourceSkill' }
 *       200:
 *         description: Lien déjà existant
 *       400:
 *         description: IDs invalides
 */
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

/**
 * @swagger
 * /resources-skills/{resourceId}/{skillId}:
 *   delete:
 *     summary: Supprime un lien ressource-compétence
 *     tags: [Resources-Skills]
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lien supprimé
 *       400:
 *         description: IDs invalides
 *       404:
 *         description: Lien introuvable
 */
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