export default function Header({ theme, onToggleTheme, onResetAll }) {
  return (
    <header>
      <div className="logo">
        <div className="logo-text">
          NeetCode <span>150</span>
        </div>
      </div>
      <div className="header-right">
        <button className="text-btn" onClick={onResetAll}>
          Reset
        </button>
        <button
          className="icon-btn"
          aria-label="Toggle theme"
          onClick={onToggleTheme}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
      </div>
    </header>
  );
}
