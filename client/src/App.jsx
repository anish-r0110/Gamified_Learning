import { useEffect, useState } from "react";
import { useAuth } from "./auth.jsx";
import { apiRequest } from "./api.js";
import LoginPage from "./pages/LoginPage.jsx";
import StudentPage from "./pages/StudentPage.jsx";
import TeacherPage from "./pages/TeacherPage.jsx";

export default function App() {
  const { token, user, setUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    async function hydrate() {
      if (!token || !user) return;
      try {
        setLoading(true);
        const data = await apiRequest("/progress/me", { token });
        setUser({ ...user, ...data.profile });
      } catch (err) {
        if (err.status === 401) {
          logout();
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    hydrate();
  }, [token]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const themeToggleButton = (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <span className="theme-toggle-text">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
      <span className="theme-toggle-indicator" aria-hidden="true" />
    </button>
  );

  if (!token || !user) {
    return (
      <>
        {themeToggleButton}
        <LoginPage />
      </>
    );
  }

  return (
    <main className="app-shell">
      {themeToggleButton}
      <header className="app-topbar">
        <div className="app-topbar-brand">
          <span className="app-coin" aria-hidden="true" />
          <span>LearnQuest</span>
        </div>

        <nav className="app-topbar-nav" aria-label="Primary">
          <span>Learn</span>
          <span>Practice</span>
          <span>Progress</span>
        </nav>

        <button className="hero-cta hero-cta-sm" onClick={logout}>
          Logout
        </button>
      </header>

      <section className="hero-banner mb-4">
        <p className="hero-kicker">Mission Hub</p>
        <h1 className="hero-title">Gamified Learning Platform</h1>
        <p className="hero-subtitle">Welcome, {user.name}. Continue your social studies quest.</p>
      </section>

      {loading && <p className="mb-4 text-sm text-slate-700">Refreshing profile...</p>}
      {error && <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}

      <section className="w-full">{user.role === "teacher" ? <TeacherPage /> : <StudentPage />}</section>
    </main>
  );
}
