import { createAuthClient } from "@/lib/server/supabase";
import { startSession } from "@/lib/server/session";
import { fail, ok, readJson, route, siteUrl } from "@/lib/server/http";
import { EMAIL_RE, cleanEmail, isRateLimited, safePath } from "@/lib/server/validate";

export const POST = route(async (request) => {
  const body = await readJson(request);
  const name = String(body.name || "").trim();
  const email = cleanEmail(body.email);
  const password = String(body.password || "");

  if (!name) return fail(400, "Please enter your name");
  if (!EMAIL_RE.test(email)) return fail(400, "Please enter a valid email address");
  if (password.length < 8) return fail(400, "Password must be at least 8 characters");

  // Supabase emails a confirmation link; the account can't sign in until it's clicked.
  const emailRedirectTo = `${siteUrl(request)}/auth/confirm?redirect=${encodeURIComponent(safePath(body.redirect))}`;
  const { data, error } = await createAuthClient().auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo },
  });
  if (error) {
    if (error.code === "weak_password") return fail(400, error.message);
    if (isRateLimited(error)) return fail(429, "Too many confirmation emails were sent recently. Please try again later.");
    if (error.code === "email_address_not_authorized") {
      return fail(400, "We can't send email to that address yet. Please try another email or contact support.");
    }
    throw error;
  }
  // For an already-registered email, Supabase returns a placeholder user with no identities.
  if (data.user && data.user.identities?.length === 0) {
    return fail(409, "An account with this email already exists. Try signing in.");
  }
  // If confirmation is switched off in Supabase, a session comes back straight away.
  if (data.session) return ok({ user: await startSession(data.session) }, 201);
  return ok({ needs_confirmation: true, email }, 201);
});
