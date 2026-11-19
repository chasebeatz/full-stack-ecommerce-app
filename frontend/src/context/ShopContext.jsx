import { createContext, useEffect, useMemo, useState } from "react";
import all_products from "./../assets/all_products";

export const ShopContext = createContext(null);

const STORAGE_KEY = "shoppee-cart";

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function ShopContextProvider({ children }) {
  // cartItems: { [productId]: quantity }
  const [cartItems, setCart] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      /* storage unavailable — cart stays in memory */
    }
  }, [cartItems]);

  const setQuantity = (itemId, qty) => {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[itemId];
      else next[itemId] = qty;
      return next;
    });
  };

  const addToCart = (itemId, qty = 1) =>
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + qty }));

  const removeFromCart = (itemId) =>
    setQuantity(itemId, (cartItems[itemId] || 0) - 1);

  const deleteFromCart = (itemId) => setQuantity(itemId, 0);

  const clearCart = () => setCart({});

  const cartList = useMemo(
    () =>
      Object.entries(cartItems)
        .map(([id, quantity]) => ({
          product: all_products.find((p) => p.id === Number(id)),
          quantity,
        }))
        .filter((line) => line.product && line.quantity > 0),
    [cartItems]
  );

  const getTotalCartAmount = () =>
    cartList.reduce((sum, { product, quantity }) => sum + product.new_price * quantity, 0);

  const getTotalCartItems = () =>
    cartList.reduce((sum, { quantity }) => sum + quantity, 0);

  const value = {
    all_products,
    cartItems,
    cartList,
    addToCart,
    removeFromCart,
    deleteFromCart,
    setQuantity,
    clearCart,
    getTotalCartAmount,
    getTotalCartItems,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export default ShopContextProvider;
