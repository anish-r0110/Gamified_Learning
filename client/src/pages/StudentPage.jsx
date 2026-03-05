import { useEffect, useState } from "react";
import { apiRequest } from "../api.js";
import { useAuth } from "../auth.jsx";
import Dashboard from "../components/Dashboard.jsx";
import Quiz from "../components/Quiz.jsx";
import Leaderboard from "../components/Leaderboard.jsx";
import QuestMap from "../components/QuestMap.jsx";
import GamificationPanel from "../components/GamificationPanel.jsx";
import RewardModal from "../components/RewardModal.jsx";
import StoryModePanel from "../components/StoryModePanel.jsx";
import FlashcardsPanel from "../components/FlashcardsPanel.jsx";
import MapLabelChallenge from "../components/MapLabelChallenge.jsx";
import TimelineChallenge from "../components/TimelineChallenge.jsx";

export default function StudentPage() {
  const { token, user, setUser, logout } = useAuth();
  const [levels, setLevels] = useState([]);
  const [activeLevel, setActiveLevel] = useState(null);
  const [mode, setMode] = useState("story");
  const [progress, setProgress] = useState({ progressPercent: 0, scores: [] });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reward, setReward] = useState(null);

  async function loadData() {
    const [levelsData, progressData] = await Promise.all([
      apiRequest("/lessons", { token }),
      apiRequest("/progress/me", { token })
    ]);

    setLevels(levelsData);
    setActiveLevel((prev) => {
      if (!prev) return null;
      const stillExists = levelsData.find((lvl) => lvl._id === prev._id);
      return stillExists?.unlocked ? stillExists : null;
    });

    setProgress({ progressPercent: progressData.progressPercent, scores: progressData.scores });
    setUser((prev) => ({ ...prev, ...progressData.profile }));
  }

  useEffect(() => {
    loadData().catch((err) => {
      if (err.status === 401) {
        logout();
        return;
      }
      setMessage(err.message);
    });
  }, []);

  async function submitQuiz(answers) {
    if (!activeLevel) return;

    try {
      setSubmitting(true);
      const previousLevel = Number.isFinite(user?.currentLevel) ? user.currentLevel : 0;
      const result = await apiRequest(`/progress/quiz/${activeLevel._id}`, {
        method: "POST",
        body: JSON.stringify({ answers }),
        token
      });

      setMessage(`${result.message} You scored ${result.correctAnswers}/5 and earned ${result.earnedPoints} points.`);
      if (result.passed) {
        const unlockedNext = (result.updatedProfile?.currentLevel || previousLevel) > previousLevel;
        setReward({
          title: "Mission Cleared",
          subtitle: "Great work. Your knowledge streak keeps growing.",
          earnedPoints: result.earnedPoints,
          correctAnswers: result.correctAnswers,
          unlockedNext
        });
      }

      setMode("story");
      await loadData();
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const safePoints = Number.isFinite(user?.points) ? user.points : 0;
  const safeBadges = Array.isArray(user?.badges) ? user.badges : [];
  const safeScores = Array.isArray(progress.scores) ? progress.scores : [];

  const tabs = [
    { key: "story", label: "Story" },
    { key: "learn", label: "Learn" },
    { key: "flashcards", label: "Flashcards" },
    { key: "map", label: "Map" },
    { key: "timeline", label: "Timeline" },
    { key: "quiz", label: "Quiz" }
  ];

  return (
    <section>
      {message && <p className="mb-4 rounded-lg bg-sky-50 p-3 text-sm text-sky-900">{message}</p>}

      {!activeLevel && (
        <>
          <Dashboard points={safePoints} badges={safeBadges} progressPercent={progress.progressPercent} />
          <GamificationPanel points={safePoints} badges={safeBadges} scores={safeScores} levelCount={levels.length} />

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Roadmap</p>
            <QuestMap
              levels={levels}
              currentLevelId={null}
              onSelect={(level) => {
                setActiveLevel(level);
                setMode("story");
              }}
            />
          </section>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Performance Log</p>
            <Leaderboard scores={safeScores} />
          </div>
        </>
      )}

      {activeLevel && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <button
            type="button"
            className="mb-4 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700"
            onClick={() => setActiveLevel(null)}
          >
            Back To Roadmap
          </button>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{activeLevel.difficulty}</span>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-semibold ${mode === tab.key ? "bg-teal-100 text-brand" : "bg-slate-100 text-slate-500"}`}
                onClick={() => setMode(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <h2 className="text-xl font-bold text-slate-900">{activeLevel.title}</h2>

          {mode === "story" && <StoryModePanel story={activeLevel.storyMode} />}

          {mode === "learn" && (
            <div className="mt-5 rounded-xl bg-sky-50 p-4">
              <p className="text-sm text-sky-900">{activeLevel.content}</p>
            </div>
          )}

          {mode === "flashcards" && <FlashcardsPanel cards={activeLevel.flashcards || []} />}

          {mode === "map" && <MapLabelChallenge challenge={activeLevel.mapChallenge} />}

          {mode === "timeline" && <TimelineChallenge challenge={activeLevel.timelineChallenge} />}

          {mode === "quiz" && (
            <div className="mt-5">
              <Quiz level={activeLevel} onSubmit={submitQuiz} submitting={submitting} />
            </div>
          )}
        </section>
      )}

      <RewardModal open={Boolean(reward)} reward={reward} onClose={() => setReward(null)} />
    </section>
  );
}
