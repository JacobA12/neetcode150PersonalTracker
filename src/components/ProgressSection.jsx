export default function ProgressSection({ stats }) {
  return (
    <section className="progress-section">
      <div className="stats-row">
        <div className="stat total">
          <span className="stat-num">{stats.attempted}</span>
          <span className="stat-label"> / {stats.total} attempted</span>
        </div>
        <div className="stat mastered-stat">
          <span className="stat-num">{stats.mastered}</span>
          <span className="stat-label"> mastered</span>
        </div>
        <div className="stat review-stat">
          <span className="stat-num">{stats.review}</span>
          <span className="stat-label"> in review</span>
        </div>
        <div className="stat due-stat">
          <span className="stat-num">{stats.due}</span>
          <span className="stat-label"> due today</span>
        </div>
      </div>
      <div className="progress-bars">
        <div className="progress-row">
          <div className="progress-track">
            <div
              className="progress-fill easy"
              style={{ width: `${(stats.easy / stats.total) * 100}%` }}
            />
            <div
              className="progress-fill medium"
              style={{ width: `${(stats.medium / stats.total) * 100}%` }}
            />
            <div
              className="progress-fill hard"
              style={{ width: `${(stats.hard / stats.total) * 100}%` }}
            />
          </div>
          <div className="progress-label">
            {stats.mastered} / {stats.total} mastered
          </div>
        </div>
      </div>
    </section>
  );
}
