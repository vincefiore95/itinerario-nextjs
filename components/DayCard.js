import Link from 'next/link';

export default function DayCard({ day }) {
  const date = new Date(day.id);
  const dateStr = isNaN(date)
    ? day.id
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });

  return (
    <Link href={`/day/${encodeURIComponent(day.id)}`} className="card" aria-label={`Apri ${day.title}`}>
      <div className="badge">{dateStr}</div>
      <h2 className="title">{day.title}</h2>
      <p className="meta">
        {day.destinations.length} destinazione{day.destinations.length !== 1 ? 'i' : ''}
      </p>

      <style jsx>{`
        .card {
          display: grid;
          gap: .5rem;
          padding: 16px;
          border-radius: 16px;
          background: #fff;
          border: 1px solid #ececec;
          box-shadow: 0 1px 2px rgba(0,0,0,.04);
          text-decoration: none;
          color: inherit;
          transition: transform .12s ease, box-shadow .2s ease, border-color .2s ease, background .2s;
          will-change: transform;
        }
        .card:hover, .card:focus-visible {
          transform: translateY(-2px);
          border-color: #f7b500;
          box-shadow: 0 10px 24px rgba(0,0,0,.08);
          outline: none;
        }
        .badge {
          width: fit-content;
          font-size: .8rem;
          padding: .25rem .6rem;
          border-radius: 999px;
          background: #fff7d6;
          border: 1px solid #ffe08a;
          color: #7a5a00;
        }
        .title {
          margin: 0;
          font-size: 1.2rem;
          line-height: 1.2;
          font-weight: 700;
          letter-spacing: .2px;
        }
        .meta {
          margin: 2px 0 0;
          color: #6b7280;
          font-size: .95rem;
        }

        @media (prefers-color-scheme: dark) {
          .card { background: #0f1115; border-color: #1e2230; }
          .card:hover, .card:focus-visible { border-color: #f7b500; }
          .title { color: #e5e7eb; }
          .meta { color: #9aa3b2; }
          .badge { background: #2a2210; border-color: #5c4300; color: #ffd269; }
        }
      `}</style>
    </Link>
  );
}
