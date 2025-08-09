// components/DayCard.js
import Link from 'next/link';

export default function DayCard({ day, isCustom = false, onDelete, onHide }) {
  const d = new Date(day.id);
  const dateStr = isNaN(d)
    ? day.id
    : d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="card" role="group" aria-label={`Itinerario ${day.title}`}>
      <div className="date">{dateStr}</div>
      <h2 className="title">{day.title}</h2>
      <p className="meta">
        {day.destinations.length} destinazione{day.destinations.length !== 1 ? 'i' : ''}
      </p>

      <div className="actions">
        <Link href={`/day/${encodeURIComponent(day.id)}`} legacyBehavior passHref>
          <a className="btn">Apri</a>
        </Link>

        {isCustom && (
          <button className="btn ghost" onClick={onDelete} title="Elimina questo itinerario">
            Elimina
          </button>
        )}

        {/* opzionale: per nascondere un default */}
        {/* {!isCustom && onHide && (
          <button className="btn ghost" onClick={onHide} title="Nascondi questo itinerario di default">
            Nascondi
          </button>
        )} */}
      </div>

      <style jsx>{`
        .card{
          display:grid; gap:.6rem;
          padding:18px; border-radius:16px;
          background:var(--card); border:1px solid var(--border);
          box-shadow:0 1px 2px rgba(0,0,0,.05);
          transition:transform .12s, box-shadow .2s, border-color .2s;
        }
        .card:hover{ transform:translateY(-2px); box-shadow:0 10px 24px rgba(0,0,0,.08); border-color:var(--brand); }
        .date{
          width:fit-content; font-size:.78rem; padding:.28rem .6rem; border-radius:999px;
          background:#fff7d6; border:1px solid #ffe08a; color:#7a5a00;
        }
        .title{ margin:0; font-size:1.15rem; line-height:1.2; font-weight:700; color:var(--text); }
        .meta{ margin:0; color:var(--muted); font-size:.95rem; }
        .actions{ display:flex; gap:8px; margin-top:.2rem; flex-wrap:wrap; }
        .btn{
          background:var(--brand); color:#111; border:1px solid var(--brand);
          padding:8px 12px; border-radius:10px; font-weight:600; cursor:pointer; text-decoration:none;
        }
        .btn:hover{ filter:brightness(.98); }
        .btn.ghost{ background:transparent; color:inherit; border:1px solid var(--border); }
      `}</style>
    </div>
  );
}
