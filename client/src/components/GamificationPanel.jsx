import { useEffect, useMemo, useState } from "react";

function getRank(points) {
  if (points >= 200) return { name: "SST Legend", min: 200, max: 300 };
  if (points >= 120) return { name: "Knowledge Knight", min: 120, max: 200 };
  if (points >= 60) return { name: "Map Explorer", min: 60, max: 120 };
  return { name: "Rookie Historian", min: 0, max: 60 };
}

function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = String(Math.floor(total / 3600)).padStart(2, "0");
  const mins = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const secs = String(total % 60).padStart(2, "0");
  return `${hours}:${mins}:${secs}`;
}

export default function GamificationPanel({ points = 0, scores = [], badges = [], levelCount = 0 }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const rank = getRank(points);
  const rankProgress = Math.min(100, Math.round(((points - rank.min) / Math.max(1, rank.max - rank.min)) * 100));

  const sorted = useMemo(
    () => [...scores].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [scores]
  );

  let rawStreak = 0;
  for (const item of sorted) {
    if (item.passed) rawStreak += 1;
    else break;
  }

  const latestPassed = sorted.find((s) => s.passed);
  const latestPassedAt = latestPassed ? new Date(latestPassed.createdAt).getTime() : null;
  const decayWindowMs = 24 * 60 * 60 * 1000;
  const msSinceLastPass = latestPassedAt ? now - latestPassedAt : null;
  const streakExpired = rawStreak > 0 && msSinceLastPass !== null && msSinceLastPass > decayWindowMs;
  const streak = streakExpired ? 0 : rawStreak;
  const msUntilDecay = latestPassedAt && !streakExpired ? decayWindowMs - msSinceLastPass : 0;

  const perfectRuns = scores.filter((s) => s.score === 5).length;
  const completedMissions = scores.filter((s) => s.passed).length;
  const today = new Date(now);
  const dailyMissionDone = scores.some((s) => {
    if (!s.passed) return false;
    const d = new Date(s.createdAt);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  });

  const achievements = [
    { id: "first_win", label: "First Victory", unlocked: completedMissions >= 1 },
    { id: "combo_3", label: "Combo x3", unlocked: streak >= 3 },
    { id: "perfect", label: "Perfect 5/5", unlocked: perfectRuns >= 1 },
    { id: "path_master", label: "Path Master", unlocked: levelCount > 0 && completedMissions >= levelCount }
  ];

  return (
    <section className="gm-panel mb-4">
      <article className="gm-card gm-rank-card">
        <p className="gm-label">Player Rank</p>
        <h3 className="gm-rank-title mt-1">{rank.name}</h3>
        <p className="gm-note mt-1">XP: {points}</p>
        <div className="gm-meter mt-2">
          <div className="gm-meter-fill" style={{ width: `${rankProgress}%` }} />
        </div>
        <p className="gm-note mt-2">{rankProgress}% to next tier</p>
      </article>

      <article className="gm-card">
        <p className="gm-label">Active Quests</p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div className="gm-mini gm-mini-amber">
            <p className="gm-mini-label">Current Combo</p>
            <p className="gm-mini-value">x{streak}</p>
          </div>
          <div className="gm-mini gm-mini-teal">
            <p className="gm-mini-label">Perfect Runs</p>
            <p className="gm-mini-value">{perfectRuns}</p>
          </div>
        </div>

        <div className={`gm-status mt-2 ${dailyMissionDone ? "gm-status-ok" : "gm-status-neutral"}`}>
          Daily mission: Pass one quiz today {dailyMissionDone ? "(Completed)" : "(Pending)"}
        </div>

        <div className={`gm-status mt-2 ${streakExpired ? "gm-status-warn" : "gm-status-info"}`}>
          {streak > 0 && !streakExpired && `Streak resets in ${formatDuration(msUntilDecay)} if you do not pass another quiz.`}
          {streak === 0 && !latestPassedAt && "No active streak yet. Pass a quiz to start your combo timer."}
          {streakExpired && "Streak expired after 24h without a pass. Pass a quiz to restart combo."}
        </div>
      </article>

      <article className="gm-card">
        <p className="gm-label">Achievements</p>
        <div className="mt-2 grid gap-2">
          {achievements.map((item) => (
            <div
              key={item.id}
              className={`gm-achievement ${item.unlocked ? "gm-achievement-open" : "gm-achievement-locked"}`}
            >
              {item.label}: {item.unlocked ? "Unlocked" : "Locked"}
            </div>
          ))}
        </div>
        {badges.length > 0 && <p className="gm-note mt-2">Badge inventory synced: {badges.join(", ")}</p>}
      </article>
    </section>
  );
}
