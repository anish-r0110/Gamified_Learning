function getNodePosition(index, total) {
  if (total <= 1) {
    return { x: 50, y: 50 };
  }

  const cols = Math.min(4, total);
  const rows = Math.ceil(total / cols);
  const row = Math.floor(index / cols);
  const col = index % cols;
  const zigzagCol = row % 2 === 1 ? cols - 1 - col : col;

  const x = 20 + (zigzagCol / Math.max(1, cols - 1)) * 60;
  const y = rows === 1 ? 50 : 20 + (row / Math.max(1, rows - 1)) * 60;
  return { x, y };
}

function getLineStyle(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return {
    left: `${from.x}%`,
    top: `${from.y}%`,
    width: `${distance}%`,
    transform: `rotate(${angle}deg)`
  };
}

export default function QuestMap({ levels = [], currentLevelId, onSelect }) {
  if (!levels.length) {
    return (
      <section className="quest-map-canvas rounded-xl p-4">
        <p className="section-title mb-3">Quest Map</p>
        <div className="quest-map-empty rounded-lg border border-slate-200 p-5">
          No missions yet. New levels will appear here.
        </div>
      </section>
    );
  }

  const points = levels.map((_level, idx) => getNodePosition(idx, levels.length));
  const columns = Math.min(4, levels.length);
  const rowCount = Math.ceil(levels.length / columns);
  const mapHeight = Math.max(200, rowCount * 170);
  const unlockedCount = levels.filter((level) => level.unlocked).length;

  return (
    <section className="quest-map-canvas rounded-xl p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="section-title">Quest Map</p>
        <p className="quest-map-meta">
          {unlockedCount}/{levels.length} unlocked
        </p>
      </div>

      <div className="relative overflow-x-auto rounded-lg border border-slate-200 bg-white/70 p-4" style={{ minHeight: mapHeight }}>
        <div className="quest-map-grid" />

        {points.slice(0, -1).map((point, idx) => {
          const nextPoint = points[idx + 1];
          const currentLevel = levels[idx];
          const connected = currentLevel?.unlocked;
          return (
            <span
              key={`line-${idx}`}
              className={`quest-map-connector ${connected ? "quest-map-connector-open" : "quest-map-connector-locked"}`}
              style={getLineStyle(point, nextPoint)}
            />
          );
        })}

        {levels.map((level, idx) => {
          const state = !level.unlocked ? "locked" : currentLevelId === level._id ? "active" : "open";
          const position = points[idx];

          return (
            <button
              key={level._id}
              type="button"
              onClick={() => level.unlocked && onSelect(level)}
              disabled={!level.unlocked}
              className={`quest-map-node ${
                state === "active" ? "quest-map-node-active" : state === "locked" ? "quest-map-node-locked" : "quest-map-node-open"
              }`}
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
            >
              <span className="quest-map-node-label">L{idx + 1}</span>
              <span className="quest-map-node-title">{level.title}</span>
              <span className="quest-map-node-subtitle">{state === "locked" ? "Locked" : "Ready"}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
