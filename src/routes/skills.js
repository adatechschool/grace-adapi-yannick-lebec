import { Router } from "express";
import pool from "../db.js";

const router = Router();
const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

/**
 * @swagger
 * tags:
 *   - name: Skills
 *     description: Gestion des compétences
 */

router.get(
  "/",
  /**
   * @swagger
   * /skills:
   *   get:
   *     summary: Récupère toutes les compétences
   *     tags: [Skills]
   *     responses:
   *       200:
   *         description: Liste des compétences
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items: { $ref: '#/components/schemas/Skill' }
   */
  async (_req, res) => {
    try {
      const { rows } = await pool.query("SELECT * FROM skills ORDER BY id");
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal error" });
    }
  }
);

router.get(
  "/:id",
  /**
   * @swagger
   * /skills/{id}:
   *   get:
   *     summary: Récupère une compétence par ID
   *     tags: [Skills]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Compétence trouvée
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Skill' }
   *       400:
   *         description: ID invalide
   *       404:
   *         description: Introuvable
   */
  async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    try {
      const { rows, rowCount } = await pool.query("SELECT * FROM skills WHERE id = $1", [id]);
      if (rowCount === 0) return res.status(404).json({ error: "Skill not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal error" });
    }
  }
);

router.post(
  "/",
  /**
   * @swagger
   * /skills:
   *   post:
   *     summary: Crée une compétence
   *     tags: [Skills]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/SkillCreate' }
   *     responses:
   *       201:
   *         description: Compétence créée
   *       400:
   *         description: name manquant / vide
   */
  async (req, res) => {
    const { name } = req.body ?? {};
    if (!isNonEmptyString(name)) return res.status(400).json({ error: "name is required" });

    try {
      const { rows } = await pool.query(`INSERT INTO skills (name) VALUES ($1) RETURNING *`, [
        name.trim(),
      ]);
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal error" });
    }
  }
);

router.put(
  "/:id",
  /**
   * @swagger
   * /skills/{id}:
   *   put:
   *     summary: Met à jour une compétence (partiel)
   *     tags: [Skills]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/SkillUpdate' }
   *     responses:
   *       200:
   *         description: Compétence mise à jour
   *       400:
   *         description: ID invalide ou name invalide
   *       404:
   *         description: Introuvable
   */
  async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const { name } = req.body ?? {};
    if (name !== undefined && !isNonEmptyString(name))
      return res.status(400).json({ error: "Invalid name" });

    try {
      const { rows, rowCount } = await pool.query(
        `
        UPDATE skills
        SET name = COALESCE($1, name)
        WHERE id = $2
        RETURNING *
        `,
        [name?.trim() ?? null, id]
      );

      if (rowCount === 0) return res.status(404).json({ error: "Skill not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal error" });
    }
  }
);

router.delete(
  "/:id",
  /**
   * @swagger
   * /skills/{id}:
   *   delete:
   *     summary: Supprime une compétence
   *     tags: [Skills]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Compétence supprimée
   *       400:
   *         description: ID invalide
   *       404:
   *         description: Introuvable
   */
  async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    try {
      const { rows, rowCount } = await pool.query("DELETE FROM skills WHERE id = $1 RETURNING *", [
        id,
      ]);
      if (rowCount === 0) return res.status(404).json({ error: "Skill not found" });
      res.json({ message: `Skill ${id} supprimée ✅`, skill: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal error" });
    }
  }
);

export default router;