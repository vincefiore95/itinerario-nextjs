// pages/day/[id].js  (solo parti nuove/aggiornate)
import { useRouter } from 'next/router';
import { itineraries as DEFAULTS } from '../../data/itineraries';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import DestinationForm from '../../components/DestinationForm';

export default function DayDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [custom, setCustom] = useLocalStorage('itineraries_custom', []);

  if (!id) return null;

  const customIdx = custom.findIndex(d => d.id === id);
  const customItin = customIdx >= 0 ? custom[customIdx] : null;
  const defaultItin = DEFAULTS.find(d => d.id === id) || null;
  const itinerary = customItin || defaultItin;

  if (!itinerary) {
    return (
      <div className="container">
        <p style={{color:'#d30'}}>Itinerario non trovato.</p>
        <a href="/" className="btn-link">← Torna alla lista</a>
      </div>
    );
  }

  const deleteThis = () => {
    if (!customItin) return; // non puoi eliminare i default
    if (!confirm('Eliminare questo itinerario?')) return;
    setCustom(custom.filter(c => c.id !== id));
    router.push('/');
  };

  // ... (resto del file invariato: openInMaps, addDestination, removeDestination)

  return (
    <div className="container">
      <header className="head">
        <div>
          <h1 className="title">{itinerary.title}</h1>
          <div className="sub">{id}</div>
        </div>
        <div className="head-actions">
          <a href="/" className="btn ghost">← Indietro</a>
          {customItin && (
            <button className="btn ghost" onClick={deleteThis}>Elimina itinerario</button>
          )}
        </div>
      </header>

      {/* ...DestinationForm + lista come già impostato... */}

      <style jsx>{`
        .head{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; }
        .head-actions{ display:flex; gap:8px; }
        .title{ margin:0; font-size:clamp(1.2rem,3.2vw,1.8rem); line-height:1.15; }
        .sub{ color:var(--muted); font-size:.95rem; margin-top:2px; }
        .btn{
          background:var(--brand); color:#111; border:1px solid var(--brand);
          padding:8px 12px; border-radius:10px; font-weight:600; cursor:pointer;
        }
        .btn:hover{ filter:brightness(.98); }
        .btn.ghost{ background:transparent; color:inherit; border:1px solid var(--border); }
        .btn-link{ color:inherit; text-decoration:underline; }
      `}</style>
    </div>
  );
}
