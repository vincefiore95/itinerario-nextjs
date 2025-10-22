import { useEffect, useState } from 'react';
import Head from 'next/head';
import FormCard from '../../../components/FormCard';
import ReadonlyField from '../../../components/ReadonlyField';

export default function ClientShare({ token }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/share/client/${token}`);
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'Errore');
        setData(j);
      } catch (e) { setErr(e.message); }
    })();
  }, [token]);

  const client = data?.client;
  const items = data?.itineraries || [];

  return (
    <>
      <Head><title>Itinerari cliente</title></Head>
      <main className="container" style={{ display:'grid', gap:12 }}>
        {!data && !err && <div className="card" style={{ padding: 16 }}>Caricamento…</div>}
        {err && <div className="card" style={{ padding: 16 }}>Errore: {err}</div>}

        {client && (
          <FormCard
            title="Cliente"
            subtitle="Dati condivisi"
            right={client.email ? <a className="btn" href={`mailto:${client.email}`}>Contatta</a> : null}
          >
            <ReadonlyField label="Nome" value={client.name || ''} />
            <ReadonlyField label="Email" value={client.email || ''} />
          </FormCard>
        )}

        <section className="card" style={{ padding: 16 }}>
          <h2 className="h2" style={{ marginTop: 0, marginBottom: 12 }}>Itinerari</h2>
          {!items.length && <div className="muted">Nessun itinerario.</div>}

          <div className="grid">
            {items.map(it => (
              <FormCard
                key={it.id}
                title={it.title || '(senza titolo)'}
                subtitle={it.date_id ? new Date(it.date_id).toLocaleDateString('it-IT') : undefined}
                right={it.share_token ? (
                  <a className="btn" href={`/share/itinerary/${it.share_token}`} target="_blank" rel="noreferrer">Apri</a>
                ) : null}
              >
                {(it.destinations || []).slice(0,3).map(d => (
                  <ReadonlyField key={d.id} label={d.name} value={d.address || ''} />
                ))}
                {(it.destinations || []).length > 3 && (
                  <div className="muted">+{it.destinations.length - 3} altre…</div>
                )}
              </FormCard>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
ClientShare.getInitialProps = ({ query }) => ({ token: query.token });
