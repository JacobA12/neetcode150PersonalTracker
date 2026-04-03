import ProblemCard from "./ProblemCard";

export default function CategorySection({
  cat,
  collapsed,
  toggleCat,
  getRec,
  isDue,
  expandedCards,
  toggleCard,
  statusBadge,
  duePill,
  updateRec,
  setModalProbId,
  markMasteredDirect,
  resetProblem,
}) {
  const dueInCat = cat.problems.filter((p) => isDue(p.id)).length;
  const doneCount = cat.problems.filter(
    (p) => getRec(p.id).status !== "new",
  ).length;
  const masteredCount = cat.problems.filter(
    (p) => getRec(p.id).status === "mastered",
  ).length;
  const total = cat.problems.length;
  const pct = doneCount / total;
  const circ = 2 * Math.PI * 14;

  return (
    <section className={`category ${collapsed ? "collapsed" : ""}`}>
      <div className="category-header" onClick={toggleCat}>
        <span className="cat-icon">{cat.icon}</span>
        <span className="cat-title">{cat.cat}</span>
        <div className="cat-meta">
          {dueInCat > 0 && (
            <span className="cat-due-badge">{dueInCat} due</span>
          )}
          <div className="cat-progress-ring">
            <svg width="38" height="38" viewBox="0 0 38 38">
              <circle className="ring-bg" cx="19" cy="19" r="14" />
              <circle
                className="ring-fill"
                cx="19"
                cy="19"
                r="14"
                style={{
                  strokeDasharray: circ,
                  strokeDashoffset: circ * (1 - pct),
                }}
              />
            </svg>
            <div className="ring-label">
              {masteredCount}/{total}
            </div>
          </div>
          <span className="collapse-arrow">▾</span>
        </div>
      </div>

      <div className="problems-list">
        {cat.problems.map((problem) => {
          const rec = getRec(problem.id);
          return (
            <ProblemCard
              key={problem.id}
              problem={problem}
              rec={rec}
              expanded={expandedCards.has(problem.id)}
              isDue={isDue}
              statusBadge={statusBadge}
              duePill={duePill}
              toggleCard={toggleCard}
              updateRec={updateRec}
              setModalProbId={setModalProbId}
              markMasteredDirect={markMasteredDirect}
              resetProblem={resetProblem}
            />
          );
        })}
      </div>
    </section>
  );
}
