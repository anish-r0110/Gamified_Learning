import { useEffect, useState } from "react";
import { apiRequest } from "../api.js";
import { useAuth } from "../auth.jsx";

function makeDefaultForm() {
  return {
    title: "",
    order: 1,
    difficulty: "Beginner",
    content: "",
    storyMode: {
      chapterIntro: "",
      npcName: "",
      npcTip: "",
      scenarioPrompt: "",
      choices: [
        { text: "", outcome: "" },
        { text: "", outcome: "" },
        { text: "", outcome: "" }
      ]
    },
    flashcards: [
      { front: "", back: "" },
      { front: "", back: "" },
      { front: "", back: "" }
    ],
    mapChallenge: {
      title: "",
      zones: ["", "", ""],
      labels: ["", "", ""],
      correctMatches: [{ zone: "", label: "" }]
    },
    timelineChallenge: {
      title: "",
      events: [
        { text: "", order: 1 },
        { text: "", order: 2 },
        { text: "", order: 3 }
      ]
    },
    quizQuestions: Array.from({ length: 5 }, () => ({
      prompt: "",
      options: ["", "", "", ""],
      correctOption: 0
    }))
  };
}

function mapLevelToForm(level) {
  const fallbackQuestions = Array.from({ length: 5 }, (_, idx) => ({
    prompt: level?.quizQuestions?.[idx]?.prompt || "",
    options: Array.from({ length: 4 }, (_v, optIdx) => level?.quizQuestions?.[idx]?.options?.[optIdx] || ""),
    correctOption: Number.isFinite(level?.quizQuestions?.[idx]?.correctOption)
      ? level.quizQuestions[idx].correctOption
      : 0
  }));

  const fallbackStoryChoices = Array.from({ length: 3 }, (_, idx) => ({
    text: level?.storyMode?.choices?.[idx]?.text || "",
    outcome: level?.storyMode?.choices?.[idx]?.outcome || ""
  }));

  return {
    title: level?.title || "",
    order: Number.isFinite(level?.order) ? level.order : 1,
    difficulty: level?.difficulty || "Beginner",
    content: level?.content || "",
    storyMode: {
      chapterIntro: level?.storyMode?.chapterIntro || "",
      npcName: level?.storyMode?.npcName || "",
      npcTip: level?.storyMode?.npcTip || "",
      scenarioPrompt: level?.storyMode?.scenarioPrompt || "",
      choices: fallbackStoryChoices
    },
    flashcards: (level?.flashcards || []).length
      ? level.flashcards.map((card) => ({
          front: card?.front || "",
          back: card?.back || ""
        }))
      : [{ front: "", back: "" }],
    mapChallenge: {
      title: level?.mapChallenge?.title || "",
      zones: (level?.mapChallenge?.zones || []).length ? [...level.mapChallenge.zones] : [""],
      labels: (level?.mapChallenge?.labels || []).length ? [...level.mapChallenge.labels] : [""],
      correctMatches: (level?.mapChallenge?.correctMatches || []).length
        ? level.mapChallenge.correctMatches.map((pair) => ({
            zone: pair?.zone || "",
            label: pair?.label || ""
          }))
        : [{ zone: "", label: "" }]
    },
    timelineChallenge: {
      title: level?.timelineChallenge?.title || "",
      events: (level?.timelineChallenge?.events || []).length
        ? level.timelineChallenge.events.map((event, idx) => ({
            text: event?.text || "",
            order: Number.isFinite(event?.order) ? event.order : idx + 1
          }))
        : [{ text: "", order: 1 }]
    },
    quizQuestions: fallbackQuestions
  };
}

