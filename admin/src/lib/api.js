export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

export const getProducts = () => request("/allproducts");

export const uploadImage = (file) => {
  const body = new FormData();
  body.append("product", file);
  return request("/upload", { method: "POST", headers: { Accept: "application/json" }, body });
};

export const addProduct = (product) =>
  request("/addproducts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(product),
  });

export const removeProduct = (id) =>
  request("/removeproducts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ id }),
  });

export const formatPrice = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(v) || 0);
