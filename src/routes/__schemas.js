/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Internal error"
 *
 *     Resource:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         type:
 *           type: string
 *           enum: [guide, video, exercise, project]
 *           example: guide
 *         title: { type: string, example: "Guide Express" }
 *         description:
 *           type: string
 *           nullable: true
 *           example: "Documentation officielle"
 *         url: { type: string, nullable: true, example: "https://expressjs.com" }
 *         is_ada: { type: boolean, example: true }
 *         theme_id: { type: integer, nullable: true, example: 2 }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *
 *     ResourceCreate:
 *       type: object
 *       required: [title, url, theme_id, type, is_ada]
 *       properties:
 *         title: { type: string, example: "Guide Express" }
 *         url: { type: string, example: "https://expressjs.com" }
 *         description: { type: string, nullable: true, example: null }
 *         theme_id: { type: integer, example: 2 }
 *         type:
 *           type: string
 *           enum: [guide, video, exercise, project]
 *           example: guide
 *         is_ada: { type: boolean, example: true }
 *
 *     ResourceUpdate:
 *       type: object
 *       description: Mise à jour partielle (COALESCE)
 *       properties:
 *         title: { type: string }
 *         url: { type: string }
 *         description: { type: string, nullable: true }
 *         theme_id: { type: integer }
 *         type:
 *           type: string
 *           enum: [guide, video, exercise, project]
 *         is_ada: { type: boolean }
 *
 *     Theme:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 2 }
 *         name: { type: string, example: "Backend" }
 *         description: { type: string, nullable: true, example: "API & Serveur" }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *
 *     ThemeCreate:
 *       type: object
 *       required: [name]
 *       properties:
 *         name: { type: string, example: "Backend" }
 *         description: { type: string, nullable: true, example: "API & Serveur" }
 *
 *     ThemeUpdate:
 *       type: object
 *       properties:
 *         name: { type: string }
 *         description: { type: string, nullable: true }
 *
 *     Skill:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 5 }
 *         name: { type: string, example: "Node.js" }
 *
 *     SkillCreate:
 *       type: object
 *       required: [name]
 *       properties:
 *         name: { type: string, example: "Node.js" }
 *
 *     SkillUpdate:
 *       type: object
 *       properties:
 *         name: { type: string, example: "TypeScript" }
 *
 *     ResourceSkill:
 *       type: object
 *       properties:
 *         resource_id: { type: integer, example: 1 }
 *         skill_id: { type: integer, example: 5 }
 *
 *     ResourceSkillCreate:
 *       type: object
 *       required: [resource_id, skill_id]
 *       properties:
 *         resource_id: { type: integer, example: 1 }
 *         skill_id: { type: integer, example: 5 }
 */
export {};