import { getSupabaseAdmin, uuid } from '../_supabase'

export default async function handler(req, res) {
  const supa = getSupabaseAdmin();
  if (!supa) return res.status(500).json({ error: 'Missing env vars' });

  if (req.method === 'POST') {
    const { name, email } = req.body || {};
    if (!name && !email) return res.status(400).json({ error: 'name or email required' });

    // se esiste (per email), riusa; altrimenti crea con share_token
    const { data: existing, error: e1 } = await supa
      .from('clients')
      .select('*')
      .eq('email', email || '')
      .maybeSingle();

    if (e1) return res.status(500).json({ error: e1.message });

    if (existing) {
      return res.status(200).json({
        client: existing,
        shareUrl: `/share/client/${existing.share_token}`
      });
    }

    const share_token = uuid();
    const { data, error } = await supa
      .from('clients')
      .insert({ name, email, share_token })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({
      client: data,
      shareUrl: `/share/client/${share_token}`
    });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end('Method Not Allowed');
}
