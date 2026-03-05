export default function LessonCard({ level, onStart }) {
  return (
    <article className={`rounded-xl border p-4 ${level.unlocked ? "border-brand bg-white" : "border-slate-200 bg-slate-50"}`}>
      <p className="text-xs uppercase tracking-wide text-slate-500">{level.difficulty}</p>
      <h3 className="mt-1 text-lg font-semibold text-slate-800">{level.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{level.content}</p>
      <button
        className={`mt-4 rounded-lg px-3 py-2 text-sm font-semibold ${level.unlocked ? "bg-brand text-white" : "cursor-not-allowed bg-slate-300 text-slate-600"}`}
        disabled={!level.unlocked}
        onClick={() => onStart(level)}
      >
        {level.unlocked ? "Start Lesson & Quiz" : "Locked"}
      </button>
    </article>
  );
}
