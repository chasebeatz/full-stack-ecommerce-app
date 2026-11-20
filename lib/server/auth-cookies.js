// Shared by proxy.js and the server code, so it must not import "server-only" or next/headers.
export const ACCESS_COOKIE = "shoppee-access";
export const REFRESH_COOKIE = "shoppee-refresh";

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days; the access token inside expires sooner and is refreshed by proxy.js
};

export function writeSession(store, session) {
  store.set(ACCESS_COOKIE, session.access_token, cookieOptions);
  store.set(REFRESH_COOKIE, session.refresh_token, cookieOptions);
}

export function clearSession(store) {
  store.set(ACCESS_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  store.set(REFRESH_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

// Reads the expiry from a JWT without verifying it. Only used to decide when to refresh;
// every real permission check goes through supabase.auth.getUser().
export function expiresSoon(token, withinMs = 60_000) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp * 1000 - Date.now() < withinMs;
  } catch {
    return true;
  }
}
