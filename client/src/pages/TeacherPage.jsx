import { useEffect, useState } from "react";
import { apiRequest } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function TeacherPage() {
  const { token, logout } = useAuth();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/progress/teacher/students", { token })
      .then(setRows)
      .catch((err) => {
        if (err.status === 401) {
          logout();
          return;
        }
        setError(err.message);
      });
  }, []);

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-slate-800">Teacher Dashboard</h2>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3">Student Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Level Reached</th>
              <th className="px-4 py-3">Total Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">{row.email}</td>
                <td className="px-4 py-3">{row.levelReached}</td>
                <td className="px-4 py-3">{row.totalScore}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-4 py-3 text-slate-500" colSpan="4">
                  No student data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
