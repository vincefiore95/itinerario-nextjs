import Link from 'next/link';

export default function DayCard({ day }) {
  const date = new Date(day.id);
  const dateStr = isNaN(date) ? day.id : date.toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: '2-digit'
  });

  return (
    <article className="card" aria-label={`Itinerario ${day.title} del ${dateStr}`}>
      <div className="header">
        <span className="badge" title={day.id}>{dateStr}</span>
        <h2 className="title">{day.title}</h2>
      </div>

      <p className="count">
        {day.destinations.length} destinazione{day.destinations.length !== 1 ? 'i' : ''}
      </p>

      <div className="actions">
        <Link href={`/day/${encodeURIComponent(day.id)}`} className="btn btn-primary" aria-label={`Apri itinerario ${day.title}`}>
          Apri itinerario
        </Link>
        <Link href={`/day/${encodeURIComponent(day.id)}`} className="link">
          Vedi dettagli →
        </Link>
      </div>

      <style jsx>{`
        .card {
          display: grid;
          gap: .75rem;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 1px 2px rgba(0,0,0,.04);
          transition: box-shadow .2s ease, transform .12s ease, border-color .2s ease;
        }
        .card:focus-within,
        .card:hover {
          border-color: #f7b500;
          box-shadow: 0 8px 20px rgba(0,0,0,.08);
          transform: translateY(-1px);
        }

        .header { display: grid; gap: .25rem; }
        .badge {
          align-self: start;
          width: fit-content;
          font-size: .8rem;
          padding: .2rem .5rem;
          border-radius: 999px;
          background: #fff7d6;
          color: #7a5a00;
          border: 1px solid #ffe08a;
        }
        .title {
          margin: 0;
          font-size: 1.1rem;
          line-height: 1.25;
          color: #111827;
        }

        .count {
          margin: 0;
          color: #6b7280;
          font-size: .95rem;
        }

        .actions {
          display: flex;
          gap: .5rem;
          align-items: center;
          flex-wrap: wrap;
          margin-top: .25rem;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          padding: 0 .9rem;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          text-decoration: none;
          font-weight: 600;
          font-size: .95rem;
          color: #111827;
          background: #fff;
          transition: background .15s, border-color .15s, transform .08s;
        }
        .btn:hover { background: #f9fafb; }
        .btn:active { transform: translateY(1px); }

        .btn-primary {
          background: #f7b500;
          border-color: #f7b500;
          color: #111111;
        }
        .btn-primary:hover { filter: brightness(0.98); }

        .link {
          font-size: .95rem;
          color: #374151;
          text-decoration: none;
        }
        .link:hover { text-decoration: underline; }
      `}</style>
    </article>
  );
}
