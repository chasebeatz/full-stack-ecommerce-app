// Seeds Supabase with the 36 demo products from the storefront.
// Usage: npm run seed            (skips if products already exist)
//        npm run seed -- --force (inserts anyway)
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { supabase, BUCKET } from "../lib/supabase.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(here, "../../frontend/src/assets");
const source = await readFile(path.join(assetsDir, "all_products.js"), "utf8");

// all_products.js imports .png files, so Node can't import it directly; parse it instead.
const imageFiles = Object.fromEntries(
  [...source.matchAll(/import\s+(\w+)\s+from\s+["']\.\/([^"']+)["']/g)].map((m) => [m[1], m[2]])
);
const products = [...source.matchAll(/\{([^{}]+)\}/g)]
  .map((m) => {
    const body = m[1];
    const get = (key) => body.match(new RegExp(`${key}:\\s*("([^"]*)"|[\\w.]+)`))?.slice(1);
    const field = (key) => {
      const v = get(key);
      return v ? v[1] ?? v[0] : undefined;
    };
    return {
      name: field("name"),
      category: field("category"),
      imageVar: get("image")?.[0],
      new_price: Number(field("new_price")),
      old_price: Number(field("old_price") ?? field("new_price")),
    };
  })
  .filter((p) => p.name && p.imageVar);

console.log(`Found ${products.length} products in all_products.js`);

const { count, error: countError } = await supabase.from("products").select("*", { count: "exact", head: true });
if (countError) {
  console.error("Could not read the products table. Did you run supabase/schema.sql?\n", countError.message);
  process.exit(1);
}
if (count > 0 && !process.argv.includes("--force")) {
  console.log(`The products table already has ${count} rows. Re-run with --force to insert anyway.`);
  process.exit(0);
}

const rows = [];
for (const p of products) {
  const file = imageFiles[p.imageVar];
  const buffer = await readFile(path.join(assetsDir, file));
  const objectPath = `seed/${file}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, buffer, { contentType: "image/png", upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
  rows.push({ name: p.name, category: p.category, new_price: p.new_price, old_price: p.old_price, image: data.publicUrl });
  process.stdout.write(".");
}

const { error } = await supabase.from("products").insert(rows);
if (error) throw error;
console.log(`\nInserted ${rows.length} products.`);
