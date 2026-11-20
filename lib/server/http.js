import "server-only";
import { getCurrentUser } from "./session";

export const ok = (data = {}, status = 200) => Response.json({ success: true, ...data }, { status });
export const fail = (status, message, extra = {}) => Response.json({ success: false, message, ...extra }, { status });

export async function readJson(request) {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? body : {};
  } catch {
    return {};
  }
}

// Wraps a route handler so unexpected errors become a JSON 500 instead of an HTML page.
export const route = (handler) => async (request, context) => {
  try {
    return await handler(request, context);
  } catch (err) {
    console.error(err);
    return fail(500, "Something went wrong on our side. Please try again.");
  }
};

// Returns [user, null] or [null, errorResponse].
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) return [null, fail(401, "Please sign in to continue.")];
  return [user, null];
}

export async function requireAdmin() {
  const [user, error] = await requireUser();
  if (error) return [null, error];
  if (user.role !== "admin") return [null, fail(403, "Admin access required")];
  return [user, null];
}

// Where email links should send people back to.
export function siteUrl(request) {
  const fromEnv =
    process.env.SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  return (fromEnv || new URL(request.url).origin).replace(/\/$/, "");
}
