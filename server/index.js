import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "../models/db.js";
import authRoutes from "./routes/auth.js";
import lessonsRoutes from "./routes/lessons.js";
import progressRoutes from "./routes/progress.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gamified_sst";

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "SST learning API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/progress", progressRoutes);

async function start() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server. Check MongoDB and MONGO_URI:", MONGO_URI);
    console.error("Error:", error.message);
    process.exit(1);
  }
}

start();
