import { supabase } from "./supabase.js";

export const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.user_metadata?.name || user.email.split("@")[0],
  role: user.app_metadata?.role === "admin" ? "admin" : "customer",
});

export const sessionPayload = (session) => ({
  access_token: session.access_token,
  refresh_token: session.refresh_token,
  expires_at: session.expires_at,
  user: publicUser(session.user),
});

// Verifies the Bearer token with Supabase and puts the user on req.user.
export async function requireUser(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return res.status(401).json({ success: false, message: "Please sign in" });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ success: false, message: "Your session has expired. Please sign in again." });
  }
  req.user = publicUser(data.user);
  next();
}

export function requireAdmin(req, res, next) {
  requireUser(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    next();
  });
}
