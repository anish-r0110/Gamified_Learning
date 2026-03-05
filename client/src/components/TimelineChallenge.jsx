import { useEffect, useMemo, useState } from "react";

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function TimelineChallenge({ challenge }) {
  const sourceEvents = useMemo(() => challenge?.events || [], [challenge]);
  const [ordered, setOrdered] = useState(() => shuffle(sourceEvents));
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setOrdered(shuffle(sourceEvents));
    setChecked(false);
  }, [sourceEvents]);

  function move(index, dir) {
    const nextIndex = index + dir;
    if (nextIndex < 0 || nextIndex >= ordered.length) return;
    setOrdered((prev) => {
      const arr = [...prev];
      [arr[index], arr[nextIndex]] = [arr[nextIndex], arr[index]];
      return arr;
    });
  }

  const correct = checked
    ? ordered.every((item, idx) => item.order === idx + 1)
    : false;

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-800">{challenge?.title || "Timeline Ordering"}</p>
      <p className="mt-1 text-xs text-slate-500">Arrange events in correct chronological order using up/down buttons.</p>

      <div className="mt-4 space-y-2">
        {ordered.map((event, idx) => (
          <div key={`${event.text}-${event.order}`} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
            <p className="text-sm text-slate-800">{event.text}</p>
            <div className="flex gap-2">
              <button type="button" className="rounded bg-white px-2 py-1 text-xs" onClick={() => move(idx, -1)}>Up</button>
              <button type="button" className="rounded bg-white px-2 py-1 text-xs" onClick={() => move(idx, 1)}>Down</button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white"
        onClick={() => setChecked(true)}
      >
        Check Timeline
      </button>

      {checked && (
        <p className={`mt-2 text-sm ${correct ? "text-emerald-700" : "text-amber-700"}`}>
          {correct ? "Perfect order." : "Not in order yet. Re-arrange and try again."}
        </p>
      )}
    </section>
  );
}
