import { createContext, useEffect, useMemo, useState } from "react";
import fallbackProducts from "./../assets/all_products";
import { API_URL } from "../lib/api";
import { COUPONS } from "../utils/pricing";

export const ShopContext = createContext(null);

const CART_KEY = "shoppee-cart";
const COUPON_KEY = "shoppee-coupon";
const DEFAULT_SIZE = "M";

// Cart keys look like "12|M" (product id + size). Older carts used just the id.
const makeKey = (id, size) => `${id}|${size}`;
const parseKey = (key) => {
  const [id, size] = String(key).split("|");
  return { id: Number(id), size: size || DEFAULT_SIZE };
};

function load(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

function ShopContextProvider({ children }) {
  const [all_products, setProducts] = useState(fallbackProducts);
  const [productsStatus, setProductsStatus] = useState("loading"); // loading | live | offline
  const [cartItems, setCart] = useState(() => {
    const saved = load(CART_KEY, {});
    return typeof saved === "object" && saved ? saved : {};
  });
  const [coupon, setCouponState] = useState(() => load(COUPON_KEY, null));

  // Load the live catalogue; keep the bundled demo data if the API is unreachable.
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/allproducts`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return;
        setProducts(data.filter((p) => p.available !== false).map((p) => ({ ...p, new_price: Number(p.new_price), old_price: Number(p.old_price) })));
        setProductsStatus("live");
      })
      .catch(() => !cancelled && setProductsStatus("offline"));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => save(CART_KEY, cartItems), [cartItems]);
  useEffect(() => save(COUPON_KEY, coupon), [coupon]);

  const setQuantity = (key, qty) =>
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[key];
      else next[key] = Math.min(qty, 20);
      return next;
    });

  const addToCart = (id, qty = 1, size = DEFAULT_SIZE) => {
    const key = makeKey(id, size);
    setCart((prev) => {
      const { [id]: legacy = 0, ...rest } = prev; // fold any old id-only entry in
      return { ...rest, [key]: Math.min((prev[key] || 0) + legacy + qty, 20) };
    });
  };

  const deleteFromCart = (key) => setQuantity(key, 0);
  const clearCart = () => {
    setCart({});
    setCouponState(null);
  };

  const applyCoupon = (code) => {
    const normalized = String(code || "").trim().toUpperCase();
    if (!COUPONS[normalized]) return false;
    setCouponState(normalized);
    return true;
  };
  const removeCoupon = () => setCouponState(null);

  const cartList = useMemo(
    () =>
      Object.entries(cartItems)
        .map(([key, quantity]) => {
          const { id, size } = parseKey(key);
          return { key, size, quantity, product: all_products.find((p) => p.id === id) };
        })
        .filter((line) => line.product && line.quantity > 0),
    [cartItems, all_products]
  );

  const getTotalCartAmount = () =>
    cartList.reduce((sum, { product, quantity }) => sum + product.new_price * quantity, 0);
  const getTotalCartItems = () => cartList.reduce((sum, { quantity }) => sum + quantity, 0);

  const value = {
    all_products,
    productsStatus,
    cartItems,
    cartList,
    coupon,
    addToCart,
    deleteFromCart,
    setQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    getTotalCartAmount,
    getTotalCartItems,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export default ShopContextProvider;
