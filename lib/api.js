// Browser helper for calling this app's /api routes. The session travels in an httpOnly cookie.
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function api(path, { method = "GET", body } = {}) {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: {
        Accept: "application/json",
        ...(body && !isForm ? { "Content-Type": "application/json" } : {}),
      },
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new ApiError(data.message || `Something went wrong (${res.status})`, res.status, data.code);
  }
  return data;
}

// Only same-site paths like "/checkout" — never "//evil.com" or "https://...".
export const safeRedirect = (path) => (typeof path === "string" && /^\/(?!\/)/.test(path) ? path : "/");
