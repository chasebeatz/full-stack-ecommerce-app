import { Router } from "express";
import { supabase, createAuthClient } from "../lib/supabase.js";
import { publicUser, requireUser, sessionPayload } from "../lib/auth.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

// Only same-site paths like "/checkout"; never "//other-site.com".
const safePath = (p) => (typeof p === "string" && /^\/(?!\/)/.test(p) ? p : "/");
const confirmUrl = (redirect) => `${FRONTEND_URL}/auth/confirm?redirect=${encodeURIComponent(safePath(redirect))}`;
const isRateLimited = (error) => error?.status === 429 || error?.code === "over_email_send_rate_limit";

const fail = (res, status, message) => res.status(status).json({ success: false, message });

router.post("/signup", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name) return fail(res, 400, "Please enter your name");
    if (!EMAIL_RE.test(email)) return fail(res, 400, "Please enter a valid email address");
    if (password.length < 8) return fail(res, 400, "Password must be at least 8 characters");

    // Supabase emails a confirmation link; the account can't sign in until it's clicked.
    const { data, error } = await createAuthClient().auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: confirmUrl(req.body.redirect) },
    });
    if (error) {
      if (error.code === "weak_password") return fail(res, 400, error.message);
      if (isRateLimited(error)) {
        return fail(res, 429, "Too many confirmation emails were sent recently. Please try again later.");
      }
      if (error.code === "email_address_not_authorized") {
        return fail(res, 400, "We can't send email to that address yet. Please try another email or contact support.");
      }
      throw error;
    }
    // For an already-confirmed email, Supabase returns a placeholder user with no identities.
    if (data.user && data.user.identities?.length === 0) {
      return fail(res, 409, "An account with this email already exists. Try signing in.");
    }
    // If confirmation is switched off in Supabase, a session comes back straight away.
    if (data.session) return res.status(201).json({ success: true, ...sessionPayload(data.session) });
    res.status(201).json({ success: true, needs_confirmation: true, email });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password) return fail(res, 400, "Please enter your email and password");

    const { data, error } = await createAuthClient().auth.signInWithPassword({ email, password });
    if (error) {
      if (error.code === "email_not_confirmed") {
        return res.status(403).json({
          success: false,
          code: "email_not_confirmed",
          message: "Please confirm your email first. Check your inbox for the link we sent.",
        });
      }
      if (error.status === 400 || error.code === "invalid_credentials") {
        return fail(res, 401, "Incorrect email or password");
      }
      if (error.status === 429) return fail(res, 429, "Too many attempts. Please wait a minute and try again.");
      throw error;
    }
    res.json({ success: true, ...sessionPayload(data.session) });
  } catch (err) {
    next(err);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const refresh_token = String(req.body.refresh_token || "");
    if (!refresh_token) return fail(res, 400, "Missing refresh token");
    const { data, error } = await createAuthClient().auth.refreshSession({ refresh_token });
    if (error || !data.session) return fail(res, 401, "Your session has expired. Please sign in again.");
    res.json({ success: true, ...sessionPayload(data.session) });
  } catch (err) {
    next(err);
  }
});

router.post("/resend-confirmation", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return fail(res, 400, "Please enter a valid email address");
    const { error } = await createAuthClient().auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: confirmUrl(req.body.redirect) },
    });
    if (isRateLimited(error)) return fail(res, 429, "Please wait a minute before requesting another email.");
    if (error) console.error("resend confirmation:", error.message);
    res.json({ success: true, message: "If that account still needs confirming, a new link is on its way." });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireUser, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.post("/forgot", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return fail(res, 400, "Please enter a valid email address");

    const redirectTo = `${FRONTEND_URL}/reset-password`;
    const { error } = await createAuthClient().auth.resetPasswordForEmail(email, { redirectTo });
    if (error?.status === 429) {
      return fail(res, 429, "Too many reset emails were sent recently. Please try again later.");
    }
    if (error) console.error("resetPasswordForEmail:", error.message);
    // Same answer whether or not the account exists, so emails can't be enumerated.
    res.json({ success: true, message: "If an account exists for that email, a reset link is on its way." });
  } catch (err) {
    next(err);
  }
});

router.post("/reset", async (req, res, next) => {
  try {
    const access_token = String(req.body.access_token || "");
    const password = String(req.body.password || "");
    if (password.length < 8) return fail(res, 400, "Password must be at least 8 characters");

    const { data, error } = await supabase.auth.getUser(access_token);
    if (error || !data.user) return fail(res, 401, "This reset link is invalid or has expired. Request a new one.");

    const { error: updateError } = await supabase.auth.admin.updateUserById(data.user.id, { password });
    if (updateError) throw updateError;
    res.json({ success: true, user: publicUser(data.user), message: "Password updated. You can now sign in." });
  } catch (err) {
    next(err);
  }
});

export default router;
