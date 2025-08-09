// pages/index.js
import DayCard from '../components/DayCard';
import { itineraries as DEFAULTS } from '../data/itineraries';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ItineraryForm from '../components/ItineraryForm';

// converte i default aggiungendo displayDate se non c'è
const withDisplay = (list) =>
  list.map(d => ({
    ...d,
    displayDate:
      d.displayDate ||
      new Date(d.id).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }));

export default function Home() {
  // unica fonte dati: localStorage, inizializzato con i default
  const [itins, setItins] = useLocalStorage('itineraries_all', withDisplay(DEFAULTS));

  const addItinerary = (itin) => {
    if (itins.some(d => d.id === itin.id)) {
      alert('Esiste già un itinerario con questa data.');
      return;
    }
    // Append in coda
    setItins([...itins, itin]);
  };

  const deleteItinerary = (id) => {
    if (!confirm('Eliminare questo itinerario?')) return;
    setItins(itins.filter(i => i.id !== id));
  };

  return (
    <div className="container">
      <header className="top">
        <h1>I miei itinerari</h1>
      </header>

      <ItineraryForm onAdd={addItinerary} />

      <section className="grid">
        {itins.map(day => (
          <DayCard
            key={day.id}
            day={day}
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
