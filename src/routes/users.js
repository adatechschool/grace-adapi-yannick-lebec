import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "liste des utilisateurs" });
});

export default router;