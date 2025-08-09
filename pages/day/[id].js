import { useRouter } from 'next/router';
import { itineraries as DEFAULTS } from '../../data/itineraries';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import DestinationForm from '../../components/DestinationForm';

const withDisplay = (list) =>
  list.map(d => ({ ...d, displayDate: d.displayDate || new Date(d.id).toLocaleDateString('it-IT',{day:'2-digit',month:'2-digit',year:'numeric'}) }));

export default function DayDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [itins, setItins] = useLocalStorage('itineraries_all', withDisplay(DEFAULTS));

  if (!id) return null;
  const idx = itins.findIndex(d => d.id === id);
  const itin = idx >= 0 ? itins[idx] : null;

  if (!itin) {
    return (
      <div className="container">
        <p className="muted">Itinerario non trovato.</p>
        <a href="/" className="btn">← Torna alla lista</a>
      </div>
    );
  }

  const openInMaps = (address) => {
    const q = encodeURIComponent(address);
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    window.open(isIOS ? `maps://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };
  const addDestination = (dest) => {
    const next = [...itins];
    next[idx] = { ...itin, destinations: [dest, ...itin.destinations] };
    setItins(next);
  };
  const removeDestination = (i) => {
    const list = [...itin.destinations]; list.splice(i,1);
    const next = [...itins]; next[idx] = { ...itin, destinations: list };
    setItins(next);
  };
  const deleteItinerary = () => {
    if (!confirm('Eliminare questo itinerario?')) return;
    setItins(itins.filter(x => x.id !== id));
    router.push('/');
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="head">
        <div>
          <h1 className="h1">{itin.title}</h1>
          <div className="muted" style={{marginTop:4}}>{itin.displayDate}</div>
        </div>
        <div className="actions">
          <a href="/" className="btn">← Indietro</a>
          <button className="btn ghost" onClick={deleteItinerary}>Elimina itinerario</button>
        </div>
      </div>

      {/* Form */}
      <DestinationForm onAdd={addDestination} />

      {/* Lista destinazioni */}
      <ul className="grid" style={{marginTop:12, padding:0, listStyle:'none'}}>
        {itin.destinations.map((d, i) => (
          <li key={i} className="card item">
            <div className="info">
              <div className="name">{d.name}</div>
              <div className="addr muted">{d.address}</div>
            </div>
            <div className="buttons">
              <button className="btn primary" onClick={() => openInMaps(d.address)}>Apri in Mappe</button>
              <button className="btn ghost" onClick={() => removeDestination(i)}>Rimuovi</button>
            </div>
          </li>
        ))}
        {itin.destinations.length === 0 && (
          <li className="muted">Nessuna destinazione ancora. Aggiungine una sopra.</li>
        )}
      </ul>

      <style jsx>{`
        .head{
          display:flex; align-items:center; justify-content:space-between;
          gap:12px; margin-bottom:12px;
        }
        .actions{display:flex; gap:8px; flex-wrap:wrap;}
        .item{
          display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:12px; border-radius: var(--radius);
        }
        .info{min-width:0}
        .name{font-weight:700; font-size: clamp(1rem, 2.2vw, 1.25rem); margin:0 0 4px;}
        .addr{overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
        .buttons{display:flex; gap:8px; flex-shrink:0}
      `}</style>
    </div>
  );
}
