import DayCard from '../components/DayCard';
import { itineraries } from '../data/itineraries';

export default function Home() {
  return (
    <div className="container">
      <header className="top">
        <h1>I miei itinerari</h1>
      </header>

      <section className="grid">
        {itineraries.map(day => <DayCard key={day.id} day={day} />)}
      </section>

      <style jsx>{`
        .top{ margin:6px 0 18px; }
        h1{ margin:0; font-size:clamp(1.4rem,3.6vw,2.25rem); line-height:1.1; letter-spacing:.3px; }
        .grid{
          display:grid; gap:14px; grid-template-columns:1fr; /* mobile */
        }
        @media (min-width:560px){ .grid{ grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media (min-width:900px){ .grid{ gap:18px; grid-template-columns:repeat(3,minmax(0,1fr)); } }
        @media (min-width:1200px){ .grid{ grid-template-columns:repeat(4,minmax(0,1fr)); } }
      `}</style>
    </div>
  );
}
