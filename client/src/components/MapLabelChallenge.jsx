import { useMemo, useState } from "react";

export default function MapLabelChallenge({ challenge }) {
  const [assignments, setAssignments] = useState({});
  const [checked, setChecked] = useState(false);

  const correctMap = useMemo(() => {
    const m = {};
    (challenge?.correctMatches || []).forEach((pair) => {
      m[pair.zone] = pair.label;
    });
    return m;
  }, [challenge]);

  function handleDrop(zone, event) {
    event.preventDefault();
    const label = event.dataTransfer.getData("text/plain");
    if (!label) return;

    setAssignments((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((z) => {
        if (copy[z] === label) delete copy[z];
      });
      copy[zone] = label;
      return copy;
    });
  }

  const allPlaced = (challenge?.zones || []).every((zone) => assignments[zone]);
  const score = (challenge?.zones || []).reduce((acc, zone) => acc + (assignments[zone] === correctMap[zone] ? 1 : 0), 0);

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-800">{challenge?.title || "Map Label Challenge"}</p>
      <p className="mt-1 text-xs text-slate-500">Drag each label chip into the correct zone.</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {(challenge?.labels || []).map((label) => {
          const used = Object.values(assignments).includes(label);
          return (
            <span
              key={label}
              draggable={!used}
              onDragStart={(e) => e.dataTransfer.setData("text/plain", label)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${used ? "cursor-not-allowed bg-slate-200 text-slate-500" : "cursor-grab bg-teal-100 text-teal-800"}`}
            >
              {label}
            </span>
          );
        })}
      </div>

      <div className="mt-4 grid gap-2">
        {(challenge?.zones || []).map((zone) => (
          <div
            key={zone}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(zone, e)}
            className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3"
          >
            <p className="text-xs font-semibold text-slate-500">{zone}</p>
            <p className="mt-1 text-sm text-slate-800">{assignments[zone] || "Drop label here"}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={!allPlaced}
        onClick={() => setChecked(true)}
      >
        Check Labels
      </button>

      {checked && <p className="mt-2 text-sm text-slate-700">You matched {score}/{(challenge?.zones || []).length} correctly.</p>}
    </section>
  );
}
