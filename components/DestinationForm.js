import { useState } from 'react';

export default function DestinationForm({ onAdd }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    onAdd({ name: name.trim() || address.trim(), address: address.trim() });
    setName(''); setAddress('');
  };

  return (
    <form onSubmit={submit} className="card form">
      <div>
        <label className="label">Nome (facoltativo)</label>
        <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Colosseo" />
      </div>
      <div>
        <label className="label">Indirizzo</label>
        <input className="input" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Piazza del Colosseo, Roma" />
      </div>
      <div className="actions">
        <button className="btn primary" type="submit">Aggiungi destinazione</button>
      </div>

      <style jsx>{`
        .form{padding:14px; display:grid; gap:12px;}
        @media (min-width: 820px){
          .form{grid-template-columns: 1.2fr 2fr auto; align-items:end;}
        }
        .actions{display:flex; justify-content:flex-end;}
      `}</style>
    </form>
  );
}
