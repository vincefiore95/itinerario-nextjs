import DayCard from '../components/DayCard';
import { itineraries } from '../data/itineraries';

export default function Home() {
  return (
    <div className="wrap">
      <header className="top">
        <h1>I miei itinerari</h1>
        {/* opzionale: barra ricerca futura */}
      </header>

      <section className="grid">
        {itineraries.map((day) => (
          <DayCard key={day.id} day={day} />
        ))}
      </section>

      <style jsx>{`
        .wrap {
          padding: 16px clamp(16px, 4vw, 32px);
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
        }
        .top { margin: 4px 0 18px; }
        h1 {
          margin: 0;
          font-size: clamp(1.4rem, 3.8vw, 2.25rem);
          line-height: 1.1;
          letter-spacing: .3px;
        }
        .grid {
          display: grid;
          gap: 14px;
          grid-template-columns: 1fr;           /* mobile: 1 colonna */
        }

        @media (min-width: 560px) {
          .grid { grid-template-columns: repeat(2, 1fr); }  /* tablet piccolo */
        }
        @media (min-width: 900px) {
          .grid { gap: 18px; grid-template-columns: repeat(3, 1fr); } /* desktop medio */
        }
        @media (min-width: 1200px) {
          .grid { grid-template-columns: repeat(4, 1fr); }  /* desktop largo */
        }
      `}</style>
    </div>
  );
}
