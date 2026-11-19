import { useState } from "react";
import { HiExclamationCircle } from "react-icons/hi";
import logo from "../assets/logo.svg";
import { login } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Enter your email and password.");
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-3">
          <img src={logo} alt="Shoppee" className="h-9" />
          <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">Admin</span>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-8">
          <h1 className="text-2xl font-medium">Sign in</h1>
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              <HiExclamationCircle className="mt-0.5 h-5 w-5 shrink-0" /> {error}
            </p>
          )}
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
          </div>
          <button disabled={busy} className="btn-dark h-11 w-full">{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        <p className="mt-6 text-center text-xs text-muted">
          Need access? Run <code className="rounded bg-sand px-1.5 py-0.5">npm run make-admin -- you@example.com</code> in the backend.
        </p>
      </div>
    </div>
  );
}
