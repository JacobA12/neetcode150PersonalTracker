const FILTER_CHIPS = [
  { key: "all", label: "All" },
  { key: "due", label: "Due" },
  { key: "easy", label: "Easy" },
  { key: "medium", label: "Med" },
  { key: "hard", label: "Hard" },
  { key: "mastered", label: "Mastered" },
  { key: "new", label: "New" },
];

export default function Controls({
  currentSearch,
  currentFilter,
  onSearchChange,
  onFilterChange,
}) {
  return (
    <section className="controls">
      <div className="search-wrap">
        <input
          type="search"
          id="search"
          placeholder="Search problems..."
          value={currentSearch}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className="filter-chips">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.key}
            className={`chip ${chip.key} ${currentFilter === chip.key ? "active" : ""}`}
            onClick={() => onFilterChange(chip.key)}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </section>
  );
}
