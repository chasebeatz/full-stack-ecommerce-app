// Runs supabase/schema.sql and supabase/orders.sql against your database.
// Needs DATABASE_URL in .env (Supabase: Connect -> Session pooler connection string).
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

if (!process.env.DATABASE_URL) {
  console.error("Add DATABASE_URL to backend/.env first (Supabase dashboard -> Connect -> Session pooler).");
  process.exit(1);
}

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../supabase");
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  for (const file of ["schema.sql", "orders.sql"]) {
    await client.query(await readFile(path.join(dir, file), "utf8"));
    console.log(`✓ ran ${file}`);
  }
  // make the API pick up new tables immediately
  await client.query("notify pgrst, 'reload schema'");
  const { rows } = await client.query(
    "select table_name from information_schema.tables where table_schema = 'public' order by 1"
  );
  console.log("Tables:", rows.map((r) => r.table_name).join(", "));
} catch (err) {
  console.error("Database setup failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
