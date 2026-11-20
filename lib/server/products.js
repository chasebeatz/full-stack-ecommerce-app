import "server-only";
import { cache } from "react";
import { getSupabase } from "./supabase";

const normalize = (p) => ({ ...p, new_price: Number(p.new_price), old_price: Number(p.old_price) });

// Every product, including hidden ones (for the admin).
export const getAllProducts = cache(async () => {
  const { data, error } = await getSupabase().from("products").select("*").order("id", { ascending: true });
  if (error) throw new Error(`Couldn't load products: ${error.message}`);
  return data.map(normalize);
});

// What the storefront shows.
export const getProducts = cache(async () => (await getAllProducts()).filter((p) => p.available !== false));

export async function getProduct(id) {
  const products = await getProducts();
  return products.find((p) => p.id === Number(id)) || null;
}
