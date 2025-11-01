// pages/api/itineraries/[itineraryId]/destinations/[destId].js
import { getSupabaseAdmin } from '../../../_supabase';

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

  let { itineraryId, destId } = req.query;
  itineraryId = Array.isArray(itineraryId) ? itineraryId[0] : itineraryId;
  destId = Array.isArray(destId) ? destId[0] : destId;

  let realItId;
  try {
    realItId = await resolveItineraryId(supa, itineraryId);
  } catch (e) {
    return res.status(400).json({ error: e.message || 'Missing itineraryId' });
  }
  if (!isUuid(destId)) return res.status(400).json({ error: 'Invalid destination id' });

  // verifica appartenenza
  const { data: owner, error: eOwn } = await supa
    .from('destinations')
    .select('id')
    .eq('id', destId)
    .eq('itinerary_id', realItId)
    .maybeSingle();
  if (eOwn) return res.status(500).json({ error: eOwn.message });
  if (!owner) return res.status(404).json({ error: 'Destination not found in itinerary' });

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const { name, address, visit_date, arrival_time, departure_time } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ error: 'name is required' });
    if (!visit_date?.trim()) return res.status(400).json({ error: 'visit_date is required' });

    const { data, error } = await supa
      .from('destinations')
      .update({
        name: name.trim(),
        address: address?.trim() || null,
        visit_date,
        arrival_time: arrival_time || null,
        departure_time: departure_time || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', destId)
      .eq('itinerary_id', realItId)
      .select()
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ destination: data });
  }

  if (req.method === 'DELETE') {
    const { error } = await supa
      .from('destinations')
      .delete()
      .eq('id', destId)
      .eq('itinerary_id', realItId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['PUT', 'PATCH', 'DELETE']);
  return res.status(405).json({ error: 'Method Not Allowed' });
}
