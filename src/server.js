import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import resourcesRouter from "./routes/resources.js";
import themesRouter from "./routes/themes.js";
import skillsRouter from "./routes/skills.js";
import resourcesSkillsRouter from "./routes/resources_skills.js";

const app = express();
app.use(express.json());

// chemins pour servir /public en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// servir les fichiers statiques
app.use(express.static(path.join(__dirname, "../public")));

// logger
app.use((req, _res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// routers API
app.use("/resources", resourcesRouter);
app.use("/themes", themesRouter);
app.use("/skills", skillsRouter);
app.use("/resources-skills", resourcesSkillsRouter);

// 404 - image
app.use((_req, res) => {
  res.status(404).sendFile(path.join(__dirname, "../public/erreur404.jpg"));
});

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));