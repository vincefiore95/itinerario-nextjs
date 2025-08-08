import Link from 'next/link';

export default function DayCard({ day }) {
  return (
    <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
      <h2>{day.title}</h2>
      <p>{day.id}</p>
      <p>{day.destinations.length} destinazioni</p>
      <Link href={`/day/${day.id}`}>Vedi dettagli</Link>
    </div>
  );
}
