import TagInput from "./TagInput";

function lcSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ProblemCard({
  problem,
  rec,
  expanded,
  isDue,
  statusBadge,
  duePill,
  toggleCard,
  updateRec,
  setModalProbId,
  markMasteredDirect,
  resetProblem,
}) {
  const p = problem;

  return (
    <article
      className={`problem-card status-${rec.status} ${expanded ? "expanded" : ""}`}
    >
      <div className="problem-row" onClick={() => toggleCard(p.id)}>
        <div className="check-wrap">
          <div className="check-btn">{rec.status !== "new" ? "✓" : ""}</div>
        </div>
        <div className="problem-title-wrap">
          <div className="problem-name">{p.name}</div>
        </div>
        <span className={`diff-badge ${p.diff}`}>{p.diff}</span>
        {statusBadge(rec.status)}
        {duePill(p.id)}
        <span className="expand-arrow">▾</span>
      </div>

      <div className="detail-panel">
        <div className="detail-grid">
          <div className="field-group">
            <label className="field-label" htmlFor={`tc-${p.id}`}>
              Time Complexity
            </label>
            <input
              id={`tc-${p.id}`}
              className="field-input mono-input"
              value={rec.timeComplexity || ""}
              onChange={(event) =>
                updateRec(p.id, (curr) => ({
                  ...curr,
                  timeComplexity: event.target.value,
                }))
              }
              placeholder="e.g. O(n log n)"
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor={`sc-${p.id}`}>
              Space Complexity
            </label>
            <input
              id={`sc-${p.id}`}
              className="field-input mono-input"
              value={rec.spaceComplexity || ""}
              onChange={(event) =>
                updateRec(p.id, (curr) => ({
                  ...curr,
                  spaceComplexity: event.target.value,
                }))
              }
              placeholder="e.g. O(n)"
            />
          </div>

          <div className="field-group full">
            <label className="field-label">Techniques & Algorithms</label>
            <TagInput
              tags={rec.techniques || []}
              onAdd={(tag) => {
                const trimmed = tag.trim();
                if (!trimmed) return;
                updateRec(p.id, (curr) => {
                  const nextTags = curr.techniques || [];
                  if (nextTags.includes(trimmed)) return curr;
                  return { ...curr, techniques: [...nextTags, trimmed] };
                });
              }}
              onRemove={(tag) => {
                updateRec(p.id, (curr) => ({
                  ...curr,
                  techniques: (curr.techniques || []).filter((t) => t !== tag),
                }));
              }}
            />
          </div>

          <div className="field-group full">
            <label className="field-label" htmlFor={`exp-${p.id}`}>
              Solution Explanation
            </label>
            <textarea
              id={`exp-${p.id}`}
              className="field-input tall"
              value={rec.explanation || ""}
              onChange={(event) =>
                updateRec(p.id, (curr) => ({
                  ...curr,
                  explanation: event.target.value,
                }))
              }
              placeholder="Explain the key idea and edge cases..."
            />
          </div>

          <div className="field-group full">
            <label className="field-label" htmlFor={`gh-${p.id}`}>
              GitHub Link
            </label>
            <input
              id={`gh-${p.id}`}
              className="field-input"
              type="url"
              value={rec.githubUrl || ""}
              onChange={(event) =>
                updateRec(p.id, (curr) => ({
                  ...curr,
                  githubUrl: event.target.value,
                }))
              }
              placeholder="https://github.com/..."
            />
          </div>

          <div className="field-group full">
            <label className="field-label" htmlFor={`notes-${p.id}`}>
              Additional Notes
            </label>
            <textarea
              id={`notes-${p.id}`}
              className="field-input"
              value={rec.notes || ""}
              onChange={(event) =>
                updateRec(p.id, (curr) => ({
                  ...curr,
                  notes: event.target.value,
                }))
              }
              placeholder="Gotchas and reminders..."
            />
          </div>
        </div>

        <div className="detail-actions">
          <button
            className="btn btn-primary"
            onClick={(event) => {
              event.stopPropagation();
              setModalProbId(p.id);
            }}
          >
            Log Attempt
          </button>
          <a
            className="btn btn-outline"
            target="_blank"
            rel="noreferrer"
            href={`https://leetcode.com/problems/${lcSlug(p.name)}/`}
            onClick={(event) => event.stopPropagation()}
          >
            LeetCode
          </a>
          <a
            className="btn btn-outline"
            target="_blank"
            rel="noreferrer"
            href={`https://neetcode.io/problems/${lcSlug(p.name)}`}
            onClick={(event) => event.stopPropagation()}
          >
            NeetCode
          </a>
          {rec.status === "review" && isDue(p.id) && (
            <button
              className="btn btn-success"
              onClick={(event) => {
                event.stopPropagation();
                markMasteredDirect(p.id);
              }}
            >
              Mark Mastered
            </button>
          )}
          <button
            className="btn btn-ghost"
            onClick={(event) => {
              event.stopPropagation();
              resetProblem(p.id);
            }}
          >
            Reset
          </button>
          <span className="action-hint">#{p.id}</span>
        </div>
      </div>
    </article>
  );
}
