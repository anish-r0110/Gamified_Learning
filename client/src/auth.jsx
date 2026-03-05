import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

function normalizeUser(input) {
  if (!input) return null;
  return {
    ...input,
    points: Number.isFinite(input.points) ? input.points : 0,
    badges: Array.isArray(input.badges) ? input.badges : [],
    currentLevel: Number.isFinite(input.currentLevel) ? input.currentLevel : 0
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;

    try {
      return normalizeUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  const login = (nextToken, nextUser) => {
    const normalized = normalizeUser(nextUser);
    setToken(nextToken);
    setUser(normalized);
    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(normalized));
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      logout,
      setUser: (next) => {
        const resolved = typeof next === "function" ? next(user) : next;
        const normalized = normalizeUser(resolved);
        setUser(normalized);
        if (normalized) {
          localStorage.setItem("user", JSON.stringify(normalized));
        } else {
          localStorage.removeItem("user");
        }
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
