import { useState } from 'react';

export default function ItineraryForm({ onSaved }) {
  const [dateISO, setDateISO] = useState('');
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [destinations, setDestinations] = useState([]); // già esistente nella tua UX
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!dateISO || !title) return;
    try {
      setSaving(true);
      const { clientShare, itineraryShare } = await saveAndShare({
        clientName, clientEmail, title, dateId: dateISO, destinations
      });
      // toast + copia link (stile coerente con le tue classi)
      showToast('Link cliente pronto', 'Copia', () => {
        navigator.clipboard.writeText(`${location.origin}${clientShare}`);
      });
      showToast('Link itinerario pronto', 'Copia', () => {
        navigator.clipboard.writeText(`${location.origin}${itineraryShare}`);
      });
      onSaved?.({ clientShare, itineraryShare });
      // reset se vuoi
      // setTitle(''); setClientName(''); setClientEmail(''); setDestinations([]);
    } catch (err) {
      showToast(`Errore: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="card" style={{ padding: 16, display:'grid', gap:12 }}>
      <div>
        <label>
        Data
        <input type="date" value={dateISO} onChange={(e)=>setDateISO(e.target.value)} />
      </label>
      </div>
      <div>
        <label>
        Titolo
        <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Giornata a ..." />
      </label>
      </div>
      {/* Nome cliente */}
      <div>
        <label className="label">Nome cliente</label>
        <input className="input" value={clientName} onChange={(e)=>setClientName(e.target.value)} placeholder="Mario Rossi" />
      </div>
      {/* Email cliente */}
      <div>
        <label className="label">Email cliente</label>
        <input className="input" value={clientEmail} onChange={(e)=>setClientEmail(e.target.value)} placeholder="mario.rossi@example.com" />
      </div>

      <button className="btn primary" type="submit" disabled={saving}>
        {saving ? 'Salvataggio…' : 'Salva & genera link'}
      </button>
    </form>
  );
}
