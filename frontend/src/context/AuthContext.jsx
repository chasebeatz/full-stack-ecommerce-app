import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "shoppee-auth";

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(loadSession);
  const refreshing = useRef(null);

  const setSession = useCallback((s) => {
    const next = s ? { access_token: s.access_token, refresh_token: s.refresh_token, expires_at: s.expires_at, user: s.user } : null;
    saveSession(next);
    setSessionState(next);
  }, []);

  const logout = useCallback(() => setSession(null), [setSession]);

  const refresh = useCallback(async () => {
    const current = loadSession();
    if (!current?.refresh_token) throw new Error("Not signed in");
    // share one in-flight refresh between concurrent callers
    refreshing.current ??= api("/auth/refresh", { method: "POST", body: { refresh_token: current.refresh_token } })
      .then((data) => {
        setSession(data);
        return data;
      })
      .finally(() => {
        refreshing.current = null;
      });
    return refreshing.current;
  }, [setSession]);

  // Returns a valid access token, refreshing it if it's about to expire.
  const getToken = useCallback(async () => {
    const current = loadSession();
    if (!current) return null;
    if (current.expires_at * 1000 - Date.now() > 60_000) return current.access_token;
    try {
      return (await refresh()).access_token;
    } catch {
      logout();
      return null;
    }
  }, [refresh, logout]);

  // Authenticated API call; retries once after a refresh if the token was rejected.
  const authApi = useCallback(
    async (path, options = {}) => {
      const token = await getToken();
      if (!token) {
        const err = new Error("Please sign in to continue.");
        err.status = 401;
        throw err;
      }
      try {
        return await api(path, { ...options, token });
      } catch (err) {
        if (err.status !== 401) throw err;
        try {
          const fresh = await refresh();
          return await api(path, { ...options, token: fresh.access_token });
        } catch (retryErr) {
          logout();
          throw retryErr;
        }
      }
    },
    [getToken, refresh, logout]
  );

  // Validate a restored session on first load.
  useEffect(() => {
    if (loadSession()) getToken();
  }, [getToken]);

  // Keep tabs in sync.
  useEffect(() => {
    const onStorage = (e) => e.key === STORAGE_KEY && setSessionState(loadSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = async (email, password) =>
    setSession(await api("/auth/login", { method: "POST", body: { email, password } }));

  // Returns { needsConfirmation: true } when Supabase has emailed a confirmation link.
  const signup = async (name, email, password, redirect) => {
    const data = await api("/auth/signup", { method: "POST", body: { name, email, password, redirect } });
    if (data.needs_confirmation) return { needsConfirmation: true, email: data.email };
    setSession(data);
    return { needsConfirmation: false };
  };

  const resendConfirmation = (email, redirect) =>
    api("/auth/resend-confirmation", { method: "POST", body: { email, redirect } });

  // Finish signing in from the tokens in an email confirmation link.
  const completeEmailSignIn = async (refresh_token) =>
    setSession(await api("/auth/refresh", { method: "POST", body: { refresh_token } }));

  const value = { user: session?.user || null, login, signup, logout, authApi, resendConfirmation, completeEmailSignIn };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
