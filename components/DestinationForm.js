// components/DestinationForm.js
import { useState } from 'react';

export default function DestinationForm({ onAdd }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!address) return;
    onAdd({ name: name || address, address });
    setName(''); setAddress('');
  };

  return (
    <form onSubmit={submit} className="form">
      <label>
        Nome (facoltativo)
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Colosseo" />
      </label>
      <label>
        Indirizzo
        <input value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Piazza del Colosseo, Roma" />
      </label>
      <button type="submit">Aggiungi destinazione</button>

      <style jsx>{`
        .form{display:grid;gap:10px;margin-bottom:16px;padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--card);}
        label{display:grid;gap:6px;font-size:.9rem}
        input{height:36px;padding:0 10px;border:1px solid var(--border);border-radius:8px;background:transparent;color:inherit}
        button{justify-self:start;background:var(--brand);color:#111;border:1px solid var(--brand);padding:8px 12px;border-radius:10px;font-weight:600;cursor:pointer}
        button:hover{filter:brightness(.98)}
        @media(min-width:640px){.form{grid-template-columns:1fr 2fr auto;align-items:end}}
      `}</style>
    </form>
  );
}
