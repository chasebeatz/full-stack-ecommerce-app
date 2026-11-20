import { getSupabase } from "@/lib/server/supabase";
import { endSession, getAccessToken } from "@/lib/server/session";
import { ok, route } from "@/lib/server/http";

export const POST = route(async () => {
  const token = await getAccessToken();
  // Revoke the refresh token too, so a copied cookie can't be reused.
  if (token) await getSupabase().auth.admin.signOut(token).catch(() => {});
  await endSession();
  return ok();
});
