// pages/api/itineraries/index.js
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

let cached = null;
function getSupabaseAdmin() {
  if (cached) return cached;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;           // niente throw
  cached = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  return cached;
}

export default async function handler(req, res) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Missing Supabase env vars. Configure .env.local and restart.' });
  }

  if (req.method === 'POST') {
    try {
      const { dateId, title, destinations, clientName, clientEmail } = req.body || {}
      if (!dateId || !title || !Array.isArray(destinations)) {
        return res.status(400).json({ error: 'dateId, title, destinations are required' })
      }

      const share_token = randomUUID()
      const { data, error } = await supabaseAdmin
        .from('itineraries')
        .insert({
          date_id: dateId,
          title,
          destinations,
          client_name: clientName || null,
          client_email: clientEmail || null,
          share_token,
        })
        .select()
        .single()

      if (error) return res.status(500).json({ error: error.message })
      return res.status(201).json({ itinerary: data, shareUrl: `/share/${share_token}` })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }

  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
      .from('itineraries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ itineraries: data })
  }

  res.setHeader('Allow', ['POST', 'GET'])
  res.status(405).end('Method Not Allowed')
}
