// pages/index.js
import DayCard from '../components/DayCard';
import { itineraries as DEFAULTS } from '../data/itineraries';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ItineraryForm from '../components/ItineraryForm';

export default function Home() {
  const [custom, setCustom] = useLocalStorage('itineraries_custom', []);

  // 1) Prima i default che non sono stati sovrascritti,
  // 2) poi gli itinerari personalizzati nell'ordine di inserimento
  const combined = [
    ...DEFAULTS
      .filter(d => !custom.some(c => c.id === d.id))
      .map(d => ({ ...d, _custom: false })),
    ...custom.map(c => ({ ...c, _custom: true })),
  ];

  const addItinerary = (itin) => {
    // Evita duplicati sulla stessa data
    if ([...custom, ...DEFAULTS].some(d => d.id === itin.id)) {
      alert('Esiste già un itinerario con questa data.');
      return;
    }
    // APPEND in coda
    setCustom([...custom, itin]);
  };

  const deleteItinerary = (id) => {
    if (!confirm('Eliminare questo itinerario?')) return;
    setCustom(custom.filter(c => c.id !== id));
  };

  return (
    <div className="container">
      <header className="top">
        <h1>I miei itinerari</h1>
      </header>

      <ItineraryForm onAdd={addItinerary} />

      <section className="grid">
        {combined.map(day => (
          <DayCard
            key={day.id}
            day={day}
            isCustom={day._custom}
            onDelete={() => deleteItinerary(day.id)}
          />
        ))}
      </section>

      <style jsx>{`
        .top{ margin:6px 0 18px; }
        h1{ margin:0; font-size:clamp(1.4rem,3.6vw,2.25rem); line-height:1.1; letter-spacing:.3px; }
        .grid{ display:grid; gap:14px; grid-template-columns:1fr; }
        @media (min-width:560px){ .grid{ grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media (min-width:900px){ .grid{ gap:18px; grid-template-columns:repeat(3,minmax(0,1fr)); } }
        @media (min-width:1200px){ .grid{ grid-template-columns:repeat(4,minmax(0,1fr)); } }
      `}</style>
    </div>
  );
}
