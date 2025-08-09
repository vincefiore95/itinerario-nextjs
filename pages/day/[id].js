import { useRouter } from 'next/router';
import { itineraries } from '../../data/itineraries';

export default function DayDetails() {
  const { query:{ id } } = useRouter();
  const itinerary = itineraries.find(d => d.id === id);

  if (!id) return null;
  if (!itinerary) return (
    <div className="container">
      <p style={{color:'#d30'}}>Itinerario non trovato.</p>
      <a href="/" className="btn-link">← Torna alla lista</a>
    </div>
  );

  const openInMaps = (address) => {
    const q = encodeURIComponent(address);
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    window.open(isIOS ? `maps://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };

  return (
    <div className="container">
      <header className="head">
        <div>
          <h1 className="title">{itinerary.title}</h1>
          <div className="sub">{id}</div>
        </div>
        <a href="/" className="btn ghost">← Indietro</a>
      </header>

      <ul className="list">
        {itinerary.destinations.map((d, i) => (
          <li key={i} className="item">
            <div className="info">
              <div className="name">{d.name}</div>
              <div className="addr">{d.address}</div>
            </div>
            <button className="btn" onClick={() => openInMaps(d.address)}>Apri in Mappe</button>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .head{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; }
        .title{ margin:0; font-size:clamp(1.2rem,3.2vw,1.8rem); line-height:1.15; }
        .sub{ color:var(--muted); font-size:.95rem; margin-top:2px; }

        .list{ list-style:none; padding:0; margin:0; display:grid; gap:10px; }
        .item{
          display:flex; align-items:center; justify-content:space-between; gap:10px;
          padding:14px; border-radius:14px; background:var(--card); border:1px solid var(--border);
        }
        .info{ min-width:0; }
        .name{ font-weight:600; }
        .addr{ color:var(--muted); font-size:.95rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

        .btn{
          background:var(--brand); color:#111; border:1px solid var(--brand);
          padding:8px 12px; border-radius:10px; font-weight:600; cursor:pointer;
          transition:filter .15s;
        }
        .btn:hover{ filter:brightness(.98); }
        .btn.ghost{
          background:transparent; color:var(--text); border:1px solid var(--border);
        }
        .btn-link{ color:var(--text); text-decoration:underline; }
      `}</style>
    </div>
  );
}
