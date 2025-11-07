import { createPagesServerClient } from '@supabase/ssr';

export default async function handler(req, res) {
  const supabase = createPagesServerClient({ req, res });
  await supabase.auth.signOut();          // invalida e rimuove i cookie
  return res.status(200).json({ ok: true });
}
