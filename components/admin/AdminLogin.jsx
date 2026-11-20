"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "@/assets/logo.svg";
import { useAuth } from "@/context/AuthContext";
import FormAlert from "../FormAlert";
import PasswordInput from "../PasswordInput";

export default function AdminLogin({ user }) {
  const { login, logout } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) return setError("Enter your email and password.");
    setBusy(true);
    try {
      const signedIn = await login(email.trim(), password);
      if (signedIn.role !== "admin") setError("This account doesn't have admin access.");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-3">
          <Image src={logo} alt="Shoppee" className="h-9 w-auto" priority />
          <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">Admin</span>
        </div>

        {user ? (
          <div className="card space-y-4 p-8 text-center">
            <h1 className="text-2xl font-medium">No admin access</h1>
            <p className="text-sm text-muted">
              You&apos;re signed in as <span className="font-semibold text-ink">{user.email}</span>, which isn&apos;t an admin account.
            </p>
            <button onClick={logout} className="btn-dark h-11 w-full">Sign in with another account</button>
            <Link href="/" className="block text-sm text-muted hover:text-ink">Back to the store</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="card space-y-4 p-8">
            <h1 className="text-2xl font-medium">Sign in</h1>
            <FormAlert>{error}</FormAlert>
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <PasswordInput id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button disabled={busy} className="btn-dark h-11 w-full">{busy ? "Signing in…" : "Sign in"}</button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-muted">
          Need access? Run <code className="rounded bg-sand px-1.5 py-0.5">npm run make-admin -- you@example.com</code>
        </p>
      </div>
    </div>
  );
}
