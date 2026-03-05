import express from "express";
import Level from "../../models/Level.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const levels = await Level.find().sort({ order: 1 }).lean();

    const response = levels.map((level) => ({
      ...level,
      unlocked: req.user.role === "teacher" || level.order <= req.user.currentLevel + 1
    }));

    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch lessons.", error: error.message });
  }
});

router.get("/:levelId", authMiddleware, async (req, res) => {
  try {
    const level = await Level.findById(req.params.levelId).lean();

    if (!level) {
      return res.status(404).json({ message: "Level not found." });
    }

    const isUnlocked = req.user.role === "teacher" || level.order <= req.user.currentLevel + 1;
    if (!isUnlocked) {
      return res.status(403).json({ message: "Level locked. Complete the previous quiz first." });
    }

    return res.json({ ...level, unlocked: true });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch level.", error: error.message });
  }
});

export default router;
