const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatPrice = (value) => formatter.format(Number(value) || 0);

export const discountPercent = (oldPrice, newPrice) =>
  oldPrice > newPrice ? Math.round(((oldPrice - newPrice) / oldPrice) * 100) : 0;
