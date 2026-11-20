import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { getSupabase } from "./supabase";
import { ACCESS_COOKIE, clearSession, writeSession } from "./auth-cookies";

export const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.user_metadata?.name || user.email.split("@")[0],
  role: user.app_metadata?.role === "admin" ? "admin" : "customer",
});

// The signed-in user for this request, or null. Cached so a page and its layout share one lookup.
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  const { data, error } = await getSupabase().auth.getUser(token);
  if (error || !data.user) return null;
  return publicUser(data.user);
});

export async function startSession(session) {
  writeSession(await cookies(), session);
  return publicUser(session.user);
}

export async function endSession() {
  clearSession(await cookies());
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value || null;
}
