// components/ItineraryForm.js
import { useState } from 'react';

const itDate = (d) =>
  d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function ItineraryForm({ onAdd }) {
  const [dateISO, setDateISO] = useState('');   // YYYY-MM-DD (safe per URL)
  const [title, setTitle] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!dateISO || !title) return;

    const d = new Date(dateISO);
    if (isNaN(d)) { alert('Data non valida'); return; }

    onAdd({
      id: dateISO,                       // usato nella route /day/[id]
      displayDate: itDate(d),            // mostrato in UI (gg/MM/yyyy)
      title,
      destinations: []
    });

    setDateISO('');
    setTitle('');
  };

  return (
    <form onSubmit={submit} className="form">
      <label>
        Data
        <input type="date" value={dateISO} onChange={(e)=>setDateISO(e.target.value)} />
      </label>
      <label>
        Titolo
        <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Giornata a ..." />
      </label>
      <button type="submit">Aggiungi itinerario</button>

      <style jsx>{`
        .form{display:grid;gap:10px;margin-bottom:16px;padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--card);}
        label{display:grid;gap:6px;font-size:.9rem}
        input{height:36px;padding:0 10px;border:1px solid var(--border);border-radius:8px;background:transparent;color:inherit}
        button{justify-self:start;background:var(--brand);color:#111;border:1px solid var(--brand);padding:8px 12px;border-radius:10px;font-weight:600;cursor:pointer}
        button:hover{filter:brightness(.98)}
        @media(min-width:640px){.form{grid-template-columns:1fr 1fr auto;align-items:end}}
      `}</style>
    </form>
  );
}
