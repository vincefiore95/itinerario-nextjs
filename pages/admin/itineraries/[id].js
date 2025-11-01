// pages/admin/itineraries/[id].js
import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import FormCard from '../../../components/FormCard';
import ReadonlyField from '../../../components/ReadonlyField';

export default function ItineraryEditor() {
  const router = useRouter();
  const { id } = router.query;

  const [it, setIt] = useState(null);
  const [err, setErr] = useState(null);

  // ---- EDIT MODE (itinerario) ----
  const [editing, setEditing] = useState(false);
  const [fTitle, setFTitle] = useState('');
  const [fStart, setFStart] = useState('');
  const [fEnd, setFEnd] = useState('');
  const [busy, setBusy] = useState(false);
  const requiredMissing = !fTitle.trim() || !fStart || !fEnd;
  const dateOrderInvalid = fStart && fEnd && new Date(fStart) > new Date(fEnd);
  const changed =
    it && (fTitle.trim() !== (it.title || '') || fStart !== (it.start_date || '') || fEnd !== (it.end_date || ''));
  const canSaveIt = editing && changed && !requiredMissing && !dateOrderInvalid && !busy;

  // ---- FORM "aggiungi destinazione" (una alla volta) ----
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);

  const invalid = { name: !name.trim(), visitDate: !visitDate.trim() };
  const canSaveDest = !invalid.name && !invalid.visitDate && !saving;

  // --- BULK INLINE EDIT DESTINATIONS ---
  const [bulkEdit, setBulkEdit] = useState(false);        // true = inline edit attivo per le righe selezionate
  const [editMap, setEditMap] = useState({});             // { id: {name,address,visit_date,arrival_time,departure_time} }
  const [bulkSaving, setBulkSaving] = useState(false);

  const enterBulkEdit = () => {
  const map = {};
  (it?.destinations || []).forEach(d => {
    if (sel.has(d.id)) {
      map[d.id] = {
        name: d.name || '',
        address: d.address || '',
        visit_date: toDateInput(d.visit_date),     // <-- qui
        arrival_time: d.arrival_time || '',
        departure_time: d.departure_time || '',
      };
    }
  });
  setEditMap(map);
  setBulkEdit(true);
};

  const cancelBulkEdit = () => {
    setBulkEdit(false);
    setEditMap({});
  };

  // validazione: name + visit_date obbligatori per TUTTE le righe in edit
  const bulkInvalid = Object.values(editMap).some(v => !v?.name?.trim() || !v?.visit_date?.trim());

  // true se non è cambiato nulla
  const bulkUnchanged = Object.entries(editMap).every(([id, v]) => {
    const orig = (it?.destinations || []).find(d => d.id === id);
    if (!orig) return true;
    return (
      (v.name || '') === (orig.name || '') &&
      (v.address || '') === (orig.address || '') &&
      (v.visit_date || '') === (orig.visit_date || '') &&
      (v.arrival_time || '') === (orig.arrival_time || '') &&
      (v.departure_time || '') === (orig.departure_time || '')
    );
  });


  // ---- Selezione multipla elenco esistente ----
  const [sel, setSel] = useState(new Set());
  const selectedIds = useMemo(() => Array.from(sel), [sel]);
  const hasRows = (it?.destinations?.length || 0) > 0;

  const toggle = (rowId) => setSel(prev => {
    const n = new Set(prev);
    n.has(rowId) ? n.delete(rowId) : n.add(rowId);
    return n;
  });
  const toggleAll = () => {
    if (!hasRows) return;
    if (sel.size === it.destinations.length) setSel(new Set());
    else setSel(new Set(it.destinations.map(d => d.id)));
  };

  // ---- Load itinerario ----
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const r = await fetch(`/api/admin/itineraries/${id}`);
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'Errore');
        j.itinerary.destinations = (j.itinerary.destinations || []).sort(
          (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
        );
        setIt(j.itinerary);
        // prefilla i campi edit
        setFTitle(j.itinerary.title || '');
        setFStart(j.itinerary.start_date || '');
        setFEnd(j.itinerary.end_date || '');
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [id]);

  const formatDateIT = (v) => (v ? new Date(v).toLocaleDateString('it-IT') : '—');

  // ---- Salva una destinazione ----
 const saveOne = async () => {
  if (!canSaveDest) { setTouched({ name: true, visitDate: true }); return; }

  const targetId = it?.id ?? id;
  if (!targetId || String(targetId).trim() === '' || String(targetId).toLowerCase() === 'undefined') {
    alert('ID itinerario non pronto: ricarica la pagina o attendi che i dettagli siano caricati.');
    return;
  }

    setSaving(true);
    try {
      const baseIndex = it?.destinations?.length || 0;
      const r = await fetch(`/api/itineraries/${targetId}/destinations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: {
            name: name.trim(),
            address: address.trim() || null,
            visit_date: visitDate.trim(),
            arrival_time: arrivalTime.trim() || null,
            departure_time: departureTime.trim() || null,
            base_index: baseIndex
          }
        })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Errore salvataggio');

      const added = j.destinations || [];
      setIt(prev => ({
        ...prev,
        destinations: [...(prev.destinations || []), ...added].sort(
          (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
        )
      }));

      setName(''); setAddress(''); setVisitDate(''); setArrivalTime(''); setDepartureTime('');
      setTouched({}); setShowForm(false);
    } catch (e) {
      alert(e.message || 'Errore');
    } finally {
      setSaving(false);
    }
  };

  // ---- Elimina selezionate ----
  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const ok = window.confirm(`Eliminare ${selectedIds.length} destinazione/i? L’operazione è definitiva.`);
    if (!ok) return;

    const targetId = it?.id ?? id;
    if (!targetId || String(targetId).trim()==='' || String(targetId).toLowerCase()==='undefined') {
      alert('ID itinerario non pronto'); return;
    }

    const r = await fetch(`/api/itineraries/${targetId}/destinations`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds })
    });
    const j = await r.json();
    if (!r.ok) { alert(j.error || 'Errore eliminazione'); return; }
    setSel(new Set());
    setIt(prev => ({ ...prev, destinations: (prev.destinations || []).filter(d => !selectedIds.includes(d.id)) }));
  };

  // ---- Salva modifiche itinerario ----
  const saveItinerary = async () => {
    if (!canSaveIt) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/itineraries/${it.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: fTitle.trim(), start_date: fStart, end_date: fEnd })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Errore aggiornamento');
      setIt(prev => ({ ...prev, title: j.itinerary.title, start_date: j.itinerary.start_date, end_date: j.itinerary.end_date }));
      setEditing(false);
    } catch (e) {
      alert(e.message || 'Errore');
    } finally {
      setBusy(false);
    }
  };

  const cancelEdit = () => {
    if (!it) return;
    setFTitle(it.title || '');
    setFStart(it.start_date || '');
    setFEnd(it.end_date || '');
    setEditing(false);
  };

  async function saveBulk() {
  if (bulkInvalid || bulkUnchanged) return;
  setBulkSaving(true);
  try {
    // salviamo solo le righe selezionate (quelle effettivamente in edit)
    const ids = selectedIds.filter(id => editMap[id]);

    // PUT in parallelo per ogni destinazione selezionata
    const results = await Promise.all(ids.map(async (destId) => {
      const payload = editMap[destId];
      const r = await fetch(`/api/itineraries/${id}/destinations/${destId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: (payload.name || '').trim(),
          address: (payload.address || '').trim() || null,
          visit_date: payload.visit_date,
          arrival_time: payload.arrival_time || null,
          departure_time: payload.departure_time || null
        })
      });
      const text = await r.text();
      let j; try { j = JSON.parse(text); } catch { throw new Error(text || 'Risposta non JSON'); }
      if (!r.ok) throw new Error(j.error || 'Errore aggiornamento');
      return j.destination; // record aggiornato
    }));

    // aggiorna lo stato con i record ritornati
    setIt(prev => ({
      ...prev,
      destinations: (prev.destinations || [])
        .map(d => {
          const updated = results.find(x => x.id === d.id);
          return updated ? updated : d;
        })
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    }));

    // ✅ deseleziona SOLO le righe appena salvate
    setSel(prev => {
      const n = new Set(prev);
      ids.forEach(x => n.delete(x));
      return n;
    });

    // esci dalla modalità inline edit
    cancelBulkEdit();
  } catch (e) {
    alert(e.message || 'Errore durante il salvataggio');
  } finally {
    setBulkSaving(false);
  }
}

