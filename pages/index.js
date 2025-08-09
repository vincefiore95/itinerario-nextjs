import DayCard from '../components/DayCard';
import { itineraries } from '../data/itineraries';

export default function Home() {
  return (
    <div className="wrap">
      <h1 className="title">I miei itinerari</h1>

      <section className="grid">
        {itineraries.map((day) => (
          <DayCard key={day.id} day={day} />
        ))}
      </section>

      <style jsx>{`
        .wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px clamp(16px, 4vw, 32px);
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        }
        .title {
          margin: 6px 0 18px;
          font-size: clamp(1.4rem, 3.6vw, 2.25rem);
          line-height: 1.1;
          letter-spacing: .3px;
        }
        .grid {
          display: grid;
          gap: 14px;
          grid-template-columns: 1fr;               /* mobile: 1 colonna */
        }
        @media (min-width: 560px) {
          .grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
        }
        @media (min-width: 900px) {
          .grid { gap: 18px; grid-template-columns: repeat(3, minmax(0,1fr)); }
        }
        @media (min-width: 1200px) {
          .grid { grid-template-columns: repeat(4, minmax(0,1fr)); }
        }
      `}</style>

      <style jsx global>{`
        /* sfondo soft + smoothing globale */
        body { margin: 0; background: #fafafa; }
        @media (prefers-color-scheme: dark) { body { background: #0b0d12; } }
        * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      `}</style>
    </div>
  );
}
