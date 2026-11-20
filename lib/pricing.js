// Shared by the cart (browser) and the orders API (server). The server recalculates every order.
export const FREE_SHIPPING_AT = 75;
export const SHIPPING_FEE = 7.95;
export const COUPONS = { WELCOME10: 0.1 };
export const SIZES = ["XS", "S", "M", "L", "XL"];
export const MAX_QUANTITY = 20;

const round = (n) => Math.round(n * 100) / 100;

export function priceTotals(subtotal, couponCode) {
  subtotal = round(subtotal);
  const coupon = couponCode && COUPONS[couponCode] ? couponCode : null;
  const discount = coupon ? round(subtotal * COUPONS[coupon]) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= FREE_SHIPPING_AT || subtotal === 0 ? 0 : SHIPPING_FEE;
  return {
    subtotal,
    discount,
    shipping,
    total: round(afterDiscount + shipping),
    coupon,
    toFreeShipping: Math.max(0, round(FREE_SHIPPING_AT - afterDiscount)),
  };
}
