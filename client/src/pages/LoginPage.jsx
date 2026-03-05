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
    <main className="flex min-h-screen items-center justify-center p-6">
      <form className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onSubmit={submit}>
        <h1 className="mb-1 text-2xl font-bold text-brand">SST Quest Login</h1>
        <p className="mb-5 text-sm text-slate-500">For students and teachers</p>

        {isRegister && (
          <input
            className="mb-3 w-full rounded-lg border p-2"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        )}

        <input
          type="email"
          className="mb-3 w-full rounded-lg border p-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          required
        />

        <input
          type="password"
          className="mb-3 w-full rounded-lg border p-2"
          placeholder="Password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          required
        />

        {isRegister && (
          <select
            className="mb-3 w-full rounded-lg border p-2"
            value={form.role}
            onChange={(e) => updateField("role", e.target.value)}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        )}

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <button className="w-full rounded-lg bg-brand py-2 font-semibold text-white" disabled={loading}>
          {loading ? "Please wait..." : isRegister ? "Register & Login" : "Login"}
        </button>

        <button
          type="button"
          className="mt-3 text-sm text-slate-600 underline"
          onClick={() => setIsRegister((prev) => !prev)}
        >
          {isRegister ? "Have an account? Login" : "Need an account? Register"}
        </button>
      </form>
    </main>
  );
}
