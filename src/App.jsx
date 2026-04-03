import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import ProgressSection from "./components/ProgressSection";
import Controls from "./components/Controls";
import CategorySection from "./components/CategorySection";
import LogAttemptModal from "./components/LogAttemptModal";
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

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "-");
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
      <Header
        theme={theme}
        onToggleTheme={() =>
          setTheme((prev) => (prev === "dark" ? "light" : "dark"))
        }
        onResetAll={resetAll}
      />

      <ProgressSection stats={stats} />

      <Controls
        currentSearch={currentSearch}
        currentFilter={currentFilter}
        onSearchChange={setCurrentSearch}
        onFilterChange={setCurrentFilter}
      />

      <main>
        {filteredCategories.length === 0 && (
          <div className="empty-state">
            <p>No problems match your filters.</p>
          </div>
        )}

        {filteredCategories.map((cat) => {
          const catSlug = slugify(cat.cat);

          return (
            <CategorySection
              key={cat.cat}
              cat={cat}
              collapsed={collapsedCats.has(catSlug)}
              toggleCat={() => toggleCat(catSlug)}
              getRec={getRec}
              isDue={isDue}
              expandedCards={expandedCards}
              toggleCard={toggleCard}
              statusBadge={statusBadge}
              duePill={duePill}
              updateRec={updateRec}
              setModalProbId={setModalProbId}
              markMasteredDirect={markMasteredDirect}
              resetProblem={resetProblem}
            />
          );
        })}
      </main>

      {modalProbId && (
        <LogAttemptModal
          onSolo={() => logAttempt(true)}
          onHelped={() => logAttempt(false)}
          onClose={() => setModalProbId(null)}
        />
      )}
    </div>
  );
}
