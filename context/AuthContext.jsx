"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

// The session itself lives in httpOnly cookies set by /api/auth/*; this only mirrors who is signed in.
export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(undefined); // undefined while loading, then a user or null

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      api("/api/auth/me")
        .then((d) => !cancelled && setUser(d.user))
        .catch(() => !cancelled && setUser(null));
    load();
    // pick up sign-ins/outs from other tabs when this one comes back into focus
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const signedIn = useCallback(
    (next) => {
      setUser(next);
      router.refresh(); // re-render server components that depend on the session
      return next;
    },
    [router]
  );

  const login = useCallback(
    async (email, password) => signedIn((await api("/api/auth/login", { method: "POST", body: { email, password } })).user),
    [signedIn]
  );

  // Returns { needsConfirmation: true, email } when Supabase has emailed a confirmation link.
  const signup = useCallback(
    async (name, email, password, redirect) => {
      const data = await api("/api/auth/signup", { method: "POST", body: { name, email, password, redirect } });
      if (data.needs_confirmation) return { needsConfirmation: true, email: data.email };
      signedIn(data.user);
      return { needsConfirmation: false };
    },
    [signedIn]
  );

  const completeEmailSignIn = useCallback(
    async (refresh_token) => signedIn((await api("/api/auth/session", { method: "POST", body: { refresh_token } })).user),
    [signedIn]
  );

  const logout = useCallback(async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    router.refresh();
  }, [router]);

  const resendConfirmation = useCallback(
    (email, redirect) => api("/api/auth/resend-confirmation", { method: "POST", body: { email, redirect } }),
    []
  );

  const value = useMemo(
    () => ({ user: user ?? null, loading: user === undefined, login, signup, logout, resendConfirmation, completeEmailSignIn }),
    [user, login, signup, logout, resendConfirmation, completeEmailSignIn]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