// Converte qualsiasi valore data in stringa compatibile con <input type="date">: YYYY-MM-DD
const toDateInput = (v) => {
  if (!v) return '';
  // se è già YYYY-MM-DD, lascio così
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  if (isNaN(d)) return '';
  // evito problemi di timezone normalizzando all'UTC "puro"
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

// Solo per visualizzazione in read-only (dd/mm/yyyy)
const toDisplayIT = (v) => (v ? new Date(v).toLocaleDateString('it-IT') : '—');

  return (
    <>
      <Head><title>Editor Itinerario</title></Head>
      <main className="container" style={{ display: 'grid', gap: 12 }}>
        {/* Top bar */}
        <header className="appbar card">
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <span style={{fontSize:22}}>🧭</span>
            <strong>Editor itinerario</strong>
          </div>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            <a className="btn" href="/admin">← Torna agli itinerari</a>
            {it && (
              <a className="btn" href={`/share/itinerary/${it.share_token}`} target="_blank" rel="noreferrer">
                Apri pagina cliente
              </a>
            )}
          </div>
        </header>

        {err && <div className="card" style={{ padding: 16 }}>Errore: {err}</div>}
        {!it && !err && <div className="card" style={{ padding: 16 }}>Caricamento…</div>}

        {it && (
          <>
            {/* DETTAGLI */}
            <FormCard
              title="Itinerario"
              right={
                <span className="muted" style={{whiteSpace:'nowrap'}}>
                  Data di creazione: {new Date(it.created_at).toLocaleDateString('it-IT')}
                </span>
              }
            >
              <div className="grid-two" style={{ gap: 16, marginTop: 8 }}>
                {/* Titolo */}
                {!editing ? (
                  <ReadonlyField label="Titolo" value={it.title || ''} variant="underline" />
                ) : (
                  <div>
                    <label className="label">Titolo <span style={{color:'#b91c1c'}}>*</span></label>
                    <input className="input" value={fTitle} onChange={e=>setFTitle(e.target.value)} placeholder="Titolo itinerario" disabled={busy} />
                  </div>
                )}

                {/* Cliente (sempre read-only) */}
                <ReadonlyField
                  label="Cliente"
                  value={[it.client?.name || '', it.client?.email ? `(${it.client.email})` : ''].filter(Boolean).join(' ')}
                  variant="underline"
                />

                {/* Inizio */}
                {!editing ? (
                  <ReadonlyField label="Inizio" value={formatDateIT(it.start_date)} variant="underline" />
                ) : (
                  <div>
                    <label className="label">Inizio <span style={{color:'#b91c1c'}}>*</span></label>
                    <input className="input" type="date" value={fStart} onChange={e=>setFStart(e.target.value)} disabled={busy} />
                  </div>
                )}

                {/* Fine */}
                {!editing ? (
                  <ReadonlyField label="Fine" value={formatDateIT(it.end_date)} variant="underline" />
                ) : (
                  <div>
                    <label className="label">Fine <span style={{color:'#b91c1c'}}>*</span></label>
                    <input className="input" type="date" value={fEnd} onChange={e=>setFEnd(e.target.value)} disabled={busy} />
                    {dateOrderInvalid && <div className="error">La data di fine non può essere antecedente all’inizio.</div>}
                  </div>
                )}
              </div>

              <div style={{ height: 16 }} />

              {/* Azioni in basso a destra */}
              <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
                {!editing ? (
                  <button className="btn primary" onClick={()=>setEditing(true)}>Modifica</button>
                ) : (
                  <>
                    <button className="btn" onClick={cancelEdit} disabled={busy}>Annulla</button>
                    <button className="btn primary" disabled={!canSaveIt} onClick={saveItinerary}>
                      {busy ? (<><span className="spinner" />Salvataggio…</>) : 'Salva'}
                    </button>
                  </>
                )}
              </div>
            </FormCard>

            {/* ---------- Aggiungi destinazione (una alla volta) ---------- */}
            <section className="card" style={{padding:16, display:'grid', gap:12}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h2 className="h2" style={{margin:0}}>Aggiungi destinazione</h2>
                {!showForm && (
                  <button className="btn" onClick={()=>setShowForm(true)} disabled={!it?.id}>+ Aggiungi destinazione</button>
                )}
              </div>

              {showForm && (
                <div className="card" style={{padding:12, display:'grid', gap:12}}>
                  <div>
                    <label className="label">Nome <span style={{color:'#b91c1c'}}>*</span></label>
                    <input
                      className="input"
                      value={name}
                      onChange={e=>setName(e.target.value)}
                      onBlur={()=>setTouched(p=>({...p, name:true}))}
                      style={touched.name && invalid.name ? { borderColor:'#fca5a5' } : {}}
                      placeholder="Colosseo"
                      required
                      disabled={saving}
                    />
                    {touched.name && invalid.name && <div className="error">Il nome è obbligatorio</div>}
                  </div>

                  <div>
                    <label className="label">Indirizzo</label>
                    <input className="input" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Piazza del Colosseo, Roma" disabled={saving} />
                  </div>

                  <div className="grid-two">
                    <div>
                      <label className="label">Data <span style={{color:'#b91c1c'}}>*</span></label>
                      <input
                        className="input" type="date"
                        value={visitDate}
                        onChange={e=>setVisitDate(e.target.value)}
                        onBlur={()=>setTouched(p=>({...p, visitDate:true}))}
                        required
                        style={touched.visitDate && invalid.visitDate ? { borderColor:'#fca5a5' } : {}}
                        disabled={saving}
                      />
                      {touched.visitDate && invalid.visitDate && <div className="error">La data è obbligatoria</div>}
                    </div>
                    <div className="grid-two">
                      <div>
                        <label className="label">Ora arrivo</label>
                        <input className="input" type="time" value={arrivalTime} onChange={e=>setArrivalTime(e.target.value)} disabled={saving} />
                      </div>
                      <div>
                        <label className="label">Ora partenza</label>
                        <input className="input" type="time" value={departureTime} onChange={e=>setDepartureTime(e.target.value)} disabled={saving} />
                      </div>
                    </div>
                  </div>

                  <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
                    <button
                      className="btn"
                      onClick={()=>{
                        setShowForm(false); setTouched({});
                        setName(''); setAddress(''); setVisitDate(''); setArrivalTime(''); setDepartureTime('');
                      }}
                      disabled={saving}
                    >
                      Annulla
                    </button>
                    <button className="btn primary" disabled={!canSaveDest} onClick={saveOne}>
                      {saving ? (<><span className="spinner" />Salvataggio…</>) : 'Salva destinazione'}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* ---------- Destinazioni esistenti ---------- */}
            <section className="card" style={{padding:16}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                <h2 className="h2" style={{margin:0}}>Destinazioni esistenti</h2>

                {/* Azioni contestuali */}
                {hasRows && selectedIds.length > 0 && !bulkEdit && (
                  <div style={{display:'flex', gap:8}}>
                    <button className="btn" onClick={enterBulkEdit}>Modifica ({selectedIds.length})</button>
                    <button className="btn" onClick={deleteSelected}>Elimina ({selectedIds.length})</button>
                  </div>
                )}

                {/* Azioni durante l'inline edit */}
                {bulkEdit && (
                  <div style={{display:'flex', gap:8}}>
                    <button className="btn" onClick={cancelBulkEdit} disabled={bulkSaving}>Annulla</button>
                    <button
                      className="btn primary"
                      onClick={saveBulk}
                      disabled={bulkSaving || bulkInvalid || bulkUnchanged}
                    >
                      {bulkSaving ? 'Salvataggio…' : 'Salva modifiche'}
                    </button>
                  </div>
                )}
              </div>


              <table className="table" style={{width:'100%'}}>
                <thead>
                  <tr>
                    {hasRows && (
                      <th style={{width:48}}>
                        <input
                          type="checkbox"
                          checked={sel.size>0 && sel.size===it.destinations.length}
                          onChange={toggleAll}
                          aria-label="Seleziona tutte"
                        />
                      </th>
                    )}
                    <th>Nome</th>
                    <th>Indirizzo</th>
                    <th>Data</th>
                    <th>Arrivo</th>
                    <th>Partenza</th>
                  </tr>
                </thead>
                <tbody>
                  {!hasRows ? (
                    <tr>
                      <td colSpan={6} className="muted" style={{padding:12}}>
                        Nessuna destinazione ancora.
                      </td>
                    </tr>
                  ) : (
                    it.destinations.map(d=>(
                      <tr key={d.id} className="row">
                        {/* Checkbox selezione (sempre visibile) */}
                        <td>
                          <input
                            type="checkbox"
                            checked={sel.has(d.id)}
                            onChange={()=>toggle(d.id)}
                            disabled={bulkSaving}
                          />
                        </td>

                        {/* Nome */}
                        <td style={{fontWeight:600}}>
                          {bulkEdit && sel.has(d.id) ? (
                            <input
                              className="input"
                              value={editMap[d.id]?.name || ''}
                              onChange={e=> setEditMap(m => ({...m, [d.id]: {...m[d.id], name: e.target.value} })) }
                              placeholder="Nome destinazione"
                            />
                          ) : (
                            d.name
                          )}
                        </td>

                        {/* Indirizzo */}
                        <td>
                          {bulkEdit && sel.has(d.id) ? (
                            <input
                              className="input"
                              value={editMap[d.id]?.address || ''}
                              onChange={e=> setEditMap(m => ({...m, [d.id]: {...m[d.id], address: e.target.value} })) }
                              placeholder="Indirizzo"
                            />
                          ) : (
                            d.address || <span className="muted">—</span>
                          )}
                        </td>

                        {/* Data */}
                       <td>
                          {bulkEdit && sel.has(d.id) ? (
                            <input
                              className="input"
                              type="date"
                              value={editMap[d.id]?.visit_date || ''}                // <-- YYYY-MM-DD
                              onChange={e =>
                                setEditMap(m => ({ ...m, [d.id]: { ...m[d.id], visit_date: e.target.value } }))
                              }
                            />
                          ) : (
                            toDisplayIT(d.visit_date) || <span className="muted">—</span>
                          )}
                        </td>

                        {/* Arrivo */}
                        <td>
                          {bulkEdit && sel.has(d.id) ? (
                            <input
                              className="input" type="time"
                              value={editMap[d.id]?.arrival_time || ''}
                              onChange={e=> setEditMap(m => ({...m, [d.id]: {...m[d.id], arrival_time: e.target.value} })) }
                            />
                          ) : (
                            d.arrival_time || <span className="muted">—</span>
                          )}
                        </td>

                        {/* Partenza */}
                        <td>
                          {bulkEdit && sel.has(d.id) ? (
                            <input
                              className="input" type="time"
                              value={editMap[d.id]?.departure_time || ''}
                              onChange={e=> setEditMap(m => ({...m, [d.id]: {...m[d.id], departure_time: e.target.value} })) }
                            />
                          ) : (
                            d.departure_time || <span className="muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>
    </>
  );
}
