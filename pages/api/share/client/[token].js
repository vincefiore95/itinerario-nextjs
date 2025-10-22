import { getSupabaseAdmin } from '../../_supabase'
export default async function handler(req, res) {
  const supa = getSupabaseAdmin();
  if (!supa) return res.status(500).json({ error: 'Missing env vars' });

  const { token } = req.query;

  const { data: client, error: e1 } = await supa
    .from('clients')
    .select('id, name, email')
    .eq('share_token', token)
    .single();
  if (e1 || !client) return res.status(404).json({ error: 'Client not found' });

  const { data: itineraries, error: e2 } = await supa
    .from('itineraries')
    .select(`
      id, title, date_id, start_date, end_date, share_token, created_at,
      destinations:destinations(id, name, address, order_index)
    `)
    .eq('client_id', client.id)
    .order('created_at', { ascending: false });

  if (e2) return res.status(500).json({ error: e2.message });

  res.status(200).json({ client, itineraries });
}
