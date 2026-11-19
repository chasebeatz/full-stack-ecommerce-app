import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { HiArrowLeft } from "react-icons/hi";
import loginImg from "../assets/product_5.png";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import PasswordInput from "../components/PasswordInput";
import FormAlert from "../components/FormAlert";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const COPY = {
  signup: { title: "Create an account", button: "Create account", busy: "Creating account…" },
  login: { title: "Welcome back", button: "Sign in", busy: "Signing in…" },
  forgot: { title: "Reset your password", button: "Send reset link", busy: "Sending…" },
};

export default function Login() {
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const redirect = params.get("redirect")?.startsWith("/") ? params.get("redirect") : "/";

  const [mode, setMode] = useState(params.get("mode") === "signup" ? "signup" : "login");
  const [form, setForm] = useState({ name: "", email: "", password: "", terms: false });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setErrors({});
    setServerError("");
    setNotice("");
  }, [mode]);

  if (user) return <Navigate to={redirect} replace />;

  const switchMode = (next) => {
    setMode(next);
    const p = new URLSearchParams(params);
    if (next === "signup") p.set("mode", "signup");
    else p.delete("mode");
    setParams(p, { replace: true });
  };

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (mode === "signup" && !form.name.trim()) er.name = "Please enter your name";
    if (!EMAIL_RE.test(form.email.trim())) er.email = "Please enter a valid email address";
    if (mode !== "forgot") {
      if (!form.password) er.password = "Please enter your password";
      else if (mode === "signup" && form.password.length < 8) er.password = "Use at least 8 characters";
    }
    if (mode === "signup" && !form.terms) er.terms = "Please accept the terms to continue";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError("");
    setNotice("");
    if (!validate()) return;
    setBusy(true);
    try {
      if (mode === "forgot") {
        const data = await api("/auth/forgot", { method: "POST", body: { email: form.email.trim() } });
        setNotice(data.message);
      } else {
        if (mode === "signup") await signup(form.name.trim(), form.email.trim(), form.password);
        else await login(form.email.trim(), form.password);
        navigate(redirect, { replace: true });
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const fieldError = (name) =>
    errors[name] && (
      <p id={`${name}-error`} className="mt-1.5 text-xs text-red-600">
        {errors[name]}
      </p>
    );
  const invalid = (name) => (errors[name] ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {});
  const isSignup = mode === "signup";

  return (
    <div className="container-x py-10 md:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-soft md:grid-cols-2">
        <div className="relative hidden bg-sand md:block">
          <img src={loginImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <h2 className="text-3xl font-medium leading-tight">Members get more.</h2>
            <p className="mt-2 text-sm text-white/80">Track your orders, check out faster and get 10% off with code WELCOME10.</p>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          {mode === "forgot" && (
            <button onClick={() => switchMode("login")} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
              <HiArrowLeft /> Back to sign in
            </button>
          )}
          <h1 className="text-3xl font-medium md:text-4xl">{COPY[mode].title}</h1>
          {mode === "forgot" ? (
            <p className="mt-2 text-sm text-muted">Enter your email and we&apos;ll send you a link to choose a new password.</p>
          ) : (
            <p className="mt-2 text-sm text-muted">
              {isSignup ? "Already have an account? " : "New to Shoppee? "}
              <button
                onClick={() => switchMode(isSignup ? "login" : "signup")}
                className="font-semibold text-ink underline underline-offset-4 hover:text-accent-dark"
              >
                {isSignup ? "Sign in" : "Create one"}
              </button>
            </p>
          )}

          <form onSubmit={submit} noValidate className="mt-8 space-y-4">
            <FormAlert>{serverError}</FormAlert>
            <FormAlert type="success">{notice}</FormAlert>

            {isSignup && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Full name</label>
                <input id="name" name="name" value={form.name} onChange={update} autoComplete="name" className="input" placeholder="Jane Doe" {...invalid("name")} />
                {fieldError("name")}
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={update} autoComplete="email" className="input" placeholder="you@example.com" {...invalid("email")} />
              {fieldError("email")}
            </div>
            {mode !== "forgot" && (
              <div>
                <div className="mb-1.5 flex justify-between">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  {!isSignup && (
                    <button type="button" onClick={() => switchMode("forgot")} className="text-sm text-muted hover:text-ink">
                      Forgot password?
                    </button>
                  )}
                </div>
                <PasswordInput
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={update}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  placeholder={isSignup ? "At least 8 characters" : "••••••••"}
                  {...invalid("password")}
                />
                {fieldError("password")}
              </div>
            )}

            {isSignup && (
              <div>
                <label className="flex items-start gap-3 pt-1 text-sm text-muted">
                  <input name="terms" type="checkbox" checked={form.terms} onChange={update} className="mt-0.5 h-4 w-4 rounded border-line text-ink focus:ring-ink" />
                  <span>
                    I agree to the <Link to="/" className="underline">terms of use</Link> and <Link to="/" className="underline">privacy policy</Link>.
                  </span>
                </label>
                {fieldError("terms")}
              </div>
            )}

            <button disabled={busy} className="btn-dark h-12 w-full">
              {busy ? COPY[mode].busy : COPY[mode].button}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
