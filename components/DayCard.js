import Link from 'next/link';

export default function DayCard({ day }) {
  const d = new Date(day.id);
  const dateStr = isNaN(d)
    ? day.id
    : d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <Link href={`/day/${encodeURIComponent(day.id)}`} className="card" aria-label={`Apri ${day.title}`}>
      <div className="date">{dateStr}</div>
      <h2 className="title">{day.title}</h2>
      <p className="meta">
        {day.destinations.length} destinazione{day.destinations.length !== 1 ? 'i' : ''}
      </p>

      <style jsx>{`
        .card {
          display: grid;
          gap: .55rem;
          padding: 18px;
          border-radius: 16px;
          border: 1px solid #e9e9ec;
          background: #ffffff;
          box-shadow: 0 1px 2px rgba(0,0,0,.05);
          transition: transform .12s ease, box-shadow .2s ease, border-color .2s ease, background .2s;
          text-decoration: none;         /* niente blu/sottolineato */
          color: inherit;
        }
        .card:hover, .card:focus-visible {
          transform: translateY(-2px);
          border-color: #f7b500;
          box-shadow: 0 10px 24px rgba(0,0,0,.08);
          outline: none;
        }

        .date {
          width: fit-content;
          font-size: .78rem;
          padding: .28rem .6rem;
          border-radius: 999px;
          background: #fff7d6;
          border: 1px solid #ffe08a;
          color: #7a5a00;
        }
        .title {
          margin: 0;
          font-size: 1.15rem;
          line-height: 1.2;
          font-weight: 700;
          letter-spacing: .2px;
          color: #111827;
        }
        .meta {
          margin: 0;
          color: #6b7280;
          font-size: .95rem;
        }

        @media (prefers-color-scheme: dark) {
          .card { background: #0f1115; border-color: #1f2330; }
          .title { color: #e6e7ea; }
          .meta { color: #9aa3b2; }
          .card:hover, .card:focus-visible { border-color: #f7b500; }
          .date { background: #2a2210; border-color: #5c4300; color: #ffd269; }
        }
      `}</style>
    </Link>
  );
}
