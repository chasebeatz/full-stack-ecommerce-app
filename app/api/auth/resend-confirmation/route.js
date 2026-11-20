import { createAuthClient } from "@/lib/server/supabase";
import { fail, ok, readJson, route, siteUrl } from "@/lib/server/http";
import { EMAIL_RE, cleanEmail, isRateLimited, safePath } from "@/lib/server/validate";

export const POST = route(async (request) => {
  const body = await readJson(request);
  const email = cleanEmail(body.email);
  if (!EMAIL_RE.test(email)) return fail(400, "Please enter a valid email address");
  const { error } = await createAuthClient().auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${siteUrl(request)}/auth/confirm?redirect=${encodeURIComponent(safePath(body.redirect))}` },
  });
  if (isRateLimited(error)) return fail(429, "Please wait a minute before requesting another email.");
  if (error) console.error("resend confirmation:", error.message);
  return ok({ message: "If that account still needs confirming, a new link is on its way." });
});
