import { getSupabase } from "@/lib/server/supabase";
import { fail, ok, readJson, requireAdmin, route } from "@/lib/server/http";
import { ORDER_STATUSES } from "@/lib/format";

export const PATCH = route(async (request, { params }) => {
  const [, authError] = await requireAdmin();
  if (authError) return authError;

  const status = String((await readJson(request)).status || "");
  if (!ORDER_STATUSES.includes(status)) return fail(400, "Invalid status");

  const { data, error } = await getSupabase()
    .from("orders")
    .update({ status })
    .eq("id", Number((await params).id))
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) return fail(404, "Order not found");
  return ok({ order: data });
});
