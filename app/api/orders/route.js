import { getSupabase } from "@/lib/server/supabase";
import { getOrdersForUser } from "@/lib/server/orders";
import { fail, ok, readJson, requireUser, route } from "@/lib/server/http";
import { MAX_QUANTITY, SIZES, priceTotals } from "@/lib/pricing";

const ADDRESS_FIELDS = ["name", "phone", "address", "city", "state", "postal_code", "country"];

export const GET = route(async () => {
  const [user, error] = await requireUser();
  if (error) return error;
  return ok({ orders: await getOrdersForUser(user.id) });
});

// Place an order. Prices are always looked up here, never trusted from the browser.
export const POST = route(async (request) => {
  const [user, authError] = await requireUser();
  if (authError) return authError;

  const body = await readJson(request);
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) return fail(400, "Your bag is empty");
  if (items.length > 50) return fail(400, "Too many items in one order");

  const shipping_address = {};
  for (const field of ADDRESS_FIELDS) {
    const value = String(body.shipping_address?.[field] || "").trim();
    if (!value && field !== "state") return fail(400, `Please fill in your ${field.replace("_", " ")}`);
    shipping_address[field] = value.slice(0, 200);
  }

  const supabase = getSupabase();
  const ids = [...new Set(items.map((i) => Number(i.id)).filter(Number.isInteger))];
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, image, new_price, available")
    .in("id", ids);
  if (error) throw error;

  const lines = [];
  for (const item of items) {
    const product = products.find((p) => p.id === Number(item.id));
    const quantity = Number(item.quantity);
    const size = SIZES.includes(item.size) ? item.size : "M";
    if (!product || product.available === false) return fail(400, "Some items in your bag are no longer available");
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return fail(400, "Invalid quantity");
    lines.push({ id: product.id, name: product.name, image: product.image, size, quantity, price: Number(product.new_price) });
  }

  const couponCode = String(body.coupon || "").trim().toUpperCase();
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const { toFreeShipping, ...totals } = priceTotals(subtotal, couponCode);
  if (couponCode && !totals.coupon) return fail(400, "That promo code isn't valid");

  const { data: order, error: insertError } = await supabase
    .from("orders")
    .insert({ user_id: user.id, items: lines, shipping_address, payment_method: "cod", ...totals })
    .select()
    .single();
  if (insertError) throw insertError;

  return ok({ order }, 201);
});
