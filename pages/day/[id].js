// pages/day/[id].js
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

  const openInMaps = (address) => {
    const q = encodeURIComponent(address);
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    window.open(isIOS ? `maps://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };

  const addDestination = (dest) => {
    if (customItin) {
      // aggiorna l'esistente
      const next = [...custom];
      next[customIdx] = { ...customItin, destinations: [dest, ...customItin.destinations] };
      setCustom(next);
    } else if (defaultItin) {
      // prima personalizzazione: APPEND in coda
      const newCustom = { ...defaultItin, destinations: [dest, ...defaultItin.destinations] };
      setCustom([...custom, newCustom]);
    } else {
      // creazione da URL: APPEND in coda
      const newCustom = { id, title: id, destinations: [dest] };
      setCustom([...custom, newCustom]);
    }
  };

  const removeDestination = (i) => {
    if (!customItin) return; // i default non si modificano senza copia personale
    const list = [...customItin.destinations];
    list.splice(i, 1);
    const next = [...custom];
    next[customIdx] = { ...customItin, destinations: list };
    setCustom(next);
  };

  const deleteItinerary = () => {
    if (!customItin) return; // non si elimina un default
    if (!confirm('Eliminare questo itinerario?')) return;
    setCustom(custom.filter(c => c.id !== id));
    router.push('/');
  };

  return (
    <div className="container">
      <header className="head">
        <div>
          <h1 className="title">{itinerary.title}</h1>
        </div>
        <div className="head-actions">
          <a href="/" className="btn ghost">← Indietro</a>
          {customItin && <button className="btn ghost" onClick={deleteItinerary}>Elimina itinerario</button>}
        </div>
      </header>

      <div className="sub">{id}</div>

      <DestinationForm onAdd={addDestination} />

      {!customItin && defaultItin && (
        <p style={{margin:'6px 0 14px', color:'var(--muted)'}}>
          (Questo è un itinerario di default. Aggiungendo/rimuovendo verrà creata una tua copia personale.)
        </p>
      )}

      <ul className="list">
        {itinerary.destinations.map((d, i) => (
          <li key={i} className="item">
            <div className="info">
              <div className="name">{d.name}</div>
              <div className="addr">{d.address}</div>
            </div>
            <div className="actions">
              <button className="btn" onClick={() => openInMaps(d.address)}>Apri in Mappe</button>
              {customItin && (
                <button className="btn ghost" onClick={() => removeDestination(i)}>Rimuovi</button>
              )}
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
