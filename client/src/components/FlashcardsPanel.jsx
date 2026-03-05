import { useState } from "react";

export default function FlashcardsPanel({ cards = [] }) {
  const [flipped, setFlipped] = useState({});

  return (
    <section className="mt-5 grid gap-3 md:grid-cols-2">
      {cards.length === 0 && <p className="text-sm text-slate-600">No flashcards configured for this section.</p>}
      {cards.map((card, idx) => {
        const isFlipped = Boolean(flipped[idx]);
        return (
          <button
            key={`${card.front}-${idx}`}
            type="button"
            className="rounded-xl border border-slate-200 bg-white p-4 text-left"
            onClick={() => setFlipped((prev) => ({ ...prev, [idx]: !prev[idx] }))}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Flashcard {idx + 1}</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{isFlipped ? card.back : card.front}</p>
            <p className="mt-2 text-xs text-slate-500">Tap to {isFlipped ? "show question" : "reveal answer"}</p>
          </button>
        );
      })}
    </section>
  );
}
