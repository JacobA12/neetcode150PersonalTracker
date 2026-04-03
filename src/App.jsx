import { useEffect, useMemo, useState } from "react";
import { PROBLEMS } from "./problems";

const STORAGE_KEY = "nc150v2";
const DEFAULT_REC = {
  status: "new",
  nextReview: null,
  attempts: [],
  timeComplexity: "",
  spaceComplexity: "",
  explanation: "",
  techniques: [],
  githubUrl: "",
  notes: "",
};

function today() {
  return new Date().toISOString().split("T")[0];
}

function addDays(n) {
  const dt = new Date();
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().split("T")[0];
}

function lcSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "-");
}

function TagInput({ tags, onAdd, onRemove }) {
  const [value, setValue] = useState("");

  return (
    <div className="tags-input-wrap">
      {tags.map((tag) => (
        <span key={tag} className="tag-chip">
          {tag}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRemove(tag);
            }}
          >
            x
          </button>
        </span>
      ))}
      <input
        className="tags-text-input"
        value={value}
        placeholder="Add technique..."
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            onAdd(value);
            setValue("");
          }
          if (event.key === "Backspace" && !value && tags.length) {
            onRemove(tags[tags.length - 1]);
          }
        }}
      />
    </div>
  );
}

export default function App() {
  const allProblems = useMemo(
    () => PROBLEMS.flatMap((cat) => cat.problems),
    [],
  );

  const [data, setData] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return typeof parsed === "object" && parsed ? parsed : {};
    } catch {
      return {};
    }
  });
  const [currentFilter, setCurrentFilter] = useState("all");
  const [currentSearch, setCurrentSearch] = useState("");
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [collapsedCats, setCollapsedCats] = useState(new Set());
  const [modalProbId, setModalProbId] = useState(null);
  const [theme, setTheme] = useState(() =>
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme:dark)").matches
      ? "dark"
      : "light",
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const getRec = (id) => ({ ...DEFAULT_REC, ...(data[id] || {}) });

  const updateRec = (id, updater) => {
    setData((prev) => {
      const next = { ...DEFAULT_REC, ...(prev[id] || {}) };
      const updated = updater(next);
      return { ...prev, [id]: updated };
    });
  };

  const resetAll = () => {
    if (!window.confirm("Reset ALL progress?")) return;
    setData({});
    setExpandedCards(new Set());
  };

  const resetProblem = (id) => {
    if (!window.confirm("Reset this problem's progress?")) return;
    setData((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const isDue = (id) => {
    const rec = getRec(id);
    if (rec.status === "new" || rec.status === "mastered" || !rec.nextReview)
      return false;
    return rec.nextReview <= today();
  };

  const daysUntil = (dateStr) => {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr) - new Date(today())) / 86400000);
  };

  const spawnBurst = (big) => {
    const colors = ["#437a22", "#4f98a3", "#e8af34", "#6daa45"];
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    const count = big ? 20 : 8;

    for (let i = 0; i < count; i += 1) {
      const el = document.createElement("div");
      const size = (big ? 8 : 4) + Math.random() * 10;
      el.className = "burst";
      el.style.cssText = `left:${x + Math.random() * 100 - 50}px;top:${y + Math.random() * 100 - 50}px;width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random() * colors.length)]};animation-delay:${Math.random() * 0.2}s`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 800);
    }
  };

  const logAttempt = (solo) => {
    if (!modalProbId) return;
    const id = modalProbId;

    updateRec(id, (rec) => {
      const attempts = [
        { date: today(), solo, note: "" },
        ...(rec.attempts || []),
      ];
      const next = { ...rec, attempts };

      if (solo) {
        if (next.status === "new" || next.status === "review2") {
          next.status = "review";
          next.nextReview = addDays(14);
        } else if (next.status === "review") {
          next.status = "mastered";
          next.nextReview = null;
          spawnBurst(true);
        }
      } else {
        next.status = "review2";
        next.nextReview = addDays(1);
      }

      return next;
    });

    setModalProbId(null);
    setExpandedCards((prev) => new Set(prev).add(id));
  };

  const markMasteredDirect = (id) => {
    if (!window.confirm("Mark as fully mastered?")) return;
    updateRec(id, (rec) => ({ ...rec, status: "mastered", nextReview: null }));
    spawnBurst(false);
  };

  const toggleCard = (id) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCat = (slug) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const filteredCategories = useMemo(() => {
    const query = currentSearch.trim().toLowerCase();

    return PROBLEMS.map((cat) => {
      const problems = cat.problems.filter((p) => {
        const rec = getRec(p.id);
        if (
          query &&
          !p.name.toLowerCase().includes(query) &&
          !String(p.id).includes(query)
        )
          return false;
        if (currentFilter === "easy" && p.diff !== "easy") return false;
        if (currentFilter === "medium" && p.diff !== "medium") return false;
        if (currentFilter === "hard" && p.diff !== "hard") return false;
        if (currentFilter === "due" && !isDue(p.id)) return false;
        if (currentFilter === "mastered" && rec.status !== "mastered")
          return false;
        if (currentFilter === "new" && rec.status !== "new") return false;
        return true;
      });
      return { ...cat, problems };
    }).filter((cat) => cat.problems.length > 0);
  }, [currentSearch, currentFilter, data]);

  const stats = useMemo(() => {
    let attempted = 0;
    let mastered = 0;
    let review = 0;
    let due = 0;
    let easy = 0;
    let medium = 0;
    let hard = 0;

    allProblems.forEach((p) => {
      const rec = getRec(p.id);
      if (rec.status !== "new") attempted += 1;
      if (rec.status === "mastered") mastered += 1;
      if (rec.status === "review" || rec.status === "review2") review += 1;
      if (isDue(p.id)) due += 1;
      if (rec.status === "mastered") {
        if (p.diff === "easy") easy += 1;
        else if (p.diff === "medium") medium += 1;
        else hard += 1;
      }
    });

    return {
      attempted,
      mastered,
      review,
      due,
      easy,
      medium,
      hard,
      total: allProblems.length,
    };
  }, [allProblems, data]);

  const statusBadge = (status) => {
    if (status === "new") return <span className="status-badge new">New</span>;
    if (status === "review")
      return <span className="status-badge review">2-Week Review</span>;
    if (status === "review2")
      return <span className="status-badge review2">Daily Drill</span>;
    return <span className="status-badge mastered">Mastered</span>;
  };

  const duePill = (id) => {
    const rec = getRec(id);
    if (rec.status === "new" || rec.status === "mastered") return null;
    const n = daysUntil(rec.nextReview);
    if (n === null) return null;
    if (n <= 0) return <span className="due-pill overdue">Due now!</span>;
    if (n === 1) return <span className="due-pill">Due tomorrow</span>;
    if (n <= 3) return <span className="due-pill">Due in {n}d</span>;
    return null;
  };

  return (
    <div className="app">
      <header>
        <div className="logo">
          <div className="logo-text">
            NeetCode <span>150</span>
          </div>
        </div>
        <div className="header-right">
          <button className="text-btn" onClick={resetAll}>
            Reset
          </button>
          <button
            className="icon-btn"
            aria-label="Toggle theme"
            onClick={() =>
              setTheme((prev) => (prev === "dark" ? "light" : "dark"))
            }
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </header>

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

      <section className="controls">
        <div className="search-wrap">
          <input
            type="search"
            id="search"
            placeholder="Search problems..."
            value={currentSearch}
            onChange={(event) => setCurrentSearch(event.target.value)}
          />
        </div>
        <div className="filter-chips">
          {[
            { key: "all", label: "All" },
            { key: "due", label: "Due" },
            { key: "easy", label: "Easy" },
            { key: "medium", label: "Med" },
            { key: "hard", label: "Hard" },
            { key: "mastered", label: "Mastered" },
            { key: "new", label: "New" },
          ].map((chip) => (
            <button
              key={chip.key}
              className={`chip ${chip.key} ${currentFilter === chip.key ? "active" : ""}`}
              onClick={() => setCurrentFilter(chip.key)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </section>

      <main>
        {filteredCategories.length === 0 && (
          <div className="empty-state">
            <p>No problems match your filters.</p>
          </div>
        )}

        {filteredCategories.map((cat) => {
          const catSlug = slugify(cat.cat);
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
            <section
              className={`category ${collapsedCats.has(catSlug) ? "collapsed" : ""}`}
              key={cat.cat}
            >
              <div
                className="category-header"
                onClick={() => toggleCat(catSlug)}
              >
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
                {cat.problems.map((p) => {
                  const rec = getRec(p.id);
                  const expanded = expandedCards.has(p.id);

                  return (
                    <article
                      key={p.id}
                      className={`problem-card status-${rec.status} ${expanded ? "expanded" : ""}`}
                    >
                      <div
                        className="problem-row"
                        onClick={() => toggleCard(p.id)}
                      >
                        <div className="check-wrap">
                          <div className="check-btn">
                            {rec.status !== "new" ? "✓" : ""}
                          </div>
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
                            <label
                              className="field-label"
                              htmlFor={`tc-${p.id}`}
                            >
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
                            <label
                              className="field-label"
                              htmlFor={`sc-${p.id}`}
                            >
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
                            <label className="field-label">
                              Techniques & Algorithms
                            </label>
                            <TagInput
                              tags={rec.techniques || []}
                              onAdd={(tag) => {
                                const trimmed = tag.trim();
                                if (!trimmed) return;
                                updateRec(p.id, (curr) => {
                                  const nextTags = curr.techniques || [];
                                  if (nextTags.includes(trimmed)) return curr;
                                  return {
                                    ...curr,
                                    techniques: [...nextTags, trimmed],
                                  };
                                });
                              }}
                              onRemove={(tag) => {
                                updateRec(p.id, (curr) => ({
                                  ...curr,
                                  techniques: (curr.techniques || []).filter(
                                    (t) => t !== tag,
                                  ),
                                }));
                              }}
                            />
                          </div>

                          <div className="field-group full">
                            <label
                              className="field-label"
                              htmlFor={`exp-${p.id}`}
                            >
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
                            <label
                              className="field-label"
                              htmlFor={`gh-${p.id}`}
                            >
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
                            <label
                              className="field-label"
                              htmlFor={`notes-${p.id}`}
                            >
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
                })}
              </div>
            </section>
          );
        })}
      </main>

      {modalProbId && (
        <div className="modal-backdrop" onClick={() => setModalProbId(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h2>Log Attempt</h2>
            <p>Did you solve this on your own?</p>
            <div className="modal-actions">
              <button
                className="btn btn-success"
                onClick={() => logAttempt(true)}
              >
                Solved solo
              </button>
              <button
                className="btn btn-warning"
                onClick={() => logAttempt(false)}
              >
                Used solution
              </button>
            </div>
            <button
              className="btn btn-outline full"
              onClick={() => setModalProbId(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
