import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    options: { type: [String], required: true },
    correctOption: { type: Number, required: true }
  },
  { _id: false }
);

const storyChoiceSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    outcome: { type: String, required: true }
  },
  { _id: false }
);

const storyModeSchema = new mongoose.Schema(
  {
    chapterIntro: { type: String, default: "" },
    npcName: { type: String, default: "" },
    npcTip: { type: String, default: "" },
    scenarioPrompt: { type: String, default: "" },
    choices: { type: [storyChoiceSchema], default: [] }
  },
  { _id: false }
);

const flashcardSchema = new mongoose.Schema(
  {
    front: { type: String, required: true },
    back: { type: String, required: true }
  },
  { _id: false }
);

const mapPairSchema = new mongoose.Schema(
  {
    zone: { type: String, required: true },
    label: { type: String, required: true }
  },
  { _id: false }
);

const mapChallengeSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    zones: { type: [String], default: [] },
    labels: { type: [String], default: [] },
    correctMatches: { type: [mapPairSchema], default: [] }
  },
  { _id: false }
);

const timelineEventSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    order: { type: Number, required: true }
  },
  { _id: false }
);

const timelineChallengeSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    events: { type: [timelineEventSchema], default: [] }
  },
  { _id: false }
);

const levelSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    order: { type: Number, required: true, unique: true },
    difficulty: { type: String, enum: ["Beginner", "Intermediate"], required: true },
    content: { type: String, required: true },
    storyMode: { type: storyModeSchema, default: () => ({}) },
    flashcards: { type: [flashcardSchema], default: [] },
    mapChallenge: { type: mapChallengeSchema, default: () => ({}) },
    timelineChallenge: { type: timelineChallengeSchema, default: () => ({}) },
    quizQuestions: {
      type: [quizQuestionSchema],
      validate: {
        validator: (questions) => Array.isArray(questions) && questions.length === 5,
        message: "Each level must have exactly 5 quiz questions."
      }
    }
  },
  { timestamps: true }
);

const Level = mongoose.models.Level || mongoose.model("Level", levelSchema);

export default Level;
