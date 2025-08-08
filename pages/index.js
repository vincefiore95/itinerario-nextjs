import { itineraries } from '../data/itineraries';
import DayCard from '../components/DayCard';

export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>I miei itinerari</h1>
      <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        {itineraries.map(day => (
          <DayCard key={day.id} day={day} />
        ))}
      </div>
    </div>
  );
}
