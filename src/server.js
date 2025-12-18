import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import resourcesRouter from "./routes/resources.js";
import themesRouter from "./routes/themes.js";
import skillsRouter from "./routes/skills.js";
import resourcesSkillsRouter from "./routes/resources_skills.js";

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();
app.use(express.json());

// __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// statics
app.use(express.static(path.join(__dirname, "../public")));

// logger
app.use((req, _res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Swagger (chemins absolus => pas de "Aucune opération")
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mon Adapi",
      version: "1.0.0",
      description: "Documentation Swagger de l'API",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: [
    path.join(__dirname, "routes", "*.js"),
    path.join(__dirname, "routes", "_schemas.js"),
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routers API
app.use("/resources", resourcesRouter);
app.use("/themes", themesRouter);
app.use("/skills", skillsRouter);
app.use("/resources-skills", resourcesSkillsRouter);

// 404 image
app.use((_req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../public/erreur404.jpg"));
});

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));