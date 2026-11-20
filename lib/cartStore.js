"use client";

import { useSyncExternalStore } from "react";
import { COUPONS, MAX_QUANTITY } from "./pricing";

// The cart lives in localStorage and is shared by every component through useSyncExternalStore.
// Keys look like "12|M" (product id + size).
const CART_KEY = "shoppee-cart";
const COUPON_KEY = "shoppee-coupon";
const EMPTY = { items: {}, coupon: null };
const listeners = new Set();
let state = null;

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) — the cart still works for this visit */
  }
}

function load() {
  const raw = readStorage(CART_KEY, {});
  const items = {};
  if (raw && typeof raw === "object") {
    for (const [key, qty] of Object.entries(raw)) {
      const fullKey = key.includes("|") ? key : `${key}|M`; // older carts stored only the id
      const n = Math.min(Math.floor(Number(qty)) || 0, MAX_QUANTITY);
      if (n > 0) items[fullKey] = Math.min((items[fullKey] || 0) + n, MAX_QUANTITY);
    }
  }
  const coupon = readStorage(COUPON_KEY, null);
  return { items, coupon: COUPONS[coupon] ? coupon : null };
}

const getSnapshot = () => (state ??= load());
const getServerSnapshot = () => EMPTY;

function subscribe(listener) {
  listeners.add(listener);
  const onStorage = (e) => {
    if (e.key === CART_KEY || e.key === COUPON_KEY) {
      state = load();
      listeners.forEach((l) => l());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function update(fn) {
  const prev = getSnapshot();
  const next = fn(prev);
  if (next === prev) return;
  state = next;
  writeStorage(CART_KEY, next.items);
  writeStorage(COUPON_KEY, next.coupon);
  listeners.forEach((l) => l());
}

export const useCartState = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
// false during server render and hydration, true once the saved cart has been read
export const useCartReady = () => useSyncExternalStore(subscribe, () => true, () => false);

export const cartKey = (id, size) => `${id}|${size}`;
export const parseKey = (key) => {
  const [id, size] = key.split("|");
  return { id: Number(id), size };
};

export function setQuantity(key, qty) {
  update((s) => {
    const items = { ...s.items };
    if (qty <= 0) delete items[key];
    else items[key] = Math.min(qty, MAX_QUANTITY);
    return { ...s, items };
  });
}

export function addToCart(id, qty = 1, size = "M") {
  const key = cartKey(id, size);
  update((s) => ({ ...s, items: { ...s.items, [key]: Math.min((s.items[key] || 0) + qty, MAX_QUANTITY) } }));
}

export const removeFromCart = (key) => setQuantity(key, 0);
export const clearCart = () => update(() => ({ items: {}, coupon: null }));

export function applyCoupon(code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!COUPONS[normalized]) return false;
  update((s) => ({ ...s, coupon: normalized }));
  return true;
}
export const removeCoupon = () => update((s) => ({ ...s, coupon: null }));
