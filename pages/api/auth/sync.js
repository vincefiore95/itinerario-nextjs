import { createPagesServerClient } from '@supabase/ssr';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { access_token, refresh_token } = req.body || {};
  if (!access_token || !refresh_token) {
    return res.status(400).json({ error: 'Missing tokens' });
  }

  // crea un client "SSR" collegato a req/res per poter SETTARE i cookie httpOnly
  const supabase = createPagesServerClient({ req, res });

  // imposta la sessione lato server: questo scrive i cookie sb-... httpOnly
  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) return res.status(401).json({ error: error.message });

  return res.status(200).json({ ok: true });
}
