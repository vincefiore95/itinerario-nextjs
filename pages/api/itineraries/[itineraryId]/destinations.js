// pages/api/itineraries/[itineraryId]/destinations.js
import { getSupabaseAdmin } from '../../_supabase';

const isUuid = (v) =>
  typeof v === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

async function resolveItineraryId(supa, raw) {
  if (!raw) throw new Error('Missing itineraryId');
  if (isUuid(raw)) return raw;
  const { data, error } = await supa
    .from('itineraries')
    .select('id')
    .eq('share_token', raw)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Itinerary not found');
  return data.id;
}

export default async function handler(req, res) {
  const supa = getSupabaseAdmin();
  if (!supa) return res.status(500).json({ error: 'Missing env vars' });

  let { itineraryId } = req.query;
  itineraryId = Array.isArray(itineraryId) ? itineraryId[0] : itineraryId;

  let realId;
  try {
    realId = await resolveItineraryId(supa, itineraryId);
  } catch (e) {
    return res.status(400).json({ error: e.message || 'Missing itineraryId' });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const items = Array.isArray(body)
      ? body
      : (body.destination ? [body.destination] : [body]);

    for (const d of items) {
      if (!d?.name?.trim()) return res.status(400).json({ error: 'name is required' });
      if (!d?.visit_date)   return res.status(400).json({ error: 'visit_date is required' });
    }

    const { count, error: eCnt } = await supa
      .from('destinations')
      .select('id', { count: 'exact', head: true })
      .eq('itinerary_id', realId);
    if (eCnt) return res.status(500).json({ error: eCnt.message });

    const base = count ?? 0;
    const payload = items.map((d, i) => ({
      itinerary_id: realId,
      name: d.name.trim(),
      address: d.address?.trim() || null,
      visit_date: d.visit_date,
      arrival_time: d.arrival_time || null,
      departure_time: d.departure_time || null,
      order_index: Number.isFinite(d.order_index) ? d.order_index : base + i,
    }));

    const { data, error } = await supa.from('destinations').insert(payload).select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ destinations: data });
  }

  if (req.method === 'DELETE') {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array required' });
    }
    const { error } = await supa
      .from('destinations')
      .delete()
      .in('id', ids)
      .eq('itinerary_id', realId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true, deleted: ids.length });
  }

  res.setHeader('Allow', ['POST', 'DELETE']);
  return res.status(405).json({ error: 'Method Not Allowed' });
}
