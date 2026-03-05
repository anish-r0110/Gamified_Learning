export default function Leaderboard({ scores }) {
  const safeScores = Array.isArray(scores) ? scores : [];

  return (
    <section className="rounded-xl border border-slate-200 p-4">
      <h3 className="mb-3 text-lg font-semibold text-slate-800">Recent Battles</h3>
      <div className="space-y-2">
        {safeScores.length === 0 && <p className="text-sm text-slate-500">No attempts yet.</p>}
        {safeScores.map((item) => (
          <div key={item._id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span>
              {item.passed ? "Victory" : "Retry"}: {item.level?.title || item.level}
            </span>
            <span className={`font-semibold ${item.passed ? "text-emerald-700" : "text-amber-700"}`}>
              {item.score}/{item.totalQuestions} (+{item.pointsAwarded} XP)
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
