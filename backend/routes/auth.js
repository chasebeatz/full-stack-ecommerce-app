import { Router } from "express";
import { supabase, createAuthClient } from "../lib/supabase.js";
import { publicUser, requireUser, sessionPayload } from "../lib/auth.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fail = (res, status, message) => res.status(status).json({ success: false, message });

router.post("/signup", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name) return fail(res, 400, "Please enter your name");
    if (!EMAIL_RE.test(email)) return fail(res, 400, "Please enter a valid email address");
    if (password.length < 8) return fail(res, 400, "Password must be at least 8 characters");

    // Accounts are confirmed immediately. Supabase's built-in email sender only allows a
    // couple of emails per hour, so requiring confirmation would block sign-ups in practice.
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error) {
      if (error.code === "email_exists" || /already/i.test(error.message)) {
        return fail(res, 409, "An account with this email already exists. Try signing in.");
      }
      if (error.code === "weak_password") return fail(res, 400, error.message);
      throw error;
    }

    const { data, error: loginError } = await createAuthClient().auth.signInWithPassword({ email, password });
    if (loginError) throw loginError;
    res.status(201).json({ success: true, ...sessionPayload(data.session) });
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

router.get("/me", requireUser, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.post("/forgot", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return fail(res, 400, "Please enter a valid email address");

    const redirectTo = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password`;
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
