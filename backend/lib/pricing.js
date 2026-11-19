// Keep in sync with frontend/src/utils/pricing.js (the server is the source of truth).
export const FREE_SHIPPING_AT = 75;
export const SHIPPING_FEE = 7.95;
export const COUPONS = { WELCOME10: 0.1 };
export const SIZES = ["XS", "S", "M", "L", "XL"];

const round = (n) => Math.round(n * 100) / 100;

export function priceOrder(lines, couponCode) {
  const subtotal = round(lines.reduce((sum, l) => sum + l.price * l.quantity, 0));
  const coupon = couponCode && COUPONS[couponCode] ? couponCode : null;
  const discount = coupon ? round(subtotal * COUPONS[coupon]) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= FREE_SHIPPING_AT || subtotal === 0 ? 0 : SHIPPING_FEE;
  return { subtotal, discount, shipping, total: round(afterDiscount + shipping), coupon };
}
