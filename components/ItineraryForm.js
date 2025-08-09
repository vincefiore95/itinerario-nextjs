// components/ItineraryForm.js
import { useState } from 'react';

export default function ItineraryForm({ onAdd }) {
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!id || !title) return;
    onAdd({ id, title, destinations: [] });
    setId('');
    setTitle('');
  };

  return (
    <form onSubmit={submit} className="form">
      <label>
        Data (YYYY-MM-DD)
        <input value={id} onChange={(e)=>setId(e.target.value)} placeholder="2025-08-21" />
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
