// pages/api/admin/itineraries/[id].js
import { getSupabaseAdmin } from '../../_supabase';

const isUuid = (v) =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

export default async function handler(req, res) {
  const supa = getSupabaseAdmin();
  if (!supa) return res.status(500).json({ error: 'Missing env vars' });

  let { id } = req.query;
  if (Array.isArray(id)) id = id[0];
  if (!id) return res.status(400).json({ error: 'Missing id' });

  // helper: carica itinerario per id o token
  const loadItineraryByAnyId = async (anyId) => {
    let it = null;
    if (isUuid(anyId)) {
      const r1 = await supa
        .from('itineraries')
        .select('id, title, start_date, end_date, share_token, created_at, client_id')
        .eq('id', anyId)
        .maybeSingle();
      if (r1.error) return { error: r1.error };
      it = r1.data;
    }
    if (!it) {
      const r2 = await supa
        .from('itineraries')
        .select('id, title, start_date, end_date, share_token, created_at, client_id')
        .eq('share_token', anyId)
        .maybeSingle();
      if (r2.error) return { error: r2.error };
      it = r2.data || null;
    }
    return { data: it };
  };

  if (req.method === 'GET') {
    // --- GET robusto: prova id, poi share_token ---
    const rIt = await loadItineraryByAnyId(id);
    if (rIt.error) return res.status(500).json({ error: rIt.error.message });
    const it = rIt.data;
    if (!it) return res.status(404).json({ error: 'Itinerary not found', received: id });

    // client
    let client = null;
    if (it.client_id) {
      const c = await supa
        .from('clients')
        .select('id, name, email')
        .eq('id', it.client_id)
        .maybeSingle();
      if (c.error) return res.status(500).json({ error: c.error.message });
      client = c.data || null;
    }

    // destinazioni (compat: id VERO + eventuali righe vecchie salvate col token)
    const rD = await supa
      .from('destinations')
      .select(
        'id, name, address, visit_date, arrival_time, departure_time, order_index, created_at, itinerary_id'
      )
      .or(`itinerary_id.eq.${it.id},itinerary_id.eq.${it.share_token}`)
      .order('order_index', { ascending: true });

    if (rD.error) return res.status(500).json({ error: rD.error.message });

    const dests = (rD.data || []).map(d => ({ ...d, itinerary_id: it.id }));

    return res.status(200).json({ itinerary: { ...it, client, destinations: dests } });
  }

  if (req.method === 'PUT') {
    // --- PUT robusto: risolve id anche se arriva un share_token ---
    const rIt = await loadItineraryByAnyId(id);
    if (rIt.error) return res.status(500).json({ error: rIt.error.message });
    const existing = rIt.data;
    if (!existing) return res.status(404).json({ error: 'Itinerary not found' });

    const realId = existing.id;

    const { title, start_date, end_date } = req.body || {};
    if (!title?.trim() || !start_date || !end_date) {
      return res.status(400).json({ error: 'title, start_date and end_date are required' });
    }
    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ error: 'start_date cannot be after end_date' });
    }

    const { data, error } = await supa
      .from('itineraries')
      .update({
        title: title.trim(),
        start_date,
        end_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', realId)
      .select('id, title, start_date, end_date, share_token, created_at, client_id')
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Itinerary not found' });

    // attach client
    let client = null;
    if (data.client_id) {
      const c = await supa.from('clients').select('id, name, email').eq('id', data.client_id).maybeSingle();
      if (c.error) return res.status(500).json({ error: c.error.message });
      client = c.data || null;
    }

    return res.status(200).json({ itinerary: { ...data, client } });
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  return res.status(405).json({ error: 'Method Not Allowed' });
}
