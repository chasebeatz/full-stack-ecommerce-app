import { revalidatePath } from "next/cache";
import { BUCKET, getSupabase } from "@/lib/server/supabase";
import { fail, ok, requireAdmin, route } from "@/lib/server/http";

export const DELETE = route(async (request, { params }) => {
  const [, authError] = await requireAdmin();
  if (authError) return authError;

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return fail(400, "Invalid id");

  const supabase = getSupabase();
  const { data, error } = await supabase.from("products").delete().eq("id", id).select().maybeSingle();
  if (error) throw error;
  if (!data) return fail(404, "Product not found");

  // Best effort: also delete the image if it lives in our bucket.
  const marker = `/object/public/${BUCKET}/`;
  const idx = data.image?.indexOf(marker) ?? -1;
  if (idx !== -1) await supabase.storage.from(BUCKET).remove([data.image.slice(idx + marker.length)]);

  revalidatePath("/", "layout");
  return ok({ product: data });
});
