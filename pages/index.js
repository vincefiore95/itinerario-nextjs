// pages/index.js
import ItineraryForm from '../components/ItineraryForm';

async function saveAndShare({ clientName, clientEmail, title, dateId, destinations }) {
  // 1) crea/recupera cliente
  const r1 = await fetch('/api/clients', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ name: clientName, email: clientEmail })
  });
  const d1 = await r1.json();
  if (!r1.ok) throw new Error(d1.error || 'Errore creazione cliente');
  const client = d1.client;
  const clientShare = d1.shareUrl; // /share/client/<token>

  // 2) crea itinerario
  const r2 = await fetch(`/api/clients/${client.id}/itineraries`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ title, dateId })
  });
  const d2 = await r2.json();
  if (!r2.ok) throw new Error(d2.error || 'Errore creazione itinerario');
  const itinerary = d2.itinerary;
  const itineraryShare = d2.shareUrl; // /share/itinerary/<token>

  // 3) aggiungi destinazioni (se presenti)
  if (Array.isArray(destinations) && destinations.length) {
    const r3 = await fetch(`/api/itineraries/${itinerary.id}/destinations`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ destinations: destinations.map((d, i)=>({
        name: d.name, address: d.address, order_index: i
      })) })
    });
    const d3 = await r3.json();
    if (!r3.ok) throw new Error(d3.error || 'Errore aggiunta destinazioni');
  }

  return { clientShare, itineraryShare };
}


const withDisplay = (list) =>
  list.map(d => ({
    ...d,
    displayDate:
      d.displayDate ||
      new Date(d.id).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }));

export default function Home() {

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

      <style jsx>{`
        .home { grid-template-columns: 1fr; }
        @media (min-width: 560px) { .home { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (min-width: 900px) { .home { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; } }
        @media (min-width: 1200px) { .home { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
      `}</style>
    </div>
  );
}