export default function TeacherPage() {
  const { token, logout } = useAuth();
  const [tab, setTab] = useState("overview");
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [levels, setLevels] = useState([]);
  const [form, setForm] = useState(makeDefaultForm);
  const [editingLevelId, setEditingLevelId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  function updateQuestion(index, updates) {
    setForm((prev) => {
      const quizQuestions = [...prev.quizQuestions];
      quizQuestions[index] = { ...quizQuestions[index], ...updates };
      return { ...prev, quizQuestions };
    });
  }

  function updateQuestionOption(questionIdx, optionIdx, value) {
    setForm((prev) => {
      const quizQuestions = [...prev.quizQuestions];
      const options = [...quizQuestions[questionIdx].options];
      options[optionIdx] = value;
      quizQuestions[questionIdx] = { ...quizQuestions[questionIdx], options };
      return { ...prev, quizQuestions };
    });
  }

  function updateStoryField(key, value) {
    setForm((prev) => ({
      ...prev,
      storyMode: {
        ...prev.storyMode,
        [key]: value
      }
    }));
  }

  function updateStoryChoice(index, key, value) {
    setForm((prev) => {
      const choices = [...prev.storyMode.choices];
      choices[index] = { ...choices[index], [key]: value };
      return {
        ...prev,
        storyMode: {
          ...prev.storyMode,
          choices
        }
      };
    });
  }

  function updateFlashcard(index, key, value) {
    setForm((prev) => {
      const flashcards = [...prev.flashcards];
      flashcards[index] = { ...flashcards[index], [key]: value };
      return { ...prev, flashcards };
    });
  }

  function addFlashcard() {
    setForm((prev) => ({
      ...prev,
      flashcards: [...prev.flashcards, { front: "", back: "" }]
    }));
  }

  function removeFlashcard(index) {
    setForm((prev) => {
      const flashcards = prev.flashcards.filter((_item, idx) => idx !== index);
      return {
        ...prev,
        flashcards: flashcards.length ? flashcards : [{ front: "", back: "" }]
      };
    });
  }

  function updateMapChallengeField(key, value) {
    setForm((prev) => ({
      ...prev,
      mapChallenge: {
        ...prev.mapChallenge,
        [key]: value
      }
    }));
  }

  function updateMapList(key, index, value) {
    setForm((prev) => {
      const nextList = [...prev.mapChallenge[key]];
      nextList[index] = value;
      return {
        ...prev,
        mapChallenge: {
          ...prev.mapChallenge,
          [key]: nextList
        }
      };
    });
  }

  function addMapListItem(key) {
    setForm((prev) => ({
      ...prev,
      mapChallenge: {
        ...prev.mapChallenge,
        [key]: [...prev.mapChallenge[key], ""]
      }
    }));
  }

  function removeMapListItem(key, index) {
    setForm((prev) => {
      const nextList = prev.mapChallenge[key].filter((_item, idx) => idx !== index);
      return {
        ...prev,
        mapChallenge: {
          ...prev.mapChallenge,
          [key]: nextList.length ? nextList : [""]
        }
      };
    });
  }

  function updateMapMatch(index, key, value) {
    setForm((prev) => {
      const correctMatches = [...prev.mapChallenge.correctMatches];
      correctMatches[index] = { ...correctMatches[index], [key]: value };
      return {
        ...prev,
        mapChallenge: {
          ...prev.mapChallenge,
          correctMatches
        }
      };
    });
  }

  function addMapMatch() {
    setForm((prev) => ({
      ...prev,
      mapChallenge: {
        ...prev.mapChallenge,
        correctMatches: [...prev.mapChallenge.correctMatches, { zone: "", label: "" }]
      }
    }));
  }

  function removeMapMatch(index) {
    setForm((prev) => {
      const correctMatches = prev.mapChallenge.correctMatches.filter((_item, idx) => idx !== index);
      return {
        ...prev,
        mapChallenge: {
          ...prev.mapChallenge,
          correctMatches: correctMatches.length ? correctMatches : [{ zone: "", label: "" }]
        }
      };
    });
  }

  function updateTimelineField(key, value) {
    setForm((prev) => ({
      ...prev,
      timelineChallenge: {
        ...prev.timelineChallenge,
        [key]: value
      }
    }));
  }

  function updateTimelineEvent(index, key, value) {
    setForm((prev) => {
      const events = [...prev.timelineChallenge.events];
      events[index] = { ...events[index], [key]: value };
      return {
        ...prev,
        timelineChallenge: {
          ...prev.timelineChallenge,
          events
        }
      };
    });
  }

  function addTimelineEvent() {
    setForm((prev) => ({
      ...prev,
      timelineChallenge: {
        ...prev.timelineChallenge,
        events: [...prev.timelineChallenge.events, { text: "", order: prev.timelineChallenge.events.length + 1 }]
      }
    }));
  }

  function removeTimelineEvent(index) {
    setForm((prev) => {
      const events = prev.timelineChallenge.events.filter((_item, idx) => idx !== index);
      return {
        ...prev,
        timelineChallenge: {
          ...prev.timelineChallenge,
          events: events.length ? events : [{ text: "", order: 1 }]
        }
      };
    });
  }

  function resetForm(nextLevelOrder) {
    const defaults = makeDefaultForm();
    defaults.order = Number.isFinite(nextLevelOrder) ? nextLevelOrder : 1;
    setForm(defaults);
    setEditingLevelId("");
  }

  useEffect(() => {
    Promise.all([
      apiRequest("/progress/teacher/students", { token }),
      apiRequest("/progress/teacher/summary", { token }),
      apiRequest("/progress/teacher/attempts?limit=20", { token }),
      apiRequest("/lessons", { token })
    ])
      .then(([students, summaryData, attemptsData, levelsData]) => {
        setRows(students);
        setSummary(summaryData);
        setAttempts(attemptsData);
        setLevels(levelsData);
        setForm((prev) => ({
          ...prev,
          order: levelsData.length + 1
        }));
      })
      .catch((err) => {
        if (err.status === 401) {
          logout();
          return;
        }
        setError(err.message);
      });
  }, []);

  async function saveLevel(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        order: Number(form.order),
        difficulty: form.difficulty,
        content: form.content.trim(),
        storyMode: {
          chapterIntro: form.storyMode.chapterIntro.trim(),
          npcName: form.storyMode.npcName.trim(),
          npcTip: form.storyMode.npcTip.trim(),
          scenarioPrompt: form.storyMode.scenarioPrompt.trim(),
          choices: form.storyMode.choices
            .map((choice) => ({
              text: choice.text.trim(),
              outcome: choice.outcome.trim()
            }))
            .filter((choice) => choice.text && choice.outcome)
        },
        flashcards: form.flashcards
          .map((card) => ({
            front: card.front.trim(),
            back: card.back.trim()
          }))
          .filter((card) => card.front && card.back),
        mapChallenge: {
          title: form.mapChallenge.title.trim(),
          zones: form.mapChallenge.zones.map((item) => item.trim()).filter(Boolean),
          labels: form.mapChallenge.labels.map((item) => item.trim()).filter(Boolean),
          correctMatches: form.mapChallenge.correctMatches
            .map((pair) => ({
              zone: pair.zone.trim(),
              label: pair.label.trim()
            }))
            .filter((pair) => pair.zone && pair.label)
        },
        timelineChallenge: {
          title: form.timelineChallenge.title.trim(),
          events: form.timelineChallenge.events
            .map((event, idx) => ({
              text: event.text.trim(),
              order: Number.isFinite(Number(event.order)) ? Number(event.order) : idx + 1
            }))
            .filter((event) => event.text)
        },
        quizQuestions: form.quizQuestions.map((q) => ({
          prompt: q.prompt.trim(),
          options: q.options.map((option) => option.trim()),
          correctOption: Number(q.correctOption)
        }))
      };

      if (editingLevelId) {
        await apiRequest(`/lessons/${editingLevelId}`, {
          method: "PUT",
          token,
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest("/lessons", {
          method: "POST",
          token,
          body: JSON.stringify(payload)
        });
      }

      const [updatedLevels, summaryData, attemptsData] = await Promise.all([
        apiRequest("/lessons", { token }),
        apiRequest("/progress/teacher/summary", { token }),
        apiRequest("/progress/teacher/attempts?limit=20", { token })
      ]);

      setLevels(updatedLevels);
      setSummary(summaryData);
      setAttempts(attemptsData);
      resetForm(updatedLevels.length + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteLevel(levelId) {
    const shouldDelete = window.confirm("Delete this level and all related student scores?");
    if (!shouldDelete) return;

    setError("");
    setDeletingId(levelId);

    try {
      await apiRequest(`/lessons/${levelId}`, {
        method: "DELETE",
        token
      });

      const [updatedLevels, updatedRows, summaryData, attemptsData] = await Promise.all([
        apiRequest("/lessons", { token }),
        apiRequest("/progress/teacher/students", { token }),
        apiRequest("/progress/teacher/summary", { token }),
        apiRequest("/progress/teacher/attempts?limit=20", { token })
      ]);

      setLevels(updatedLevels);
      setRows(updatedRows);
      setSummary(summaryData);
      setAttempts(attemptsData);
      if (editingLevelId === levelId) {
        resetForm(updatedLevels.length + 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId("");
    }
  }

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "students", label: "Students" },
    { key: "content", label: "Content Manager" }
  ];

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-slate-800">Teacher Dashboard</h2>
      {error && <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`pill-btn px-3 py-1.5 text-xs ${tab === item.key ? "pill-btn-active" : ""}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <section className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <article className="panel bg-sky-50/70 p-4">
              <p className="text-xs uppercase text-slate-500">Students</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{summary?.studentCount ?? 0}</p>
            </article>
            <article className="panel bg-emerald-50/70 p-4">
              <p className="text-xs uppercase text-slate-500">Pass Rate</p>
              <p className="mt-1 text-2xl font-bold text-emerald-800">{summary?.passRate ?? 0}%</p>
            </article>
            <article className="panel bg-amber-50/70 p-4">
              <p className="text-xs uppercase text-slate-500">Avg Score</p>
              <p className="mt-1 text-2xl font-bold text-amber-700">{summary?.avgScorePercent ?? 0}%</p>
            </article>
            <article className="panel bg-indigo-50/70 p-4">
              <p className="text-xs uppercase text-slate-500">Attempts</p>
              <p className="mt-1 text-2xl font-bold text-indigo-800">{summary?.totalAttempts ?? 0}</p>
            </article>
          </div>

          <div className="panel p-4">
            <p className="text-sm font-semibold text-slate-800">Top Performer</p>
            {!summary?.topStudent && <p className="mt-1 text-sm text-slate-500">No student data available yet.</p>}
            {summary?.topStudent && (
              <p className="mt-1 text-sm text-slate-700">
                {summary.topStudent.name} ({summary.topStudent.email}) with {summary.topStudent.points} points, level{" "}
                {summary.topStudent.currentLevel}
              </p>
            )}
          </div>

          <div className="panel overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">XP</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3">
                      <p>{item.studentName}</p>
                      <p className="text-xs text-slate-500">{item.studentEmail}</p>
                    </td>
                    <td className="px-4 py-3">{item.levelTitle}</td>
                    <td className="px-4 py-3">{item.passed ? "Passed" : "Retry"}</td>
                    <td className="px-4 py-3">
                      {item.score}/{item.totalQuestions}
                    </td>
                    <td className="px-4 py-3">{item.pointsAwarded}</td>
                    <td className="px-4 py-3">{new Date(item.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
                {attempts.length === 0 && (
                  <tr>
                    <td className="px-4 py-3 text-slate-500" colSpan="6">
                      No attempts yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "students" && (
        <div className="panel overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Level Reached</th>
                <th className="px-4 py-3">Total Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3">{row.levelReached}</td>
                  <td className="px-4 py-3">{row.totalScore}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-slate-500" colSpan="4">
                    No student data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "content" && (
        <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="panel p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">Current Levels</p>
              <span className="text-xs text-slate-500">{levels.length} total</span>
            </div>
            <div className="space-y-2">
              {levels
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((level) => (
                  <article key={level._id} className="rounded-lg border border-slate-200 bg-white/80 p-3">
                    <p className="text-xs text-slate-500">
                      Level {level.order} - {level.difficulty}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{level.title}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="ghost-btn px-2 py-1 text-xs"
                        onClick={() => {
                          setEditingLevelId(level._id);
                          setForm(mapLevelToForm(level));
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700"
                        disabled={deletingId === level._id}
                        onClick={() => deleteLevel(level._id)}
                      >
                        {deletingId === level._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              {levels.length === 0 && <p className="text-sm text-slate-500">No levels yet.</p>}
            </div>
          </div>

          <form className="panel p-4" onSubmit={saveLevel}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">
                {editingLevelId ? "Edit Level" : "Create Level"}
              </p>
              {editingLevelId && (
                <button
                  type="button"
                  className="text-xs font-semibold text-slate-600 underline"
                  onClick={() => resetForm(levels.length + 1)}
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Title</label>
            <input
              className="input-ui mb-3 w-full p-2 text-sm"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />

            <div className="mb-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Order</label>
                <input
                  type="number"
                  min="1"
                  className="input-ui w-full p-2 text-sm"
                  value={form.order}
                  onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Difficulty</label>
                <select
                  className="input-ui w-full p-2 text-sm"
                  value={form.difficulty}
                  onChange={(e) => setForm((prev) => ({ ...prev, difficulty: e.target.value }))}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                </select>
              </div>
            </div>

            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Content</label>
            <textarea
              rows="3"
              className="input-ui mb-4 w-full p-2 text-sm"
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              required
            />

            <div className="panel mb-4 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Story Mode</p>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Chapter Intro</label>
              <textarea
                rows="2"
                className="input-ui mb-2 w-full p-2 text-sm"
                value={form.storyMode.chapterIntro}
                onChange={(e) => updateStoryField("chapterIntro", e.target.value)}
              />
              <div className="mb-2 grid gap-2 sm:grid-cols-2">
                <input
                  className="input-ui p-2 text-sm"
                  placeholder="NPC Name"
                  value={form.storyMode.npcName}
                  onChange={(e) => updateStoryField("npcName", e.target.value)}
                />
                <input
                  className="input-ui p-2 text-sm"
                  placeholder="NPC Tip"
                  value={form.storyMode.npcTip}
                  onChange={(e) => updateStoryField("npcTip", e.target.value)}
                />
              </div>
              <input
                className="input-ui mb-2 w-full p-2 text-sm"
                placeholder="Scenario Prompt"
                value={form.storyMode.scenarioPrompt}
                onChange={(e) => updateStoryField("scenarioPrompt", e.target.value)}
              />
              <div className="space-y-2">
                {form.storyMode.choices.map((choice, idx) => (
                  <div key={`story-choice-${idx}`} className="rounded border border-slate-200 bg-white/80 p-2">
                    <p className="mb-1 text-xs font-semibold text-slate-500">Choice {idx + 1}</p>
                    <input
                      className="input-ui mb-1 w-full p-2 text-sm"
                      placeholder="Choice text"
                      value={choice.text}
                      onChange={(e) => updateStoryChoice(idx, "text", e.target.value)}
                    />
                    <input
                      className="input-ui w-full p-2 text-sm"
                      placeholder="Choice outcome"
                      value={choice.outcome}
                      onChange={(e) => updateStoryChoice(idx, "outcome", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="panel mb-4 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Flashcards</p>
                <button
                  type="button"
                  className="ghost-btn px-2 py-1 text-xs"
                  onClick={addFlashcard}
                >
                  Add Card
                </button>
              </div>
              <div className="space-y-2">
                {form.flashcards.map((card, idx) => (
                  <div key={`flashcard-${idx}`} className="rounded border border-slate-200 bg-white/80 p-2">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-500">Card {idx + 1}</p>
                      <button
                        type="button"
                        className="text-xs font-semibold text-rose-600"
                        onClick={() => removeFlashcard(idx)}
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      className="input-ui mb-1 w-full p-2 text-sm"
                      placeholder="Front"
                      value={card.front}
                      onChange={(e) => updateFlashcard(idx, "front", e.target.value)}
                    />
                    <input
                      className="input-ui w-full p-2 text-sm"
                      placeholder="Back"
                      value={card.back}
                      onChange={(e) => updateFlashcard(idx, "back", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="panel mb-4 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Map Challenge</p>
              <input
                className="input-ui mb-2 w-full p-2 text-sm"
                placeholder="Map challenge title"
                value={form.mapChallenge.title}
                onChange={(e) => updateMapChallengeField("title", e.target.value)}
              />
              <div className="mb-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500">Zones</p>
                    <button
                      type="button"
                      className="ghost-btn px-2 py-1 text-xs"
                      onClick={() => addMapListItem("zones")}
                    >
                      Add
                    </button>
                  </div>
                  {form.mapChallenge.zones.map((zone, idx) => (
                    <div key={`zone-${idx}`} className="mb-1 flex gap-1">
                      <input
                        className="input-ui w-full p-2 text-sm"
                        placeholder={`Zone ${idx + 1}`}
                        value={zone}
                        onChange={(e) => updateMapList("zones", idx, e.target.value)}
                      />
                      <button
                        type="button"
                      className="rounded border border-rose-200 bg-rose-50 px-2 text-xs text-rose-600"
                        onClick={() => removeMapListItem("zones", idx)}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500">Labels</p>
                    <button
                      type="button"
                      className="ghost-btn px-2 py-1 text-xs"
                      onClick={() => addMapListItem("labels")}
                    >
                      Add
                    </button>
                  </div>
                  {form.mapChallenge.labels.map((label, idx) => (
                    <div key={`label-${idx}`} className="mb-1 flex gap-1">
                      <input
                        className="input-ui w-full p-2 text-sm"
                        placeholder={`Label ${idx + 1}`}
                        value={label}
                        onChange={(e) => updateMapList("labels", idx, e.target.value)}
                      />
                      <button
                        type="button"
                      className="rounded border border-rose-200 bg-rose-50 px-2 text-xs text-rose-600"
                        onClick={() => removeMapListItem("labels", idx)}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500">Correct Matches</p>
                <button
                  type="button"
                  className="ghost-btn px-2 py-1 text-xs"
                  onClick={addMapMatch}
                >
                  Add Match
                </button>
              </div>
              {form.mapChallenge.correctMatches.map((pair, idx) => (
                <div key={`pair-${idx}`} className="mb-1 grid gap-1 sm:grid-cols-[1fr_1fr_auto]">
                  <input
                    className="input-ui p-2 text-sm"
                    placeholder="Zone"
                    value={pair.zone}
                    onChange={(e) => updateMapMatch(idx, "zone", e.target.value)}
                  />
                  <input
                    className="input-ui p-2 text-sm"
                    placeholder="Label"
                    value={pair.label}
                    onChange={(e) => updateMapMatch(idx, "label", e.target.value)}
                  />
                  <button
                    type="button"
                    className="rounded border border-rose-200 bg-rose-50 px-2 text-xs text-rose-600"
                    onClick={() => removeMapMatch(idx)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="panel mb-4 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Timeline Challenge</p>
                <button
                  type="button"
                  className="ghost-btn px-2 py-1 text-xs"
                  onClick={addTimelineEvent}
                >
                  Add Event
                </button>
              </div>
              <input
                className="input-ui mb-2 w-full p-2 text-sm"
                placeholder="Timeline title"
                value={form.timelineChallenge.title}
                onChange={(e) => updateTimelineField("title", e.target.value)}
              />
              {form.timelineChallenge.events.map((event, idx) => (
                <div key={`timeline-event-${idx}`} className="mb-1 grid gap-1 sm:grid-cols-[1fr_100px_auto]">
                  <input
                    className="input-ui p-2 text-sm"
                    placeholder="Event text"
                    value={event.text}
                    onChange={(e) => updateTimelineEvent(idx, "text", e.target.value)}
                  />
                  <input
                    type="number"
                    min="1"
                    className="input-ui p-2 text-sm"
                    placeholder="Order"
                    value={event.order}
                    onChange={(e) => updateTimelineEvent(idx, "order", Number(e.target.value))}
                  />
                  <button
                    type="button"
                    className="rounded border border-rose-200 bg-rose-50 px-2 text-xs text-rose-600"
                    onClick={() => removeTimelineEvent(idx)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Quiz Questions (5)</p>
            <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
              {form.quizQuestions.map((question, qIdx) => (
                <fieldset key={`question-${qIdx}`} className="rounded-lg border border-slate-200 bg-white/80 p-3">
                  <legend className="text-xs font-semibold text-slate-600">Question {qIdx + 1}</legend>
                  <input
                    className="input-ui mt-2 w-full p-2 text-sm"
                    placeholder="Question prompt"
                    value={question.prompt}
                    onChange={(e) => updateQuestion(qIdx, { prompt: e.target.value })}
                    required
                  />

                  <div className="mt-2 grid gap-2">
                    {question.options.map((option, oIdx) => (
                      <input
                        key={`q-${qIdx}-opt-${oIdx}`}
                        className="input-ui p-2 text-sm"
                        placeholder={`Option ${oIdx + 1}`}
                        value={option}
                        onChange={(e) => updateQuestionOption(qIdx, oIdx, e.target.value)}
                        required
                      />
                    ))}
                  </div>

                  <label className="mt-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Correct Option
                  </label>
                  <select
                    className="input-ui mt-1 p-2 text-sm"
                    value={question.correctOption}
                    onChange={(e) => updateQuestion(qIdx, { correctOption: Number(e.target.value) })}
                  >
                    <option value={0}>Option 1</option>
                    <option value={1}>Option 2</option>
                    <option value={2}>Option 3</option>
                    <option value={3}>Option 4</option>
                  </select>
                </fieldset>
              ))}
            </div>

            <button className="cta-btn mt-4 px-4 py-2 text-sm" disabled={saving}>
              {saving ? "Saving..." : editingLevelId ? "Update Level" : "Create Level"}
            </button>
          </form>
        </section>
      )}
    </section>
  );
}
