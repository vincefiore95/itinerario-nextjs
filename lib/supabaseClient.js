import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,         // conserva la sessione nel browser
      autoRefreshToken: true,       // refresh automatico lato client
      detectSessionInUrl: true,
    },
  }
);