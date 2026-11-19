export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function api(path, { method = "GET", body, token } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
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
