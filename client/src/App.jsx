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

  if (!token || !user) {
    return <LoginPage />;
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-lg">
        <header className="mb-6 flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-brand">Gamified SST Learning Platform</h1>
            <p className="text-sm text-slate-500">Welcome, {user.name}</p>
          </div>
          <button className="rounded-lg bg-slate-800 px-4 py-2 text-white" onClick={logout}>
            Logout
          </button>
        </header>

        {loading && <p className="mb-4 text-sm text-slate-600">Refreshing profile...</p>}
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {user.role === "teacher" ? <TeacherPage /> : <StudentPage />}
      </div>
    </main>
  );
}
