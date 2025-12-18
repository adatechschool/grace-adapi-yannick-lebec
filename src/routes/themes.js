import { Router } from "express";
import pool from "../db.js";

const router = Router();
const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

/**
 * @swagger
 * tags:
 *   - name: Themes
 *     description: Gestion des thèmes
 */

router.get(
  "/",
  /**
   * @swagger
   * /themes:
   *   get:
   *     summary: Récupère tous les thèmes
   *     tags: [Themes]
   *     responses:
   *       200:
   *         description: Liste des thèmes
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items: { $ref: '#/components/schemas/Theme' }
   *       500:
   *         description: Erreur serveur
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   */
  async (_req, res) => {
    try {
      const { rows } = await pool.query("SELECT * FROM themes ORDER BY id");
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
   * /themes/{id}:
   *   get:
   *     summary: Récupère un thème par ID
   *     tags: [Themes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Thème trouvé
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Theme' }
   *       400:
   *         description: ID invalide
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   *       404:
   *         description: Thème introuvable
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   */
  async (req, res) => {
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
  }
);

router.post(
  "/",
  /**
   * @swagger
   * /themes:
   *   post:
   *     summary: Crée un thème
   *     tags: [Themes]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/ThemeCreate' }
   *     responses:
   *       201:
   *         description: Thème créé
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Theme' }
   *       400:
   *         description: name manquant / vide
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   */
  async (req, res) => {
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
  }
);

router.put(
  "/:id",
  /**
   * @swagger
   * /themes/{id}:
   *   put:
   *     summary: Met à jour un thème (partiel)
   *     tags: [Themes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/ThemeUpdate' }
   *     responses:
   *       200:
   *         description: Thème mis à jour
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Theme' }
   *       400:
   *         description: ID invalide ou name invalide
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   *       404:
   *         description: Thème introuvable
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   */
  async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const { name, description } = req.body ?? {};
    if (name !== undefined && !isNonEmptyString(name))
      return res.status(400).json({ error: "Invalid name" });

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
  }
);

router.delete(
  "/:id",
  /**
   * @swagger
   * /themes/{id}:
   *   delete:
   *     summary: Supprime un thème
   *     tags: [Themes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Thème supprimé
   *       400:
   *         description: ID invalide
   *       404:
   *         description: Thème introuvable
   */
  async (req, res) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    try {
      const { rows, rowCount } = await pool.query("DELETE FROM themes WHERE id = $1 RETURNING *", [
        id,
      ]);
      if (rowCount === 0) return res.status(404).json({ error: "Theme not found" });
      res.json({ message: `Theme ${id} supprimé ✅`, theme: rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal error" });
    }
  }
);

export default router;