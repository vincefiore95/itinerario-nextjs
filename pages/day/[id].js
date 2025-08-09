// pages/day/[id].js
import { useRouter } from 'next/router';
import { itineraries as DEFAULTS } from '../../data/itineraries';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import DestinationForm from '../../components/DestinationForm';

const withDisplay = (list) =>
  list.map(d => ({
    ...d,
    displayDate:
      d.displayDate ||
      new Date(d.id).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }));

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
        <p style={{color:'#d30'}}>Itinerario non trovato.</p>
        <a href="/" className="btn-link">← Torna alla lista</a>
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
    const next = [...itins];
    const list = [...itin.destinations];
    list.splice(i, 1);
    next[idx] = { ...itin, destinations: list };
    setItins(next);
  };

  const deleteItinerary = () => {
    if (!confirm('Eliminare questo itinerario?')) return;
    setItins(itins.filter(x => x.id !== id));
    router.push('/');
  };

  return (
    <div className="container">
      <header className="head">
        <div>
          <h1 className="title">{itin.title}</h1>
          <div className="sub">{itin.displayDate}</div>
        </div>
        <div className="head-actions">
          <a href="/" className="btn ghost">← Indietro</a>
          <button className="btn ghost" onClick={deleteItinerary}>Elimina itinerario</button>
        </div>
      </header>

      <DestinationForm onAdd={addDestination} />

      <ul className="list">
        {itin.destinations.map((d, i) => (
          <li key={i} className="item">
            <div className="info">
              <div className="name">{d.name}</div>
              <div className="addr">{d.address}</div>
            </div>
            <div className="actions">
              <button className="btn" onClick={() => openInMaps(d.address)}>Apri in Mappe</button>
              <button className="btn ghost" onClick={() => removeDestination(i)}>Rimuovi</button>
            </div>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .head{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:6px; }
        .head-actions{ display:flex; gap:8px; }
        .title{ margin:0; font-size:clamp(1.2rem,3.2vw,1.8rem); line-height:1.15; }
        .sub{ color:var(--muted); font-size:.95rem; margin:0 0 10px; }
        .list{ list-style:none; padding:0; margin:0; display:grid; gap:10px; }
        .item{ display:flex; align-items:center; justify-content:space-between; gap:10px; padding:14px; border-radius:14px; background:var(--card); border:1px solid var(--border); }
        .info{ min-width:0; }
        .name{ font-weight:600; }
        .addr{ color:var(--muted); font-size:.95rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .actions{ display:flex; gap:8px; }
        .btn{ background:var(--brand); color:#111; border:1px solid var(--brand); padding:8px 12px; border-radius:10px; font-weight:600; cursor:pointer; }
        .btn:hover{ filter:brightness(.98); }
        .btn.ghost{ background:transparent; color:inherit; border:1px solid var(--border); }
        .btn-link{ color:inherit; text-decoration:underline; }
      `}</style>
    </div>
  );
}
