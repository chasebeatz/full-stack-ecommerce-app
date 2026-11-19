import { useState } from "react";
import { Link } from "react-router";
import loginImg from "../assets/product_5.png";

export default function Login() {
  const [mode, setMode] = useState("signup");
  const isSignup = mode === "signup";

  return (
    <div className="container-x py-10 md:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-soft md:grid-cols-2">
        <div className="relative hidden bg-sand md:block">
          <img src={loginImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <h2 className="text-3xl font-medium leading-tight">Members get more.</h2>
            <p className="mt-2 text-sm text-white/80">Early access to drops, free returns and 10% off your first order.</p>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <h1 className="text-3xl font-medium md:text-4xl">{isSignup ? "Create an account" : "Welcome back"}</h1>
          <p className="mt-2 text-sm text-muted">
            {isSignup ? "Already have an account? " : "New to Shoppee? "}
            <button
              onClick={() => setMode(isSignup ? "login" : "signup")}
              className="font-semibold text-ink underline underline-offset-4 hover:text-accent-dark"
            >
              {isSignup ? "Sign in" : "Create one"}
            </button>
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="mt-8 space-y-4">
            {isSignup && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Full name</label>
                <input id="name" type="text" autoComplete="name" className="input" placeholder="Jane Doe" />
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
              <input id="email" type="email" autoComplete="email" className="input" placeholder="you@example.com" />
            </div>
            <div>
              <div className="mb-1.5 flex justify-between">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                {!isSignup && <a href="#" className="text-sm text-muted hover:text-ink">Forgot?</a>}
              </div>
              <input
                id="password"
                type="password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                className="input"
                placeholder="••••••••"
              />
            </div>

            {isSignup && (
              <label className="flex items-start gap-3 pt-1 text-sm text-muted">
                <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-line text-ink focus:ring-ink" />
                <span>
                  I agree to the <Link to="/" className="underline">terms of use</Link> and{" "}
                  <Link to="/" className="underline">privacy policy</Link>.
                </span>
              </label>
            )}

            <button className="btn-dark h-12 w-full">{isSignup ? "Create account" : "Sign in"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
