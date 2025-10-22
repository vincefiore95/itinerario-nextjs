// pages/api/share/itinerary/[token].js
import { getSupabaseAdmin } from '../../_supabase';

const isUuid = (v) =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supa = getSupabaseAdmin();
  if (!supa) return res.status(500).json({ error: 'Missing env vars' });

  let { token } = req.query;
  if (Array.isArray(token)) token = token[0];
  if (!token) return res.status(400).json({ error: 'Missing token' });

  // 1) prova per share_token
  let it = null;
  const r1 = await supa
    .from('itineraries')
    .select('id, title, start_date, end_date, share_token, created_at, client_id')
    .eq('share_token', token)
    .maybeSingle();

  if (r1.error) return res.status(500).json({ error: r1.error.message });
  it = r1.data;

  // 2) fallback: se non trovato e il token è un UUID, prova come id
  if (!it && isUuid(token)) {
    const r2 = await supa
      .from('itineraries')
      .select('id, title, start_date, end_date, share_token, created_at, client_id')
      .eq('id', token)
      .maybeSingle();
    if (r2.error) return res.status(500).json({ error: r2.error.message });
    it = r2.data || null;
  }

  if (!it) {
    return res.status(404).json({ error: 'Itinerary not found', received: token });
  }

  // Cliente
  let client = null;
  if (it.client_id) {
    const rc = await supa
      .from('clients')
      .select('id, name, email')
      .eq('id', it.client_id)
      .maybeSingle();
    if (rc.error) return res.status(500).json({ error: rc.error.message });
    client = rc.data || null;
  }

  // Destinazioni col nuovo schema (data/ore)
  const rd = await supa
    .from('destinations')
    .select('id, name, address, visit_date, arrival_time, departure_time, order_index, created_at')
    .eq('itinerary_id', it.id)
    .order('order_index', { ascending: true });

  if (rd.error) return res.status(500).json({ error: rd.error.message });

  return res.status(200).json({
    itinerary: { ...it, client, destinations: rd.data || [] },
  });
}
