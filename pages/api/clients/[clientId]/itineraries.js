import { getSupabaseAdmin, uuid } from '../../_supabase'

export default async function handler(req, res) {
  const supa = getSupabaseAdmin();
  if (!supa) return res.status(500).json({ error: 'Missing env vars' });

  const { clientId } = req.query;

  if (req.method === 'POST') {
    const { title, dateId } = req.body || {};
    if (!title) return res.status(400).json({ error: 'title required' });

    // opzionale: verifica client esiste
    const { data: client, error: ce } = await supa.from('clients').select('id').eq('id', clientId).single();
    if (ce || !client) return res.status(404).json({ error: 'Client not found' });

    const share_token = uuid();
    const { data, error } = await supa
      .from('itineraries')
      .insert({ client_id: clientId, title, date_id: dateId || null, share_token })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ itinerary: data, shareUrl: `/share/itinerary/${share_token}` });
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end('Method Not Allowed');
}
