// pages/index.js
import DayCard from '../components/DayCard';
import { itineraries as DEFAULTS } from '../data/itineraries';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ItineraryForm from '../components/ItineraryForm';

const withDisplay = (list) =>
  list.map(d => ({
    ...d,
    displayDate:
      d.displayDate ||
      new Date(d.id).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }));

export default function Home() {
  // unica fonte: localStorage inizializzato coi default
  const [itins, setItins] = useLocalStorage('itineraries_all', withDisplay(DEFAULTS));

  const addItinerary = (itin) => {
    if (itins.some(d => d.id === itin.id)) {
      alert('Esiste già un itinerario con questa data.');
      return;
    }
    // nuovi in coda
    setItins([...itins, itin]);
  };

  const deleteItinerary = (id) => {
    if (!confirm('Eliminare questo itinerario?')) return;
    setItins(itins.filter(i => i.id !== id));
  };

  return (
    <div className="container">
      <header style={{margin:'6px 0 14px'}}>
        <h1 className="h1" style={{margin:0}}>I miei itinerari</h1>
      </header>

      {/* Form di creazione — già coerente con i token globali */}
      <ItineraryForm onAdd={addItinerary} />

      <section className="grid home">
        {itins.map(day => (
          <DayCard key={day.id} day={day} onDelete={() => deleteItinerary(day.id)} />
        ))}
      </section>

      <style jsx>{`
        .home { grid-template-columns: 1fr; }
        @media (min-width: 560px) { .home { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (min-width: 900px) { .home { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; } }
        @media (min-width: 1200px) { .home { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
      `}</style>
    </div>
  );
}
