// Mirrors backend/lib/pricing.js. The server recalculates everything when an order is placed.
export const FREE_SHIPPING_AT = 75;
export const SHIPPING_FEE = 7.95;
export const COUPONS = { WELCOME10: 0.1 };
export const SIZES = ["XS", "S", "M", "L", "XL"];

const round = (n) => Math.round(n * 100) / 100;

export function priceCart(subtotal, coupon) {
  const discount = coupon && COUPONS[coupon] ? round(subtotal * COUPONS[coupon]) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= FREE_SHIPPING_AT || subtotal === 0 ? 0 : SHIPPING_FEE;
  return {
    subtotal,
    discount,
    shipping,
    total: round(afterDiscount + shipping),
    toFreeShipping: Math.max(0, FREE_SHIPPING_AT - afterDiscount),
  };
}
