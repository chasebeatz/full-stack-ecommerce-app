import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env and fill them in."
  );
}

const options = { auth: { persistSession: false, autoRefreshToken: false } };

// Server-side only: the service role key bypasses Row Level Security.
// Never expose it to the frontend or admin bundles.
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, options);

// Sign-in / refresh calls store a user session on the client they run on, which would
// make later queries run as that user. Use a throwaway client for those calls.
export const createAuthClient = () => createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, options);

export const BUCKET = process.env.SUPABASE_BUCKET || "product-images";
