import { useEffect, useState } from "react";
import { loadSession } from "./api";

export function useSession() {
  const [session, setSession] = useState(loadSession);
  useEffect(() => {
    const sync = () => setSession(loadSession());
    window.addEventListener("admin-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("admin-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return session;
}
