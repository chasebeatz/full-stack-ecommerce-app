import "server-only";
import { getSupabase } from "./supabase";

export async function getOrdersForUser(userId) {
  const { data, error } = await getSupabase()
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Couldn't load orders: ${error.message}`);
  return data;
}

// All orders with each customer's email attached (admin only).
export async function getAllOrders() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(`Couldn't load orders: ${error.message}`);

  const emails = {};
  await Promise.all(
    [...new Set(data.map((o) => o.user_id))].map(async (id) => {
      const { data: u } = await supabase.auth.admin.getUserById(id);
      emails[id] = u?.user?.email || null;
    })
  );
  return data.map((o) => ({ ...o, email: emails[o.user_id] }));
}
