"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiCheckCircle } from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import { safeRedirect } from "@/lib/api";
import FormAlert from "./FormAlert";

// Supabase sends people here from the confirmation email with
// #access_token=...&refresh_token=...&type=signup (or #error_description=...) in the URL.
export default function ConfirmEmail() {
  const { completeEmailSignIn } = useAuth();
  const router = useRouter();
  const [state, setState] = useState({ status: "working", error: "", redirect: "/" });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // refresh tokens are single-use, so never run this twice
    started.current = true;

    const hash = new URLSearchParams(window.location.hash.slice(1));
    const redirect = safeRedirect(new URLSearchParams(window.location.search).get("redirect"));
    window.history.replaceState(null, "", window.location.pathname + window.location.search); // drop tokens from the URL

    const linkError = hash.get("error_description");
    const refreshToken = hash.get("refresh_token");
    if (linkError || !refreshToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL hash only exists in the browser
      setState({
        status: "error",
        redirect,
        error: linkError ? linkError.replace(/\+/g, " ") : "This confirmation link is invalid or has already been used. Try signing in.",
      });
      return;
    }

    completeEmailSignIn(refreshToken)
      .then(() => {
        setState({ status: "done", error: "", redirect });
        setTimeout(() => router.replace(redirect), 1800);
      })
      .catch((err) => setState({ status: "error", error: err.message, redirect }));
  }, [completeEmailSignIn, router]);

  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-md rounded-[28px] bg-white p-8 text-center shadow-soft sm:p-10">
        {state.status === "working" && (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sand border-t-ink" />
            <p className="mt-6 text-muted">Confirming your email…</p>
          </>
        )}
        {state.status === "done" && (
          <>
            <HiCheckCircle className="mx-auto h-14 w-14 text-green-600" />
            <h1 className="mt-4 text-3xl font-medium">Email confirmed</h1>
            <p className="mt-2 text-muted">You&apos;re signed in. Taking you back…</p>
            <Link href={state.redirect} replace className="btn-dark mt-6">Continue</Link>
          </>
        )}
        {state.status === "error" && (
          <>
            <h1 className="text-3xl font-medium">Couldn&apos;t confirm</h1>
            <div className="mt-6 text-left"><FormAlert>{state.error}</FormAlert></div>
            <Link href="/login" className="btn-dark mt-6 w-full">Go to sign in</Link>
          </>
        )}
      </div>
    </div>
  );
}
