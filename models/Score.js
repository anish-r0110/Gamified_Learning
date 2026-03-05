import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    level: { type: mongoose.Schema.Types.ObjectId, ref: "Level", required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, default: 5 },
    passed: { type: Boolean, default: false },
    pointsAwarded: { type: Number, default: 0 }
  },
  { timestamps: true }
);

scoreSchema.index({ student: 1, level: 1 }, { unique: true });

const Score = mongoose.models.Score || mongoose.model("Score", scoreSchema);

export default Score;
