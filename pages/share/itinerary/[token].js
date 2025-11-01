import { useEffect, useState } from 'react';
import Head from 'next/head';
import FormCard from '../../../components/FormCard';
import ReadonlyField from '../../../components/ReadonlyField';

export default function ItineraryShare({ token }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/share/itinerary/${token}`);
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'Errore');
        if (j?.itinerary?.destinations?.length) {
          j.itinerary.destinations = [...j.itinerary.destinations].sort((a,b)=> (a.order_index ?? 0)-(b.order_index ?? 0));
        }
        setData(j);
      } catch (e) { setErr(e.message); }
    })();
  }, [token]);

  const it = data?.itinerary;

  return (
    <>
      <Head><title>{it?.title || 'Itinerario'}</title></Head>
      <main className="container" style={{ display:'grid', gap:12 }}>
        {!data && !err && <div className="card" style={{ padding: 16 }}>Caricamento…</div>}
        {err && <div className="card" style={{ padding: 16 }}>Errore: {err}</div>}

        {it && (
          <>
            <header className="card" style={{padding:16, display:'grid', gap:8}}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontSize:22}}>🧭</span>
                <h1 className="h1" style={{margin:0}}>{it.title || 'Itinerario'}</h1>
              </div>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                {it.date_id && <span className="chip">{new Date(it.date_id).toLocaleDateString('it-IT')}</span>}
              </div>
              <p className="muted" style={{margin:0}}>Condiviso dalla tua agenzia.</p>
            </header>

            <FormCard title="Dettagli">
              <div className="grid-two" style={{ gap: 16 }}>
                <ReadonlyField
                  variant="underline"
                  label="Cliente"
                  value={it.client.name}
                />
                <ReadonlyField
                  variant="underline"
                  label="Email"
                  value={it.client.email}
                />
              </div>
              {/* Inizio + Fine sulla stessa riga */}
              <div className="grid-two" style={{ gap: 16, marginTop: 20 }}>
                <ReadonlyField
                  variant="underline"
                  label="Inizio"
                  value={it.start_date ? new Date(it.start_date).toLocaleDateString('it-IT') : '' 
                  }
                />
                <ReadonlyField
                  variant="underline"
                  label="Fine"
                  value={it.end_date ? new Date(it.end_date).toLocaleDateString('it-IT') : ''}
                />
              </div>
            </FormCard>

            <section className="card" style={{ padding: 16 }}>
              <h2 className="h2" style={{ marginTop: 0, marginBottom: 12 }}>Cosa vedrai oggi</h2>
              <div className="grid">
                {(it.destinations || []).length === 0 && (
                  <div className="muted">Nessuna destinazione.</div>
                )}
                {(it.destinations || []).map(d => (
                  <div key={d.id} className="card" style={{ padding: 12, display:'grid', gap:6 }}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
                      <div style={{fontWeight:700}}>{d.name}</div>
                      {d.address && (
                        <a className="btn" target="_blank" rel="noreferrer"
                           href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.address)}`}>
                          Apri in Maps
                        </a>
                      )}
                    </div>
                    {d.address && <div className="muted">{d.address}</div>}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
ItineraryShare.getInitialProps = ({ query }) => ({ token: query.token });
