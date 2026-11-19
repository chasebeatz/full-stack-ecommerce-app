import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { HiCheckCircle } from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import FormAlert from "../components/FormAlert";
import { safeRedirect } from "../lib/safeRedirect";

// Supabase sends people here from the confirmation email with
// #access_token=...&refresh_token=...&type=signup (or #error_description=...) in the URL.
export default function ConfirmEmail() {
  const { completeEmailSignIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = safeRedirect(params.get("redirect"));
  const [state, setState] = useState("working"); // working | done | error
  const [error, setError] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // StrictMode / re-render guard: refresh tokens are single-use
    started.current = true;

    const hash = new URLSearchParams(window.location.hash.slice(1));
    window.history.replaceState(null, "", window.location.pathname + window.location.search); // drop tokens from the URL

    const linkError = hash.get("error_description");
    const refreshToken = hash.get("refresh_token");
    if (linkError || !refreshToken) {
      setError(
        linkError
          ? linkError.replace(/\+/g, " ")
          : "This confirmation link is invalid or has already been used. Try signing in."
      );
      setState("error");
      return;
    }

    completeEmailSignIn(refreshToken)
      .then(() => {
        setState("done");
        setTimeout(() => navigate(redirect, { replace: true }), 1800);
      })
      .catch((err) => {
        setError(err.message);
        setState("error");
      });
  }, [completeEmailSignIn, navigate, redirect]);

  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-md rounded-[28px] bg-white p-8 text-center shadow-soft sm:p-10">
        {state === "working" && (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sand border-t-ink" />
            <p className="mt-6 text-muted">Confirming your email…</p>
          </>
        )}
        {state === "done" && (
          <>
            <HiCheckCircle className="mx-auto h-14 w-14 text-green-600" />
            <h1 className="mt-4 text-3xl font-medium">Email confirmed</h1>
            <p className="mt-2 text-muted">You&apos;re signed in. Taking you back…</p>
            <Link to={redirect} replace className="btn-dark mt-6">Continue</Link>
          </>
        )}
        {state === "error" && (
          <>
            <h1 className="text-3xl font-medium">Couldn&apos;t confirm</h1>
            <div className="mt-6 text-left">
              <FormAlert>{error}</FormAlert>
            </div>
            <Link to="/login" className="btn-dark mt-6 w-full">Go to sign in</Link>
          </>
        )}
      </div>
    </div>
  );
}
