const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const formatPrice = (value) => currency.format(Number(value) || 0);

export const discountPercent = (oldPrice, newPrice) =>
  oldPrice > newPrice ? Math.round(((oldPrice - newPrice) / oldPrice) * 100) : 0;

export const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-800",
  processing: "bg-blue-50 text-blue-800",
  shipped: "bg-indigo-50 text-indigo-800",
  delivered: "bg-green-50 text-green-800",
  cancelled: "bg-red-50 text-red-700",
};
