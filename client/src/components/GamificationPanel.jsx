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
    <section className="mb-6 grid gap-4 lg:grid-cols-3">
      <article className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 p-4 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Player Rank</p>
        <h3 className="mt-1 text-xl font-bold">{rank.name}</h3>
        <p className="mt-2 text-sm text-slate-200">XP: {points}</p>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-500/40">
          <div className="h-2 rounded-full bg-emerald-300" style={{ width: `${rankProgress}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-300">{rankProgress}% to next tier</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Active Quests</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-amber-50 p-3">
            <p className="text-xs text-slate-500">Current Combo</p>
            <p className="text-xl font-bold text-amber-700">x{streak}</p>
          </div>
          <div className="rounded-xl bg-teal-50 p-3">
            <p className="text-xs text-slate-500">Perfect Runs</p>
            <p className="text-xl font-bold text-teal-700">{perfectRuns}</p>
          </div>
        </div>

        <div className={`mt-3 rounded-xl p-3 text-sm ${dailyMissionDone ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
          Daily mission: Pass one quiz today {dailyMissionDone ? "(Completed)" : "(Pending)"}
        </div>

        <div className={`mt-3 rounded-xl p-3 text-sm ${streakExpired ? "bg-rose-100 text-rose-700" : "bg-indigo-100 text-indigo-700"}`}>
          {streak > 0 && !streakExpired && `Streak resets in ${formatDuration(msUntilDecay)} if you do not pass another quiz.`}
          {streak === 0 && !latestPassedAt && "No active streak yet. Pass a quiz to start your combo timer."}
          {streakExpired && "Streak expired after 24h without a pass. Pass a quiz to restart combo."}
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Achievements</p>
        <div className="mt-3 grid gap-2">
          {achievements.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border px-3 py-2 text-sm ${item.unlocked ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-500"}`}
            >
              {item.label}: {item.unlocked ? "Unlocked" : "Locked"}
            </div>
          ))}
        </div>
        {badges.length > 0 && <p className="mt-3 text-xs text-slate-600">Badge inventory synced: {badges.join(", ")}</p>}
      </article>
    </section>
  );
}
