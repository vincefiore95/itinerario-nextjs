import { createClient } from '@supabase/supabase-js'

let admin = null;
export function getSupabaseAdmin() {
  if (admin) return admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  admin = createClient(url, key, { auth: { persistSession: false } });
  return admin;
}

export function uuid() {
  // usa crypto.randomUUID se disponibile (Node 18+)
  return (globalThis.crypto?.randomUUID?.()) || require('crypto').randomUUID();
}
