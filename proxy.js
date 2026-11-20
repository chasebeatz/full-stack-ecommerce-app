import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearSession, expiresSoon, writeSession } from "@/lib/server/auth-cookies";
import { createAuthClient } from "@/lib/server/supabase";

// Keeps the sign-in session fresh: when the access token is missing or about to expire,
// swap the refresh token for a new pair before the page or API route runs.
export async function proxy(request) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refresh || (access && !expiresSoon(access))) return NextResponse.next();

  let session = null;
  let invalid = false;
  try {
    const { data, error } = await createAuthClient().auth.refreshSession({ refresh_token: refresh });
    if (data?.session) session = data.session;
    else invalid = error?.status >= 400 && error?.status < 500; // revoked or expired, not a network blip
  } catch {
    return NextResponse.next();
  }

  if (session) {
    // Update the request too, so the page rendered for this request sees the new token.
    request.cookies.set(ACCESS_COOKIE, session.access_token);
    request.cookies.set(REFRESH_COOKIE, session.refresh_token);
    const response = NextResponse.next({ request });
    writeSession(response.cookies, session);
    return response;
  }

  if (invalid) {
    request.cookies.delete(ACCESS_COOKIE);
    request.cookies.delete(REFRESH_COOKIE);
    const response = NextResponse.next({ request });
    clearSession(response.cookies);
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|favicon.ico|.*\.(?:png|jpg|jpeg|svg|webp|avif)$).*)"],
};
