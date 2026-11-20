import { getSupabase } from "@/lib/server/supabase";
import { fail, ok, readJson, route } from "@/lib/server/http";

export const POST = route(async (request) => {
  const body = await readJson(request);
  const access_token = String(body.access_token || "");
  const password = String(body.password || "");
  if (password.length < 8) return fail(400, "Password must be at least 8 characters");
  if (!access_token) return fail(401, "This reset link is invalid or has expired. Request a new one.");

  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(access_token);
  if (error || !data.user) return fail(401, "This reset link is invalid or has expired. Request a new one.");

  const { error: updateError } = await supabase.auth.admin.updateUserById(data.user.id, { password });
  if (updateError) {
    if (updateError.code === "same_password") return fail(400, "Choose a password you haven't used before.");
    if (updateError.code === "weak_password") return fail(400, updateError.message);
    throw updateError;
  }
  return ok({ message: "Password updated. You can now sign in." });
});
