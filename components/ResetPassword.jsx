"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import PasswordInput from "./PasswordInput";
import FormAlert from "./FormAlert";

export default function ResetPassword() {
  // Supabase sends people here with #access_token=...&type=recovery (or an error) in the URL hash.
  const [link, setLink] = useState(null); // null until read in the browser
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL hash, which only exists in the browser
    setLink({
      token: hash.get("type") === "recovery" ? hash.get("access_token") : null,
      error: hash.get("error_description")?.replace(/\+/g, " ") || "",
    });
    if (window.location.hash) window.history.replaceState(null, "", window.location.pathname); // drop the token from the URL
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The passwords don't match.");
    setBusy(true);
    try {
      await api("/api/auth/reset", { method: "POST", body: { access_token: link.token, password } });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container-x py-16">
      <div className="mx-auto max-w-md rounded-[28px] bg-white p-8 shadow-soft sm:p-10">
        <h1 className="text-3xl font-medium">Choose a new password</h1>
        {!link ? (
          <div className="skeleton mt-6 h-40" />
        ) : done ? (
          <div className="mt-6 space-y-6">
            <FormAlert type="success">Your password has been updated.</FormAlert>
            <Link href="/login" className="btn-dark h-12 w-full">Sign in</Link>
          </div>
        ) : !link.token ? (
          <div className="mt-6 space-y-6">
            <FormAlert>{link.error || "This reset link is invalid or has expired."}</FormAlert>
            <Link href="/login" className="btn-outline h-12 w-full">Request a new link</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <FormAlert>{error}</FormAlert>
            <div>
              <label htmlFor="new-password" className="label">New password</label>
              <PasswordInput id="new-password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="At least 8 characters" />
            </div>
            <div>
              <label htmlFor="confirm-password" className="label">Confirm password</label>
              <PasswordInput id="confirm-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            </div>
            <button disabled={busy} className="btn-dark h-12 w-full">{busy ? "Saving…" : "Update password"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
