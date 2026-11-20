// Sets the Site URL and allowed redirect URLs for Supabase Auth.
// Needs SUPABASE_ACCESS_TOKEN in .env.local (supabase.com/dashboard/account/tokens).
// Usage: npm run configure-auth                       (uses SITE_URL, default http://localhost:3000)
//        npm run configure-auth -- https://my-shop.vercel.app   (adds a production URL too)
const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_URL?.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
if (!token) {
  console.error("Add SUPABASE_ACCESS_TOKEN to .env.local first (supabase.com/dashboard/account/tokens).");
  process.exit(1);
}
if (!ref) {
  console.error("SUPABASE_URL should look like https://<project-ref>.supabase.co");
  process.exit(1);
}

const local = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const production = process.argv[2]?.replace(/\/$/, "");
const endpoint = `https://api.supabase.com/v1/projects/${ref}/config/auth`;
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

const current = await fetch(endpoint, { headers });
if (!current.ok) {
  console.error(`Couldn't read auth settings (${current.status}): ${await current.text()}`);
  process.exit(1);
}
const config = await current.json();

const urls = new Set((config.uri_allow_list || "").split(",").map((u) => u.trim()).filter(Boolean));
urls.add(`${local}/**`);
if (production) urls.add(`${production}/**`);

const body = {
  // Supabase's default Site URL is http://localhost:3000, which is fine locally, but production should point at the live site.
  site_url: production || (config.site_url && config.site_url !== "http://localhost:3000" ? config.site_url : local),
  uri_allow_list: [...urls].join(","),
};

const res = await fetch(endpoint, { method: "PATCH", headers, body: JSON.stringify(body) });
if (!res.ok) {
  console.error(`Couldn't update auth settings (${res.status}): ${await res.text()}`);
  process.exit(1);
}
const updated = await res.json();
console.log("✓ Site URL:", updated.site_url);
console.log("✓ Redirect URLs:", updated.uri_allow_list);
console.log("✓ Email confirmation required:", !updated.mailer_autoconfirm);
