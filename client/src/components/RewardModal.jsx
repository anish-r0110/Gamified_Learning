export default function RewardModal({ open, onClose, reward }) {
  if (!open || !reward) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="reward-pop w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Quest Complete</p>
        <h3 className="mt-2 text-2xl font-bold text-slate-900">{reward.title}</h3>
        <p className="mt-2 text-sm text-slate-700">{reward.subtitle}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-amber-50 p-3 text-center">
            <p className="text-xs text-slate-500">XP Gained</p>
            <p className="text-xl font-bold text-amber-700">+{reward.earnedPoints}</p>
          </div>
          <div className="rounded-xl bg-teal-50 p-3 text-center">
            <p className="text-xs text-slate-500">Score</p>
            <p className="text-xl font-bold text-teal-700">{reward.correctAnswers}/5</p>
          </div>
        </div>

        {reward.unlockedNext && (
          <div className="mt-3 rounded-xl bg-emerald-100 p-3 text-sm font-semibold text-emerald-800">
            New mission unlocked.
          </div>
        )}

        <button
          type="button"
          className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          onClick={onClose}
        >
          Continue Quest
        </button>
      </div>
    </div>
  );
}
