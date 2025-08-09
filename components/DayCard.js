// components/DayCard.js
import Link from 'next/link';

export default function DayCard({ day, onDelete }) {
  const dateLabel =
    day.displayDate ||
    new Date(day.id).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="card day" role="group" aria-label={`Itinerario ${day.title}`}>
      <div className="date">{dateLabel}</div>
      <h2 className="title">{day.title}</h2>
      <p className="meta">
        {day.destinations.length} destinazion{day.destinations.length !== 1 ? 'i' : 'e'}
      </p>

      <div className="actions">
        <Link href={`/day/${encodeURIComponent(day.id)}`} legacyBehavior passHref>
          <a className="btn primary">Apri</a>
        </Link>
        <button className="btn ghost" onClick={onDelete}>Elimina</button>
      </div>

      <style jsx>{`
        .day { padding: 14px; border-radius: var(--radius); transition: transform .12s, box-shadow .2s, border-color .2s; }
        .day:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(0,0,0,.08); border-color: var(--brand); }
        .date{
          width: fit-content; font-size: .78rem; padding: .3rem .6rem; border-radius: 999px;
          background: #fff7d6; border: 1px solid #ffe08a; color: #7a5a00; margin-bottom: 6px;
        }
        .title{ margin: 0; font-size: var(--fs-h2); line-height: 1.2; font-weight: 800; }
        .meta{ margin: 4px 0 8px; color: var(--muted); }
        .actions{ display: flex; gap: 8px; flex-wrap: wrap; }
      `}</style>
    </div>
  );
}
