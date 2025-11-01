// pages/share/client/[token].js
import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import FormCard from '../../../components/FormCard';
import ReadonlyField from '../../../components/ReadonlyField';

const fmtIT = (v) => (v ? new Date(v).toLocaleDateString('it-IT') : '—');

export default function ClientShare() {
  const router = useRouter();
  const { token } = router.query;

  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  // carica quando il token è presente
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setLoading(true);
        const r = await fetch(`/api/share/client/${token}`);
        const text = await r.text();
        let j; try { j = JSON.parse(text); } catch { throw new Error(text || 'Risposta non valida'); }
        if (!r.ok) throw new Error(j.error || 'Errore');
        setData(j);
        setErr(null);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const client = data?.client || null;

  // ordina gli itinerari (start_date DESC, poi created_at)
  const items = useMemo(() => {
    const arr = (data?.itineraries || []).slice();
    arr.sort((a, b) => {
      const as = a.start_date ||  '';
      const bs = b.start_date ||  '';
      if (as > bs) return -1;
      if (as < bs) return 1;
      return (b.created_at || '').localeCompare(a.created_at || '');
    });
    return arr;
  }, [data]);

  return (
    <>
      <Head>
        <title>Itinerari cliente</title>
        <meta name="robots" content="noindex" />
      </Head>

      <main className="container" style={{ display:'grid', gap:12 }}>
        {/* Header */}
        <header className="appbar card">
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <span style={{fontSize:22}}>👤</span>
            <strong>Itinerari cliente</strong>
          </div>
          {client && (
            <div className="chips">
              {client.name && <span className="chip">{client.name}</span>}
              {client.email && <span className="chip">{client.email}</span>}
            </div>
          )}
        </header>

        {loading && <div className="card" style={{ padding: 16 }}>Caricamento…</div>}
        {err && !loading && <div className="card" style={{ padding: 16, color:'#b91c1c' }}>Errore: {err}</div>}

        {client && !loading && !err && (
          <FormCard
            title="Cliente"
            subtitle="Dati condivisi"
            right={client.email ? <a className="btn" href={`mailto:${client.email}`}>Contatta</a> : null}
          >
            <ReadonlyField label="Nome" value={client.name || ''} />
            <ReadonlyField label="Email" value={client.email || ''} />
          </FormCard>
        )}

        {!loading && !err && (
          <section className="card" style={{ padding: 16 }}>
            <h2 className="h2" style={{ marginTop: 0, marginBottom: 12 }}>Itinerari</h2>
            {items.length === 0 && <div className="muted">Nessun itinerario.</div>}

            <div className="grid" style={{gap:12}}>
              {items.map(it => {
                // sottotitolo: range date (dd/MM/yyyy)
                const sub = (it.start_date  || it.end_date)
                  ? [fmtIT(it.start_date), fmtIT(it.end_date)].filter(Boolean).join(' → ')
                  : undefined;
                const preview = (it.destinations || []).slice(0, 3);

                return (
                  <FormCard
                    key={it.id}
                    title={it.title || '(senza titolo)'}
                    subtitle={sub}
                    right={it.share_token ? (
                      <a className="btn" href={`/share/itinerary/${it.share_token}`} target="_blank" rel="noreferrer">Apri</a>
                    ) : null}
                  >
                    {preview.length === 0 && (
                      <div className="muted">Nessuna destinazione.</div>
                    )}

                    {preview.map(d => (
                      <ReadonlyField
                        key={d.id}
                        label={d.name}
                        value={[
                          d.address || null,
                          d.visit_date ? `📅 ${fmtIT(d.visit_date)}` : null,
                          d.arrival_time ? `🕘 ${d.arrival_time}` : null,
                          d.departure_time ? `↘︎ ${d.departure_time}` : null
                        ].filter(Boolean).join(' · ')}
                      />
                    ))}

                    {(it.destinations || []).length > 3 && (
                      <div className="muted">+{it.destinations.length - 3} altre…</div>
                    )}
                  </FormCard>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
