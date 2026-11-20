"use client";

import { createContext, useContext, useMemo } from "react";
import { parseKey, useCartReady, useCartState } from "@/lib/cartStore";
import { priceTotals } from "@/lib/pricing";

const ShopContext = createContext({ products: [] });

// Products come from the server (see app/(shop)/layout.js); the cart from localStorage.
export function ShopProvider({ products, children }) {
  return <ShopContext.Provider value={{ products }}>{children}</ShopContext.Provider>;
}

export const useProducts = () => useContext(ShopContext).products;

export function useCart() {
  const products = useProducts();
  const { items, coupon } = useCartState();
  const ready = useCartReady();

  return useMemo(() => {
    const lines = Object.entries(items)
      .map(([key, quantity]) => {
        const { id, size } = parseKey(key);
        return { key, size, quantity, product: products.find((p) => p.id === id) };
      })
      .filter((line) => line.product); // drop items that are no longer sold
    const subtotal = lines.reduce((sum, l) => sum + l.product.new_price * l.quantity, 0);
    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    return { ready, lines, count, coupon, totals: priceTotals(subtotal, coupon) };
  }, [items, coupon, products, ready]);
}
