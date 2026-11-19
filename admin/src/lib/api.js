export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const AUTH_KEY = "shoppee-admin-auth";

export const loadSession = () => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY)) || null;
  } catch {
    return null;
  }
};

export const saveSession = (s) => {
  try {
    if (s) localStorage.setItem(AUTH_KEY, JSON.stringify(s));
    else localStorage.removeItem(AUTH_KEY);
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event("admin-auth-change"));
};

async function raw(path, { token, json, ...options } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(json ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      body: json ? JSON.stringify(json) : options.body,
    });
  } catch {
    throw Object.assign(new Error("Can't reach the server. Is the backend running?"), { status: 0 });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false || data.success === 0) {
    throw Object.assign(new Error(data.message || `Request failed (${res.status})`), { status: res.status });
  }
  return data;
}

async function validToken() {
  const s = loadSession();
  if (!s) return null;
  if (s.expires_at * 1000 - Date.now() > 60_000) return s.access_token;
  try {
    const fresh = await raw("/auth/refresh", { method: "POST", json: { refresh_token: s.refresh_token } });
    saveSession(fresh);
    return fresh.access_token;
  } catch {
    saveSession(null);
    return null;
  }
}

// Authenticated request; signs the admin out if the session is no longer valid.
async function request(path, options = {}) {
  const token = await validToken();
  try {
    return await raw(path, { ...options, token });
  } catch (err) {
    if (err.status === 401) saveSession(null);
    throw err;
  }
}

export async function login(email, password) {
  const session = await raw("/auth/login", { method: "POST", json: { email, password } });
  if (session.user.role !== "admin") {
    throw new Error("This account doesn't have admin access.");
  }
  saveSession(session);
  return session;
}

export const logout = () => saveSession(null);

export const getProducts = () => raw("/allproducts");

export const uploadImage = (file) => {
  const body = new FormData();
  body.append("product", file);
  return request("/upload", { method: "POST", body });
};

export const addProduct = (product) => request("/addproducts", { method: "POST", json: product });
export const removeProduct = (id) => request("/removeproducts", { method: "POST", json: { id } });
export const getOrders = () => request("/admin/orders");
export const setOrderStatus = (id, status) => request(`/admin/orders/${id}/status`, { method: "POST", json: { status } });

export const formatPrice = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(v) || 0);
