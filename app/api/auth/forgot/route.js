import { createAuthClient } from "@/lib/server/supabase";
import { fail, ok, readJson, route, siteUrl } from "@/lib/server/http";
import { EMAIL_RE, cleanEmail, isRateLimited } from "@/lib/server/validate";

export const POST = route(async (request) => {
  const email = cleanEmail((await readJson(request)).email);
  if (!EMAIL_RE.test(email)) return fail(400, "Please enter a valid email address");

  const { error } = await createAuthClient().auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl(request)}/reset-password`,
  });
  if (isRateLimited(error)) return fail(429, "Too many reset emails were sent recently. Please try again later.");
  if (error) console.error("resetPasswordForEmail:", error.message);
  // Same answer whether or not the account exists, so emails can't be enumerated.
  return ok({ message: "If an account exists for that email, a reset link is on its way." });
});
