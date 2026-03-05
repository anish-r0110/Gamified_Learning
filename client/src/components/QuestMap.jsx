export default function QuestMap({ levels = [], currentLevelId, onSelect }) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Quest Path</p>
      <div className="relative mt-4 space-y-3">
        {levels.map((level, idx) => {
          const state = !level.unlocked ? "locked" : currentLevelId === level._id ? "active" : "open";
          const isLast = idx === levels.length - 1;

          return (
            <div key={level._id} className="relative pl-9">
              <span
                className={`absolute left-3 top-7 h-3.5 w-3.5 rounded-full border-2 ${
                  state === "active"
                    ? "quest-node-active border-teal-700 bg-teal-400"
                    : state === "open"
                      ? "border-emerald-600 bg-emerald-400"
                      : "border-slate-300 bg-slate-100"
                }`}
              />

              {!isLast && (
                <span
                  className={`absolute left-[17px] top-10 h-[calc(100%+0.2rem)] w-[2px] ${
                    state === "locked" ? "bg-slate-200" : "quest-path-line"
                  }`}
                />
              )}

              <button
                type="button"
                onClick={() => level.unlocked && onSelect(level)}
                disabled={!level.unlocked}
                className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                  state === "active"
                    ? "border-brand bg-teal-50"
                    : state === "locked"
                      ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                      : "border-slate-200 bg-white hover:border-brand"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-slate-500">Mission {idx + 1}</span>
                  <span className="text-xs font-semibold">
                    {state === "locked" ? "Locked" : state === "active" ? "In Progress" : "Ready"}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-800">{level.title}</p>
                <p className="mt-1 text-xs text-slate-500">{level.difficulty}</p>
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
