import express from "express";
import Level from "../models/Level.js";
import Score from "../models/Score.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";

const router = express.Router();

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateMapChallenge(mapChallenge) {
  if (mapChallenge === undefined) return null;
  if (!mapChallenge || typeof mapChallenge !== "object" || Array.isArray(mapChallenge)) {
    return "mapChallenge must be an object.";
  }

  const { title, zones, labels, correctMatches } = mapChallenge;

  if (title !== undefined && typeof title !== "string") {
    return "mapChallenge.title must be a string.";
  }

  if (zones !== undefined) {
    if (!Array.isArray(zones)) return "mapChallenge.zones must be an array.";
    if (zones.some((zone) => !isNonEmptyString(zone))) {
      return "mapChallenge.zones must contain non-empty strings.";
    }
  }

  if (labels !== undefined) {
    if (!Array.isArray(labels)) return "mapChallenge.labels must be an array.";
    if (labels.some((label) => !isNonEmptyString(label))) {
      return "mapChallenge.labels must contain non-empty strings.";
    }
  }

  if (correctMatches !== undefined) {
    if (!Array.isArray(correctMatches)) return "mapChallenge.correctMatches must be an array.";
    if (
      correctMatches.some(
        (pair) =>
          !pair ||
          typeof pair !== "object" ||
          Array.isArray(pair) ||
          !isNonEmptyString(pair.zone) ||
          !isNonEmptyString(pair.label)
      )
    ) {
      return "mapChallenge.correctMatches must contain objects with non-empty zone and label.";
    }

    if (Array.isArray(zones) && zones.length > 0) {
      const zoneSet = new Set(zones.map((zone) => zone.trim()));
      if (correctMatches.some((pair) => !zoneSet.has(pair.zone.trim()))) {
        return "Each correct match zone must exist in mapChallenge.zones.";
      }
    }

    if (Array.isArray(labels) && labels.length > 0) {
      const labelSet = new Set(labels.map((label) => label.trim()));
      if (correctMatches.some((pair) => !labelSet.has(pair.label.trim()))) {
        return "Each correct match label must exist in mapChallenge.labels.";
      }
    }
  }

  return null;
}

function validateTimelineChallenge(timelineChallenge) {
  if (timelineChallenge === undefined) return null;
  if (!timelineChallenge || typeof timelineChallenge !== "object" || Array.isArray(timelineChallenge)) {
    return "timelineChallenge must be an object.";
  }

  const { title, events } = timelineChallenge;

  if (title !== undefined && typeof title !== "string") {
    return "timelineChallenge.title must be a string.";
  }

  if (events !== undefined) {
    if (!Array.isArray(events)) return "timelineChallenge.events must be an array.";
    if (
      events.some(
        (event) =>
          !event ||
          typeof event !== "object" ||
          Array.isArray(event) ||
          !isNonEmptyString(event.text) ||
          !Number.isInteger(event.order) ||
          event.order < 1
      )
    ) {
      return "timelineChallenge.events must contain objects with non-empty text and positive integer order.";
    }

    const orderSet = new Set(events.map((event) => event.order));
    if (orderSet.size !== events.length) {
      return "timelineChallenge.events order values must be unique.";
    }
  }

  return null;
}

function validateLessonPayload(payload, { partial = false } = {}) {
  if (!partial) {
    if (!payload.title || !payload.difficulty || !payload.content || !Number.isFinite(payload.order)) {
      return "title, order, difficulty, and content are required.";
    }
    if (!Array.isArray(payload.quizQuestions) || payload.quizQuestions.length !== 5) {
      return "Exactly 5 quiz questions are required.";
    }
  }

  if (payload.mapChallenge !== undefined) {
    const mapError = validateMapChallenge(payload.mapChallenge);
    if (mapError) return mapError;
  }

  if (payload.timelineChallenge !== undefined) {
    const timelineError = validateTimelineChallenge(payload.timelineChallenge);
    if (timelineError) return timelineError;
  }

  return null;
}

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

router.post("/", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const payload = req.body || {};

    const payloadError = validateLessonPayload(payload);
    if (payloadError) {
      return res.status(400).json({ message: payloadError });
    }

    const normalizedOrder = Math.trunc(payload.order);
    const existingOrder = await Level.findOne({ order: normalizedOrder }).lean();
    if (existingOrder) {
      return res.status(409).json({ message: "A level with this order already exists." });
    }

    const created = await Level.create({
      title: payload.title,
      order: normalizedOrder,
      difficulty: payload.difficulty,
      content: payload.content,
      quizQuestions: payload.quizQuestions,
      storyMode: payload.storyMode || {},
      flashcards: payload.flashcards || [],
      mapChallenge: payload.mapChallenge || {},
      timelineChallenge: payload.timelineChallenge || {}
    });

    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create level.", error: error.message });
  }
});

router.put("/:levelId", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const level = await Level.findById(req.params.levelId);
    if (!level) {
      return res.status(404).json({ message: "Level not found." });
    }

    const payload = req.body || {};
    const payloadError = validateLessonPayload(payload, { partial: true });
    if (payloadError) {
      return res.status(400).json({ message: payloadError });
    }

    if (payload.order !== undefined) {
      if (!Number.isFinite(payload.order)) {
        return res.status(400).json({ message: "order must be a number." });
      }
      const normalizedOrder = Math.trunc(payload.order);
      const existingOrder = await Level.findOne({ order: normalizedOrder, _id: { $ne: level._id } }).lean();
      if (existingOrder) {
        return res.status(409).json({ message: "A level with this order already exists." });
      }
      level.order = normalizedOrder;
    }

    if (payload.quizQuestions !== undefined) {
      if (!Array.isArray(payload.quizQuestions) || payload.quizQuestions.length !== 5) {
        return res.status(400).json({ message: "Exactly 5 quiz questions are required." });
      }
      level.quizQuestions = payload.quizQuestions;
    }

    if (payload.title !== undefined) level.title = payload.title;
    if (payload.difficulty !== undefined) level.difficulty = payload.difficulty;
    if (payload.content !== undefined) level.content = payload.content;
    if (payload.storyMode !== undefined) level.storyMode = payload.storyMode;
    if (payload.flashcards !== undefined) level.flashcards = payload.flashcards;
    if (payload.mapChallenge !== undefined) level.mapChallenge = payload.mapChallenge;
    if (payload.timelineChallenge !== undefined) level.timelineChallenge = payload.timelineChallenge;

    await level.save();
    return res.json(level);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update level.", error: error.message });
  }
});

router.delete("/:levelId", authMiddleware, requireRole("teacher"), async (req, res) => {
  try {
    const level = await Level.findById(req.params.levelId);
    if (!level) {
      return res.status(404).json({ message: "Level not found." });
    }

    await Score.deleteMany({ level: level._id });
    await level.deleteOne();

    return res.json({ message: "Level and related scores deleted." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete level.", error: error.message });
  }
});

export default router;
