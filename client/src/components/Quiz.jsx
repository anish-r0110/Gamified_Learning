import { useState } from "react";

export default function Quiz({ level, onSubmit, submitting }) {
  const [answers, setAnswers] = useState(Array(5).fill(-1));

  function selectAnswer(questionIndex, optionIndex) {
    const copy = [...answers];
    copy[questionIndex] = optionIndex;
    setAnswers(copy);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (answers.includes(-1)) {
      return;
    }

    onSubmit(answers);
  }

  return (
    <form className="rounded-xl border border-slate-200 bg-slate-50 p-4" onSubmit={handleSubmit}>
      <h3 className="mb-4 text-lg font-bold text-slate-800">{level.title} Quiz (5 Questions)</h3>

      {level.quizQuestions.map((question, qIdx) => (
        <fieldset key={question.prompt} className="mb-4 rounded-lg bg-white p-3">
          <legend className="mb-2 text-sm font-semibold text-slate-700">{qIdx + 1}. {question.prompt}</legend>
          <div className="grid gap-2">
            {question.options.map((option, oIdx) => (
              <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name={`question-${qIdx}`}
                  checked={answers[qIdx] === oIdx}
                  onChange={() => selectAnswer(qIdx, oIdx)}
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <button className="rounded-lg bg-brand px-4 py-2 text-white" disabled={submitting || answers.includes(-1)}>
        {submitting ? "Submitting..." : "Submit Quiz"}
      </button>
    </form>
  );
}
