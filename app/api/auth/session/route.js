import { createAuthClient } from "@/lib/server/supabase";
import { startSession } from "@/lib/server/session";
import { fail, ok, readJson, route } from "@/lib/server/http";

// Finishes sign-in from an email confirmation link: the page posts the link's refresh token here.
export const POST = route(async (request) => {
  const { refresh_token } = await readJson(request);
  if (!refresh_token) return fail(400, "Missing refresh token");
  const { data, error } = await createAuthClient().auth.refreshSession({ refresh_token: String(refresh_token) });
  if (error || !data.session) return fail(401, "This link has expired or was already used. Please sign in.");
  return ok({ user: await startSession(data.session) });
});
