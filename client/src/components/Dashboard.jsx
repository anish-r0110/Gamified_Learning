export default function Dashboard({ points = 0, badges = [], progressPercent = 0 }) {
  const safeBadges = Array.isArray(badges) ? badges : [];
  const safeProgress = Number.isFinite(progressPercent) ? progressPercent : 0;

  return (
    <section className="dashboard-stats mb-6">
      <article className="dashboard-card dashboard-card-points">
        <p className="dashboard-label">Points</p>
        <p className="dashboard-value">{points}</p>
        <p className="dashboard-note">Total XP banked</p>
      </article>

      <article className="dashboard-card dashboard-card-badges">
        <div className="dashboard-headline-row">
          <p className="dashboard-label">Badges</p>
          <span className="dashboard-count">{safeBadges.length}</span>
        </div>

        <div className="dashboard-badges mt-2">
          {safeBadges.length ? safeBadges.map((badge) => <span key={badge} className="dashboard-badge-chip">{badge}</span>) : <span className="dashboard-note">No badges yet</span>}
        </div>
      </article>

      <article className="dashboard-card dashboard-card-progress">
        <p className="dashboard-label">Progress</p>
        <div className="dashboard-meter mt-2">
          <div className="dashboard-meter-fill" style={{ width: `${safeProgress}%` }} />
        </div>
        <p className="dashboard-note mt-2">{safeProgress}% complete</p>
      </article>
    </section>
  );
}
