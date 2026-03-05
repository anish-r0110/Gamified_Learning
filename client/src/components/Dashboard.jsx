export default function Dashboard({ points = 0, badges = [], progressPercent = 0 }) {
  const safeBadges = Array.isArray(badges) ? badges : [];
  const safeProgress = Number.isFinite(progressPercent) ? progressPercent : 0;

  return (
    <section className="mb-6 grid gap-4 md:grid-cols-3">
      <div className="rounded-xl bg-teal-50 p-4">
        <p className="text-sm text-slate-600">Points</p>
        <p className="text-2xl font-bold text-brand">{points}</p>
      </div>

      <div className="rounded-xl bg-amber-50 p-4">
        <p className="text-sm text-slate-600">Badges</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {safeBadges.length ? safeBadges.map((badge) => <span key={badge} className="rounded-full bg-accent px-3 py-1 text-xs text-white">{badge}</span>) : <span className="text-sm text-slate-500">No badges yet</span>}
        </div>
      </div>

      <div className="rounded-xl bg-sky-50 p-4">
        <p className="text-sm text-slate-600">Progress</p>
        <div className="mt-2 h-3 w-full rounded-full bg-slate-200">
          <div className="h-3 rounded-full bg-brand" style={{ width: `${safeProgress}%` }} />
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-700">{safeProgress}% complete</p>
      </div>
    </section>
  );
}
