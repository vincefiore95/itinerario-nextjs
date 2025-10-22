// pages/api/admin/itineraries/index.js
import { getSupabaseAdmin } from '../../_supabase';
import { randomUUID } from 'crypto';

const isIsoDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v || '');
const pick = (a, b) => (a ?? b ?? null);

export default async function handler(req, res) {
  const supa = getSupabaseAdmin();
  if (!supa) return res.status(500).json({ error: 'Missing env vars' });

  // ----------------------- POST (create) -----------------------
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const clientPayload = body.client || body;
      const itinPayload   = body.itinerary || body;

      const email      = pick(clientPayload.email, clientPayload.client_email);
      const name       = pick(clientPayload.name,  clientPayload.client_name);
      const title      = pick(itinPayload.title,   itinPayload.itinerary_title);
      const start_date = pick(itinPayload.start_date, itinPayload.startDate);
      const end_date   = pick(itinPayload.end_date,   itinPayload.endDate);

      if (!email)  return res.status(400).json({ error: 'client email is required' });
      if (!title)  return res.status(400).json({ error: 'title is required' });
      if (!start_date || !end_date) return res.status(400).json({ error: 'start_date and end_date are required' });
      if (!isIsoDate(start_date) || !isIsoDate(end_date)) {
        return res.status(400).json({ error: 'dates must be YYYY-MM-DD' });
      }
      if (new Date(start_date) > new Date(end_date)) {
        return res.status(400).json({ error: 'start_date cannot be after end_date' });
      }

      // 1) trova o crea client per email
      let clientId;
      let finalClientName = name || null; // lo useremo per scrivere client_name in itineraries
      {
        const { data: existing, error: e1 } = await supa
          .from('clients')
          .select('id, name')
          .eq('email', email)
          .maybeSingle();
        if (e1) return res.status(500).json({ error: e1.message });

        if (existing) {
          clientId = existing.id;
          // se passo un name nuovo, aggiorno il cliente e uso quello
          if (name && name !== existing.name) {
            await supa.from('clients').update({ name }).eq('id', clientId);
            finalClientName = name;
          } else {
            finalClientName = existing.name ?? name ?? null;
          }
        } else {
          const { data: created, error: e2 } = await supa
            .from('clients')
            .insert([{ name: name || null, email, share_token: randomUUID() }])
            .select('id, name')
            .maybeSingle();
          if (e2) return res.status(500).json({ error: e2.message });
          clientId = created.id;
          finalClientName = created.name ?? null;
        }
      }

      // 2) crea itinerario (👉 scrivo anche client_name, client_email)
      const { data: itinerary, error: e3 } = await supa
        .from('itineraries')
        .insert([{
          client_id: clientId,
          title: title.trim(),
          start_date,
          end_date,
          share_token: randomUUID(),
          client_name: finalClientName, // denormalizzato
          client_email: email           // denormalizzato
        }])
        .select('id, title, start_date, end_date, share_token, created_at, client_id, client_name, client_email')
        .maybeSingle();
      if (e3) return res.status(500).json({ error: e3.message });

      // 3) includo info cliente minime (comodo per FE)
      const { data: client, error: e4 } = await supa
        .from('clients')
        .select('id, name, email, share_token')
        .eq('id', clientId)
        .maybeSingle();
      if (e4) return res.status(500).json({ error: e4.message });

      return res.status(201).json({
        itinerary: { ...itinerary, client },
        shareUrl: `/share/itinerary/${itinerary.share_token}`
      });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Unexpected error' });
    }
  }

  // ----------------------- GET (list + filters) -----------------------
  if (req.method === 'GET') {
    try {
      const q         = req.query.q?.toString().trim() || '';
      const name      = req.query.name?.toString().trim() || '';
      const email     = req.query.email?.toString().trim() || '';
      const title     = req.query.title?.toString().trim() || '';
      const startFrom = req.query.startFrom?.toString().trim() || '';
      const startTo   = req.query.startTo?.toString().trim() || '';
      const endFrom   = req.query.endFrom?.toString().trim() || '';
      const endTo     = req.query.endTo?.toString().trim() || '';

      let qry = supa
        .from('itineraries')
        .select('id, title, start_date, end_date, created_at, client_id, client_name, client_email, share_token')
        .order('created_at', { ascending: false });

      if (title) qry = qry.ilike('title', `%${title}%`);
      if (startFrom) qry = qry.gte('start_date', startFrom);
      if (startTo)   qry = qry.lte('start_date', startTo);
      if (endFrom)   qry = qry.gte('end_date', endFrom);
      if (endTo)     qry = qry.lte('end_date', endTo);

      const rIt = await qry;
      if (rIt.error) return res.status(500).json({ error: rIt.error.message });
      let its = rIt.data || [];

      // opzionale: arricchisco con cliente completo (se ti serve in FE)
      const clientIds = [...new Set(its.map(i => i.client_id).filter(Boolean))];
      let clientsById = {};
      if (clientIds.length) {
        const rC = await supa
          .from('clients')
          .select('id, name, email, share_token')
          .in('id', clientIds);
        if (rC.error) return res.status(500).json({ error: rC.error.message });
        for (const c of rC.data || []) clientsById[c.id] = c;
      }
      its = its.map(i => ({ ...i, client: clientsById[i.client_id] || null }));

      // filtri rapidi anche su denormalizzati
      const matches = (s, needle) => (s || '').toLowerCase().includes((needle || '').toLowerCase());
      if (name)  its = its.filter(i => matches(i.client_name || i.client?.name || '', name));
      if (email) its = its.filter(i => matches(i.client_email || i.client?.email || '', email));
      if (q) {
        its = its.filter(i =>
          matches(i.title, q) ||
          matches(i.client_name || i.client?.name || '', q) ||
          matches(i.client_email || i.client?.email || '', q)
        );
      }

      return res.status(200).json({ itineraries: its });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Unexpected error' });
    }
  }

  // ----------------------- DELETE (bulk) -----------------------
  if (req.method === 'DELETE') {
    try {
      const { ids } = req.body || {};
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'ids array required' });
      }
      const { error } = await supa.from('itineraries').delete().in('id', ids);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true, deleted: ids.length });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Unexpected error' });
    }
  }

  res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
  return res.status(405).json({ error: 'Method Not Allowed' });
}
