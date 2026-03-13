import { useState } from "react";

export default function StoryModePanel({ story }) {
  const [choiceIndex, setChoiceIndex] = useState(null);

  const selected = Number.isInteger(choiceIndex) ? story?.choices?.[choiceIndex] : null;

  return (
    <section className="lesson-story mt-5">
      <div className="lesson-story-card">
        <p className="lesson-kicker">Chapter Intro</p>
        <p className="mt-2 text-base leading-7 text-slate-700">{story?.chapterIntro || "No story intro added yet."}</p>
      </div>

      <div className="lesson-story-card lesson-story-npc">
        <p className="lesson-kicker">NPC Guide</p>
        <p className="mt-1 text-base font-semibold text-indigo-900">{story?.npcName || "Guide"}</p>
        <p className="mt-1 text-sm text-indigo-800">{story?.npcTip || "No tip configured."}</p>
      </div>

      <div className="lesson-story-card lesson-story-branch">
        <p className="lesson-kicker">Decision Branch</p>
        <p className="mt-1 text-base text-amber-900">{story?.scenarioPrompt || "No scenario configured."}</p>

        <div className="mt-4 grid gap-2">
          {(story?.choices || []).map((choice, idx) => (
            <button
              key={`${choice.text}-${idx}`}
              type="button"
              className={`lesson-choice ${choiceIndex === idx ? "lesson-choice-active" : ""}`}
              onClick={() => setChoiceIndex(idx)}
            >
              {choice.text}
            </button>
          ))}
        </div>

        {selected && <p className="lesson-outcome mt-4">Outcome: {selected.outcome}</p>}
      </div>
    </section>
  );
}
