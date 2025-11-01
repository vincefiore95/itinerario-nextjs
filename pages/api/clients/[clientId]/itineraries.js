// pages/api/clients/[clientId]/itineraries.js
import { getSupabaseAdmin, uuid } from '../../_supabase';

export default async function handler(req, res) {
  const supa = getSupabaseAdmin();
  if (!supa) return res.status(500).json({ error: 'Missing env vars' });

  let { clientId } = req.query;
  clientId = Array.isArray(clientId) ? clientId[0] : clientId;

  if (req.method === 'POST') {
    const { title, startDate, endDate } = req.body || {};

    if (!title?.trim()) return res.status(400).json({ error: 'title required' });
    if (!startDate)     return res.status(400).json({ error: 'startDate required' });
    if (!endDate)       return res.status(400).json({ error: 'endDate required' });

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ error: 'startDate cannot be after endDate' });
    }

    // verifica cliente + prendi name/email per denormalizzare
    const { data: client, error: ce } = await supa
      .from('clients')
      .select('id, name, email')
      .eq('id', clientId)
      .maybeSingle();

    if (ce)        return res.status(500).json({ error: ce.message });
    if (!client)   return res.status(404).json({ error: 'Client not found' });

    const share_token = uuid();

    const { data, error } = await supa
      .from('itineraries')
      .insert({
        client_id: clientId,
        client_name: client.name || null,   // denormalizzazione
        client_email: client.email || null, // denormalizzazione
        title: title.trim(),
        start_date: startDate,
        end_date: endDate,
        share_token
      })
      .select('id, title, start_date, end_date, share_token, created_at, client_id, client_name, client_email')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({
      itinerary: data,
      shareUrl: `/share/itinerary/${share_token}`
    });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end('Method Not Allowed');
}
