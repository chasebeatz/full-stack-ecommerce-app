import { randomUUID } from "crypto";
import { BUCKET, getSupabase } from "@/lib/server/supabase";
import { fail, ok, requireAdmin, route } from "@/lib/server/http";

// Vercel caps request bodies at 4.5 MB, so stay under that.
const MAX_BYTES = 4 * 1024 * 1024;

export const POST = route(async (request) => {
  const [, authError] = await requireAdmin();
  if (authError) return authError;

  const form = await request.formData().catch(() => null);
  const file = form?.get("image");
  if (!file || typeof file === "string") return fail(400, "No image provided");
  if (!file.type.startsWith("image/")) return fail(400, "Only image files are allowed");
  if (file.size > MAX_BYTES) return fail(400, "Images must be 4 MB or smaller");

  const ext = (file.name.match(/\.[a-z0-9]+$/i)?.[0] || ".png").toLowerCase();
  const objectPath = `products/${Date.now()}_${randomUUID()}${ext}`;
  const supabase = getSupabase();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  return ok({ image_url: data.publicUrl });
});
