import { useMemo, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api";
import PasswordInput from "../components/PasswordInput";
import FormAlert from "../components/FormAlert";

export default function ResetPassword() {
  // Supabase sends people here with #access_token=...&type=recovery (or an error) in the URL hash.
  const hash = useMemo(() => new URLSearchParams(window.location.hash.slice(1)), []);
  const token = hash.get("type") === "recovery" ? hash.get("access_token") : null;
  const linkError = hash.get("error_description");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The passwords don't match.");
    setBusy(true);
    try {
      await api("/auth/reset", { method: "POST", body: { access_token: token, password } });
      setDone(true);
      window.history.replaceState(null, "", window.location.pathname); // drop the token from the URL
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

        {done ? (
          <div className="mt-6 space-y-6">
            <FormAlert type="success">Your password has been updated.</FormAlert>
            <Link to="/login" className="btn-dark h-12 w-full">Sign in</Link>
          </div>
        ) : !token ? (
          <div className="mt-6 space-y-6">
            <FormAlert>{linkError ? linkError.replace(/\+/g, " ") : "This reset link is invalid or has expired."}</FormAlert>
            <Link to="/login" className="btn-outline h-12 w-full">Request a new link</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <FormAlert>{error}</FormAlert>
            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium">New password</label>
              <PasswordInput id="new-password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="At least 8 characters" />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium">Confirm password</label>
              <PasswordInput id="confirm-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            </div>
            <button disabled={busy} className="btn-dark h-12 w-full">{busy ? "Saving…" : "Update password"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
