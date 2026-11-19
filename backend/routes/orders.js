import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { requireAdmin, requireUser } from "../lib/auth.js";
import { priceOrder, SIZES } from "../lib/pricing.js";

const router = Router();
const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const ADDRESS_FIELDS = ["name", "phone", "address", "city", "state", "postal_code", "country"];

const fail = (res, status, message) => res.status(status).json({ success: false, message });

// Place an order. Prices are always looked up server-side, never trusted from the client.
router.post("/orders", requireUser, async (req, res, next) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!items.length) return fail(res, 400, "Your bag is empty");
    if (items.length > 50) return fail(res, 400, "Too many items in one order");

    const shipping_address = {};
    for (const field of ADDRESS_FIELDS) {
      const value = String(req.body.shipping_address?.[field] || "").trim();
      if (!value && field !== "state") return fail(res, 400, `Please fill in your ${field.replace("_", " ")}`);
      shipping_address[field] = value.slice(0, 200);
    }

    const ids = [...new Set(items.map((i) => Number(i.id)))];
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
      if (!product || !product.available) return fail(res, 400, "Some items in your bag are no longer available");
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return fail(res, 400, "Invalid quantity");
      lines.push({ id: product.id, name: product.name, image: product.image, size, quantity, price: Number(product.new_price) });
    }

    const couponCode = String(req.body.coupon || "").trim().toUpperCase();
    const totals = priceOrder(lines, couponCode);
    if (couponCode && !totals.coupon) return fail(res, 400, "That promo code isn't valid");

    const { data: order, error: insertError } = await supabase
      .from("orders")
      .insert({ user_id: req.user.id, items: lines, shipping_address, payment_method: "cod", ...totals })
      .select()
      .single();
    if (insertError) throw insertError;

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

router.get("/orders", requireUser, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ success: true, orders: data });
  } catch (err) {
    next(err);
  }
});

// ---- admin ----

router.get("/admin/orders", requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error;

    // attach customer emails
    const userIds = [...new Set(data.map((o) => o.user_id))];
    const emails = {};
    await Promise.all(
      userIds.map(async (id) => {
        const { data: u } = await supabase.auth.admin.getUserById(id);
        emails[id] = u?.user?.email || null;
      })
    );
    res.json({ success: true, orders: data.map((o) => ({ ...o, email: emails[o.user_id] })) });
  } catch (err) {
    next(err);
  }
});

router.post("/admin/orders/:id/status", requireAdmin, async (req, res, next) => {
  try {
    const status = String(req.body.status || "");
    if (!STATUSES.includes(status)) return fail(res, 400, "Invalid status");
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", Number(req.params.id))
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return fail(res, 404, "Order not found");
    res.json({ success: true, order: data });
  } catch (err) {
    next(err);
  }
});

export default router;
