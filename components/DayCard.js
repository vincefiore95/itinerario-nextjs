import Link from 'next/link';

export default function DayCard({ day }) {
  const d = new Date(day.id);
  const dateStr = isNaN(d)
    ? day.id
    : d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <Link href={`/day/${encodeURIComponent(day.id)}`} legacyBehavior passHref>
      <a className="card" aria-label={`Apri ${day.title}`}>
        <div className="badge">{dateStr}</div>
        <h2 className="title">{day.title}</h2>
        <p className="meta">
          {day.destinations.length} destinazione{day.destinations.length !== 1 ? 'i' : ''}
        </p>

        <style jsx>{`
          .card{
            display:grid; gap:.6rem;
            padding:18px; border-radius:16px;
            background:var(--card); border:1px solid var(--border);
            box-shadow:0 1px 2px rgba(0,0,0,.05);
            transition:transform .12s, box-shadow .2s, border-color .2s, background .2s;
          }
          .card:hover{ transform:translateY(-2px); box-shadow:0 10px 24px rgba(0,0,0,.08); border-color:var(--brand); }
          .card:focus-visible{ outline:3px solid var(--ring); outline-offset:2px; }
          .badge{
            width:fit-content; font-size:.78rem; padding:.28rem .6rem; border-radius:999px;
            background:#fff7d6; border:1px solid #ffe08a; color:#7a5a00;
          }
          .title{ margin:0; font-size:1.15rem; line-height:1.2; font-weight:700; }
          .meta{ margin:0; color:var(--muted); font-size:.95rem; }
        `}</style>
      </a>
    </Link>
  );
}
