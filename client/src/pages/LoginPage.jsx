import { useState } from "react";
import { apiRequest } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await apiRequest("/auth/register", {
          method: "POST",
          body: JSON.stringify(form)
        });
      }

      const payload = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: form.email, password: form.password })
      });

      login(payload.token, payload.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell flex items-center justify-center">
      <form className="app-card w-full max-w-md p-6" onSubmit={submit}>
        <p className="section-title">Welcome Back</p>
        <h1 className="mb-1 text-3xl font-bold text-brand">SST Quest Portal</h1>
        <p className="mb-5 text-sm text-slate-600">Students and teachers use the same gateway.</p>

        {isRegister && (
          <input
            className="input-ui mb-3 w-full p-2.5"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        )}

        <input
          type="email"
          className="input-ui mb-3 w-full p-2.5"
          placeholder="Email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          required
        />

        <input
          type="password"
          className="input-ui mb-3 w-full p-2.5"
          placeholder="Password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          required
        />

        {isRegister && (
          <select
            className="input-ui mb-3 w-full p-2.5"
            value={form.role}
            onChange={(e) => updateField("role", e.target.value)}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        )}

        {error && <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}

        <button className="cta-btn w-full py-2.5 text-sm" disabled={loading}>
          {loading ? "Please wait..." : isRegister ? "Register & Login" : "Login"}
        </button>

        <button
          type="button"
          className="mt-3 text-sm font-semibold text-slate-600 underline"
          onClick={() => setIsRegister((prev) => !prev)}
        >
          {isRegister ? "Have an account? Login" : "Need an account? Register"}
        </button>
      </form>
    </main>
  );
}
