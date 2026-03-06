import express from "express";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import User from "../../models/User.js";
import Level from "../../models/Level.js";
import Score from "../../models/Score.js";

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const scores = await Score.find({ student: req.user._id })
      .populate("level", "title order")
      .sort({ createdAt: -1 })
      .lean();

    const totalLevels = await Level.countDocuments();
    const completedLevels = scores.filter((s) => s.passed).length;
    const progressPercent = totalLevels ? Math.round((completedLevels / totalLevels) * 100) : 0;

    return res.json({
      profile: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
        points: req.user.points,
        badges: req.user.badges,
        currentLevel: req.user.currentLevel
      },
      progressPercent,
      scores
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch progress.", error: error.message });
  }
});

router.post("/quiz/:levelId", authMiddleware, requireRole("student"), async (req, res) => {
  try {
    const { answers } = req.body;
    const level = await Level.findById(req.params.levelId);

    if (!level) {
      return res.status(404).json({ message: "Level not found." });
    }

    if (!Array.isArray(answers) || answers.length !== 5) {
      return res.status(400).json({ message: "Quiz must contain exactly 5 answers." });
    }

    const isUnlocked = level.order <= req.user.currentLevel + 1;
    if (!isUnlocked) {
      return res.status(403).json({ message: "Level locked. Complete previous level first." });
    }

    const existing = await Score.findOne({ student: req.user._id, level: level._id });
    if (existing?.passed) {
      return res.status(409).json({ message: "Quiz already completed for this level." });
    }

    let correctAnswers = 0;
    const normalizedAnswers = answers.map((a) => Number(a));

    level.quizQuestions.forEach((question, idx) => {
      if (normalizedAnswers[idx] === question.correctOption) {
        correctAnswers += 1;
      }
    });

    const passed = correctAnswers >= 3;
    const earnedPoints = correctAnswers * 10;

    await Score.findOneAndUpdate(
      { student: req.user._id, level: level._id },
      {
        student: req.user._id,
        level: level._id,
        score: correctAnswers,
        totalQuestions: 5,
        passed,
        pointsAwarded: earnedPoints
      },
      { upsert: true, new: true }
    );

    const user = await User.findById(req.user._id);
    user.points += earnedPoints;

    if (passed && user.currentLevel < level.order) {
      user.currentLevel = level.order;
    }

    if (user.points >= 50 && !user.badges.includes("History Hero")) {
      user.badges.push("History Hero");
    }

    await user.save();

    return res.json({
      message: passed ? "Level completed. Next level unlocked." : "Quiz submitted. Retry to unlock next level.",
      correctAnswers,
      earnedPoints,
      passed,
      updatedProfile: {
        points: user.points,
        badges: user.badges,
        currentLevel: user.currentLevel
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to submit quiz.", error: error.message });
  }
});

router.get("/teacher/students", authMiddleware, requireRole("teacher"), async (_req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("name email points currentLevel")
      .sort({ points: -1 })
      .lean();

    return res.json(
      students.map((student) => ({
        id: student._id,
        name: student.name,
        email: student.email,
        levelReached: student.currentLevel,
        totalScore: student.points
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch students.", error: error.message });
  }
});

router.get("/teacher/summary", authMiddleware, requireRole("teacher"), async (_req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: "student" });
    const scores = await Score.find().lean();

    const totalAttempts = scores.length;
    const passedAttempts = scores.filter((item) => item.passed).length;
    const totalCorrectAnswers = scores.reduce((acc, item) => acc + Number(item.score || 0), 0);
    const totalQuestionsAnswered = scores.reduce((acc, item) => acc + Number(item.totalQuestions || 5), 0);

    const passRate = totalAttempts ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
    const avgScorePercent = totalQuestionsAnswered
      ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100)
      : 0;

    const topStudent = await User.findOne({ role: "student" })
      .select("name email points currentLevel")
      .sort({ points: -1 })
      .lean();

    return res.json({
      studentCount,
      totalAttempts,
      passRate,
      avgScorePercent,
      topStudent: topStudent
        ? {
            id: topStudent._id,
            name: topStudent.name,
            email: topStudent.email,
            points: topStudent.points,
            currentLevel: topStudent.currentLevel
          }
        : null
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch teacher summary.", error: error.message });
  }
});

router.get("/teacher/attempts", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit)
      ? Math.max(1, Math.min(100, Math.trunc(requestedLimit)))
      : 20;

    const attempts = await Score.find()
      .populate("student", "name email")
      .populate("level", "title order")
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    return res.json(
      attempts.map((item) => ({
        id: item._id,
        studentName: item.student?.name || "Unknown",
        studentEmail: item.student?.email || "",
        levelTitle: item.level?.title || "Unknown Level",
        levelOrder: item.level?.order || null,
        score: item.score,
        totalQuestions: item.totalQuestions,
        passed: item.passed,
        pointsAwarded: item.pointsAwarded,
        updatedAt: item.updatedAt
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch recent attempts.", error: error.message });
  }
});

export default router;
