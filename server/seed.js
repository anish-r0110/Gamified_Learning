import dotenv from "dotenv";
import mongoose from "../models/db.js";
import Level from "../models/Level.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gamified_sst";

const levels = [
  {
    title: "Level 1: Foundations of History and Civics",
    order: 1,
    difficulty: "Beginner",
    content:
      "Learn about early Indian civilizations, basic rights and duties, and why communities form rules.",
    storyMode: {
      chapterIntro: "You join the Time Council to recover a lost civic charter from an ancient city archive.",
      npcName: "Archivist Asha",
      npcTip: "Every source tells a story, but strong evidence tells the true one.",
      scenarioPrompt: "A class debate turns into shouting. What is the best civic action?",
      choices: [
        { text: "Interrupt everyone loudly", outcome: "Conflict grows and no one learns." },
        { text: "Set speaking turns and listen", outcome: "Fair participation leads to better decisions." },
        { text: "Ignore and leave", outcome: "The problem stays unresolved." }
      ]
    },
    flashcards: [
      { front: "What is a Constitution?", back: "A set of fundamental rules that defines government powers and citizen rights." },
      { front: "Who studies the past using evidence?", back: "A historian." },
      { front: "Fundamental Duty example", back: "Respecting the national flag and anthem." }
    ],
    mapChallenge: {
      title: "Label Ancient Sites",
      zones: ["Harappa", "Mohenjo-daro", "Lothal"],
      labels: ["Sindh Region", "Gujarat Port Site", "Punjab Region"],
      correctMatches: [
        { zone: "Harappa", label: "Punjab Region" },
        { zone: "Mohenjo-daro", label: "Sindh Region" },
        { zone: "Lothal", label: "Gujarat Port Site" }
      ]
    },
    timelineChallenge: {
      title: "Order These Civilization Milestones",
      events: [
        { text: "Early farming settlements", order: 1 },
        { text: "Planned Indus cities", order: 2 },
        { text: "Expansion of trade routes", order: 3 },
        { text: "Modern archaeological discovery", order: 4 }
      ]
    },
    quizQuestions: [
      {
        prompt: "Which civilization is known for well-planned cities like Harappa?",
        options: ["Mauryan", "Indus Valley", "Gupta", "Mughal"],
        correctOption: 1
      },
      {
        prompt: "What is the main purpose of a constitution?",
        options: ["To collect taxes", "To define government rules", "To conduct exams", "To build roads"],
        correctOption: 1
      },
      {
        prompt: "Which is a Fundamental Duty in India?",
        options: ["Voting at 10 years", "Respecting the national flag", "Owning a car", "Joining the army"],
        correctOption: 1
      },
      {
        prompt: "Who studies the past using sources and evidence?",
        options: ["Scientist", "Historian", "Pilot", "Artist"],
        correctOption: 1
      },
      {
        prompt: "Why do societies create laws?",
        options: ["To create confusion", "To maintain order and justice", "To stop education", "To end trade"],
        correctOption: 1
      }
    ]
  },
  {
    title: "Level 2: Governance and Resources",
    order: 2,
    difficulty: "Intermediate",
    content:
      "Explore parliamentary democracy, state vs central roles, and responsible use of natural resources.",
    storyMode: {
      chapterIntro: "As junior policy advisor, you must help a town solve water shortage while keeping governance fair.",
      npcName: "Councillor Ravi",
      npcTip: "Good governance balances citizen voice, clear rules, and resource planning.",
      scenarioPrompt: "Water tanks are low. Which policy should be prioritized first?",
      choices: [
        { text: "No rules, let everyone use freely", outcome: "Overuse causes faster shortage." },
        { text: "Fair rationing with public notice", outcome: "Supply lasts longer and trust increases." },
        { text: "Only supply one area", outcome: "Creates inequality and conflict." }
      ]
    },
    flashcards: [
      { front: "Lower House of Parliament", back: "Lok Sabha." },
      { front: "Example of renewable resource", back: "Solar energy." },
      { front: "Local urban governing body", back: "Municipal Corporation." }
    ],
    mapChallenge: {
      title: "Match Institution to Governance Level",
      zones: ["City roads and waste", "National defense", "Village water supply"],
      labels: ["Municipal / Panchayat", "Central Government", "Local Government"],
      correctMatches: [
        { zone: "City roads and waste", label: "Municipal / Panchayat" },
        { zone: "National defense", label: "Central Government" },
        { zone: "Village water supply", label: "Local Government" }
      ]
    },
    timelineChallenge: {
      title: "Order the Governance Workflow",
      events: [
        { text: "Citizens identify an issue", order: 1 },
        { text: "Representatives debate policy", order: 2 },
        { text: "Law or rule is approved", order: 3 },
        { text: "Implementation and review", order: 4 }
      ]
    },
    quizQuestions: [
      {
        prompt: "Which house of Parliament is called the lower house?",
        options: ["Rajya Sabha", "Lok Sabha", "Vidhan Sabha", "Supreme Court"],
        correctOption: 1
      },
      {
        prompt: "Which level of government handles local civic issues in cities?",
        options: ["Municipal Corporation", "UN", "NITI Aayog", "Election Commission"],
        correctOption: 0
      },
      {
        prompt: "A renewable resource among these is:",
        options: ["Coal", "Petroleum", "Solar energy", "Natural gas"],
        correctOption: 2
      },
      {
        prompt: "What does democracy primarily ensure?",
        options: ["Rule by one person", "Participation of citizens", "No elections", "No rights"],
        correctOption: 1
      },
      {
        prompt: "Conserving water helps because:",
        options: ["Water is unlimited", "It reduces future scarcity", "It stops rainfall", "It lowers sunlight"],
        correctOption: 1
      }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    await Level.deleteMany({});
    await Level.insertMany(levels);
    console.log("Seeded levels successfully.");
  } catch (error) {
    console.error("Seeding failed. Check MongoDB and MONGO_URI:", MONGO_URI);
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
