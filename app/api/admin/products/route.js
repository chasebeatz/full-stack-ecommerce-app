import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/server/supabase";
import { fail, ok, readJson, requireAdmin, route } from "@/lib/server/http";
import { CATEGORIES } from "@/lib/catalog";

const VALUES = CATEGORIES.map((c) => c.value);

export const POST = route(async (request) => {
  const [, authError] = await requireAdmin();
  if (authError) return authError;

  const body = await readJson(request);
  const name = String(body.name || "").trim();
  const image = String(body.image || "");
  const new_price = Number(body.new_price);
  const old_price = Number(body.old_price);

  if (!name || name.length > 200) return fail(400, "Enter a product title (up to 200 characters)");
  if (!/^https:\/\//.test(image)) return fail(400, "Upload a product image");
  if (!VALUES.includes(body.category)) return fail(400, "Choose a category");
  if (!(new_price > 0) || !(old_price > 0)) return fail(400, "Prices must be greater than zero");

  const { data, error } = await getSupabase()
    .from("products")
    .insert({ name, image, category: body.category, new_price, old_price })
    .select()
    .single();
  if (error) throw error;

  revalidatePath("/", "layout"); // refresh the storefront's cached pages
  return ok({ product: data }, 201);
});
