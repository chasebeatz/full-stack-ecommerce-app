import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const options = { auth: { persistSession: false, autoRefreshToken: false } };

function assertEnv() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env.local (or set them in Vercel)."
    );
  }
}

let serviceClient;

// Server-side only: the service role key bypasses Row Level Security.
// It has no NEXT_PUBLIC_ prefix, so it never reaches the browser.
export function getSupabase() {
  assertEnv();
  serviceClient ??= createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, options);
  return serviceClient;
}

// Sign-in / refresh calls store a session on the client they run on, which would make
// later queries run as that user. Use a throwaway client for those calls.
export function createAuthClient() {
  assertEnv();
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, options);
}

export const BUCKET = process.env.SUPABASE_BUCKET || "product-images";
