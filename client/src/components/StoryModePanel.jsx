import { useState } from "react";

export default function StoryModePanel({ story }) {
  const [choiceIndex, setChoiceIndex] = useState(null);

  const selected = Number.isInteger(choiceIndex) ? story?.choices?.[choiceIndex] : null;

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Chapter Intro</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{story?.chapterIntro || "No story intro added yet."}</p>

      <div className="mt-4 rounded-xl bg-indigo-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">NPC Guide</p>
        <p className="mt-1 text-sm font-semibold text-indigo-900">{story?.npcName || "Guide"}</p>
        <p className="mt-1 text-sm text-indigo-800">{story?.npcTip || "No tip configured."}</p>
      </div>

      <div className="mt-4 rounded-xl bg-amber-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Decision Branch</p>
        <p className="mt-1 text-sm text-amber-900">{story?.scenarioPrompt || "No scenario configured."}</p>

        <div className="mt-3 grid gap-2">
          {(story?.choices || []).map((choice, idx) => (
            <button
              key={`${choice.text}-${idx}`}
              type="button"
              className={`rounded-lg border px-3 py-2 text-left text-sm ${choiceIndex === idx ? "border-amber-500 bg-amber-100" : "border-amber-200 bg-white"}`}
              onClick={() => setChoiceIndex(idx)}
            >
              {choice.text}
            </button>
          ))}
        </div>

        {selected && <p className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-700">Outcome: {selected.outcome}</p>}
      </div>
    </section>
  );
}
