import { createAuthClient } from "@/lib/server/supabase";
import { startSession } from "@/lib/server/session";
import { fail, ok, readJson, route } from "@/lib/server/http";
import { cleanEmail } from "@/lib/server/validate";

export const POST = route(async (request) => {
  const body = await readJson(request);
  const email = cleanEmail(body.email);
  const password = String(body.password || "");
  if (!email || !password) return fail(400, "Please enter your email and password");

  const { data, error } = await createAuthClient().auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed") {
      return fail(403, "Please confirm your email first. Check your inbox for the link we sent.", {
        code: "email_not_confirmed",
      });
    }
    if (error.status === 429) return fail(429, "Too many attempts. Please wait a minute and try again.");
    if (error.status === 400 || error.code === "invalid_credentials") return fail(401, "Incorrect email or password");
    throw error;
  }
  return ok({ user: await startSession(data.session) });
});
