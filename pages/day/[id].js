import { useRouter } from 'next/router';
import { itineraries } from '../../data/itineraries';
import DestinationItem from '../../components/DestinationItem';

export default function DayDetails() {
  const router = useRouter();
  const { id } = router.query;
  const itinerary = itineraries.find(day => day.id === id);

  if (!itinerary) return <p style={{ padding: '20px' }}>Itinerario non trovato</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>{itinerary.title} - {itinerary.id}</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {itinerary.destinations.map((dest, index) => (
          <DestinationItem key={index} dest={dest} />
        ))}
      </ul>
    </div>
  );
}
