# Shoppee

A fashion store built with **Next.js 16** (App Router) and **Supabase** (Postgres, Auth and Storage).
The storefront, the admin dashboard and the API are one app, deployed as one Vercel project.

| Path | What it is |
| --- | --- |
| `/`, `/mens`, `/womens`, `/kids`, `/product/[id]` | Storefront (pre-rendered, refreshed every 5 minutes or as soon as the admin changes a product) |
| `/cart`, `/checkout`, `/orders` | Bag, cash-on-delivery checkout, order history |
| `/login`, `/auth/confirm`, `/reset-password` | Sign in / sign up with email confirmation, password reset |
| `/admin` | Admin dashboard: products, add product, orders |
| `/api/*` | Route handlers used by the pages above |

Sign-in sessions are kept in secure httpOnly cookies, and `proxy.js` refreshes them automatically.
The Supabase service-role key is only ever used on the server.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm run dev                  # http://localhost:3000
```

First-time database setup (skip if your Supabase project already has the tables and products):

```bash
npm run setup-db                     # creates tables + storage bucket (needs DATABASE_URL)
npm run seed                         # uploads the 36 demo products
npm run make-admin -- you@example.com "a-strong-password"
```

## Supabase settings

In **Authentication → URL Configuration**:

- **Site URL:** your live address, e.g. `https://your-shop.vercel.app`
- **Redirect URLs:** `https://your-shop.vercel.app/**` and `http://localhost:3000/**`

Confirmation and password-reset emails only link back to addresses on that list.

## Deploy to Vercel

1. Import the repository in Vercel (or run `vercel` in this folder). The framework is detected as Next.js; leave the root directory as `./`.
2. Add two environment variables: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
3. Deploy. `SITE_URL` is optional on Vercel, because the production domain is detected automatically.
