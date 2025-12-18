import { Router } from "express";
import pool from "../db.js";

const router = Router();

const ALLOWED_RESOURCE_TYPES = new Set(["guide", "video", "exercise", "project"]);

/**
 * @swagger
 * tags:
 *   - name: Resources
 *     description: Gestion des ressources
 */

/**
 * @swagger
 * /resources:
 *   get:
 *     summary: Récupère toutes les ressources
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: Liste des ressources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resource'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM resources ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Récupère une ressource par ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Ressource trouvée
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Resource' }
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             example: { error: "Invalid id" }
 *       404:
 *         description: Ressource introuvable
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *             example: { error: "Resource not found" }
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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

/**
 * @swagger
 * /resources:
 *   post:
 *     summary: Crée une ressource
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ResourceCreate' }
 *     responses:
 *       201:
 *         description: Ressource créée
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Resource' }
 *       400:
 *         description: Body invalide (champs requis manquants / type invalide)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post("/", async (req, res) => {
  const { title, url, description = null, theme_id, type, is_ada } = req.body ?? {};

  if (!title || !url || theme_id === undefined || !type || typeof is_ada !== "boolean") {
    return res.status(400).json({
      error: "Body attendu: { title, url, description?, theme_id, type, is_ada }",
    });
  }

  // ✅ Validation enum AVANT Postgres (évite l'erreur enum.c)
  if (!ALLOWED_RESOURCE_TYPES.has(type)) {
    return res.status(400).json({
      error: `Invalid type. Allowed: ${[...ALLOWED_RESOURCE_TYPES].join(", ")}`,
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

/**
 * @swagger
 * /resources/{id}:
 *   put:
 *     summary: Met à jour une ressource (partiel)
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ResourceUpdate' }
 *     responses:
 *       200:
 *         description: Ressource mise à jour
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Resource' }
 *       400:
 *         description: ID invalide ou type invalide
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Ressource introuvable
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const { title, url, description, theme_id, type, is_ada } = req.body ?? {};

  // ✅ si "type" fourni, on le valide
  if (type !== undefined && !ALLOWED_RESOURCE_TYPES.has(type)) {
    return res.status(400).json({
      error: `Invalid type. Allowed: ${[...ALLOWED_RESOURCE_TYPES].join(", ")}`,
    });
  }

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

/**
 * @swagger
 * /resources/{id}:
 *   delete:
 *     summary: Supprime une ressource (et ses liens resources_skills)
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Ressource supprimée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Resource 1 supprimée ✅" }
 *                 resource: { $ref: '#/components/schemas/Resource' }
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Ressource introuvable
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
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