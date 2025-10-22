// pages/admin/index.js
import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Modal from '../../components/Modal';

const isRequired = (v)=>!!(v && String(v).trim());
const validEmail = (v)=> /^\S+@\S+\.\S+$/.test(v || '');

const normalizeDate = (v) => {
  if (!v) return v;
  // se è già YYYY-MM-DD la lasciamo così
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  if (isNaN(d)) return v;
  const pad = (n)=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
};

// 🔁 creazione: usa /api/admin/itineraries con snake_case sicuro
async function saveItinerary({ clientName, clientEmail, title, startDate, endDate }) {
  const r = await fetch('/api/admin/itineraries', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      client: { client_name: clientName || null, client_email: clientEmail },      // email obbligatoria
      itinerary: {
        title,
        start_date: normalizeDate(startDate), // << snake_case garantito
        end_date:   normalizeDate(endDate)    // << snake_case garantito
      }
    })
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || 'Errore creazione itinerario');
  return j.itinerary; // { id, title, start_date, end_date, ... }
}

export default function AdminPage() {
  const router = useRouter();

  // FILTRI
  const [q, setQ] = useState('');
  const [fName, setFName] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fTitle, setFTitle] = useState('');
  const [fStartFrom, setFStartFrom] = useState('');
  const [fStartTo, setFStartTo] = useState('');
  const [fEndFrom, setFEndFrom] = useState('');
  const [fEndTo, setFEndTo] = useState('');

  // LISTA
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(new Set());
  const selected = useMemo(()=>Array.from(sel),[sel]);

  // MODALE NUOVO
  const [open, setOpen] = useState(false);
  const [clientName, setClientName]   = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [title, setTitle]             = useState('');
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [touched, setTouched]         = useState({});
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState(null);

  const invalid = {
    clientEmail: !isRequired(clientEmail) || !validEmail(clientEmail),
    title: !isRequired(title),
    startDate: !isRequired(startDate),
    endDate: !isRequired(endDate) || (startDate && endDate && new Date(startDate) > new Date(endDate)),
  };

  const fetchList = async ()=>{
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (fName) params.set('name', fName);
    if (fEmail) params.set('email', fEmail);
    if (fTitle) params.set('title', fTitle);
    if (fStartFrom) params.set('startFrom', fStartFrom);
    if (fStartTo) params.set('startTo', fStartTo);
    if (fEndFrom) params.set('endFrom', fEndFrom);
    if (fEndTo) params.set('endTo', fEndTo);
    const r = await fetch(`/api/admin/itineraries?${params.toString()}`);
    const j = await r.json(); setLoading(false);
    if (!r.ok) return alert(j.error || 'Errore caricamento');
    setRows(j.itineraries || []); setSel(new Set());
  };

  useEffect(()=>{ fetchList(); }, []);
  useEffect(()=>{
    const t = setTimeout(fetchList, 250);
    return ()=> clearTimeout(t);
  }, [q,fName,fEmail,fTitle,fStartFrom,fStartTo,fEndFrom,fEndTo]);

  const toggle = (id)=> setSel(prev=>{ const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  const toggleAll = ()=> setSel(sel.size===rows.length? new Set() : new Set(rows.map(r=>r.id)));

  const confirmDelete = async ()=>{
    if (selected.length===0) return;
    const preview = rows.filter(r=>sel.has(r.id)).slice(0,3).map(r=>`${r.title||'(senza titolo)'} — ${r.client?.email||'—'}`).join('\n');
    const ok = window.confirm(`Eliminare ${selected.length} itinerario/i?\n\n${preview}${selected.length>3?'\n…':''}\n\nOperazione definitiva.`);
    if (!ok) return;
    const r = await fetch('/api/admin/itineraries', {
      method:'DELETE', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ids: selected })
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error || 'Errore eliminazione');
    fetchList();
  };

  const resetModal = ()=>{
    setClientName(''); setClientEmail(''); setTitle(''); setStartDate(''); setEndDate('');
    setTouched({}); setError(null);
  };

  const createNew = async (e)=>{
    e.preventDefault();
    setError(null);
    if (invalid.clientEmail || invalid.title || invalid.startDate || invalid.endDate) {
      setTouched({ clientEmail:true, title:true, startDate:true, endDate:true });
      return;
    }
    try{
      setSaving(true);
      const it = await saveItinerary({ clientName, clientEmail, title, startDate, endDate });
      setOpen(false); resetModal();
      router.push(`/admin/itineraries/${it.id}`); // → editor destinazioni
    }catch(err){
      setError(err.message || String(err));
    }finally{
      setSaving(false);
    }
  };

  const formatItDate = (v) => {
    if (!v) return '—';
    const d = typeof v === 'string' ? new Date(v) : v;
    return d.toLocaleDateString('it-IT'); // -> gg/mm/aaaa
  };

  return (
    <>
      <Head><title>Admin — Itinerari</title></Head>

      <main className="container" style={{display:'grid', gap:12}}>
        {/* APPBAR */}
        <header className="appbar card">
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:22}}>🗺️</span>
            <strong>Agenzia — Itinerari</strong>
          </div>
          <div style={{display:'flex', gap:8}}>
            {sel.size>0 && <button className="btn" onClick={confirmDelete}>Elimina ({sel.size})</button>}
            <button className="btn primary" onClick={()=>{ setOpen(true); }}>Nuovo</button>
          </div>
        </header>

        {/* FILTRI */}
        <section className="card" style={{padding:16, display:'grid', gap:10}}>
          <div>
            <label className="label">Ricerca veloce</label>
            <input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Cerca su titolo, cliente, email…" />
          </div>
        </section>

        {/* LISTA */}
        <section className="card" style={{padding:0}}>
          <table className="table">
            <thead>
              <tr>
                <th style={{width:48}}><input type="checkbox" checked={sel.size>0 && sel.size===rows.length} onChange={toggleAll} aria-label="Seleziona tutti" /></th>
                <th>Titolo</th><th>Cliente</th><th>Email</th><th>Inizio</th><th>Fine</th><th style={{width:110}}>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="7" style={{padding:16}}>Caricamento…</td></tr>}
              {!loading && rows.length===0 && <tr><td colSpan="7" style={{padding:16}} className="muted">Nessun itinerario</td></tr>}
              {rows.map(r=>(
                <tr className="row" key={r.id}>
                  <td><input type="checkbox" checked={sel.has(r.id)} onChange={()=>toggle(r.id)} /></td>
                  <td>{r.title || <span className="muted">(senza titolo)</span>}</td>
                  <td>{r.client?.name || <span className="muted">—</span>}</td>
                  <td>{r.client?.email || <span className="muted">—</span>}</td>
                  <td>{formatItDate(r.start_date)}</td>
                  <td>{formatItDate(r.end_date)}</td>
                  <td style={{display:'flex', gap:8}}>
                    <a className="btn" href={`/admin/itineraries/${r.id}`}>Apri</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* MODALE NUOVO */}
        {open && (
          <Modal
            title="Nuovo itinerario"
            onClose={()=>{ setOpen(false); resetModal(); }}
            footer={
              <>
                <button className="btn" onClick={()=>{ setOpen(false); resetModal(); }} disabled={saving}>Annulla</button>
                <button className="btn primary" type="submit" form="new-itinerary-form" disabled={saving}>
                  {saving ? 'Creazione…' : 'Crea itinerario'}
                </button>
              </>
            }
          >
            <form id="new-itinerary-form" onSubmit={createNew}>
              {/* Errore creazione */}
              {error && (
                <div className="card" style={{padding:10, marginBottom:10, borderColor:'#fecaca', background:'#fff1f2'}}>
                  <strong style={{color:'#b91c1c'}}>Errore:</strong> <span style={{color:'#7f1d1d'}}>{error}</span>
                </div>
              )}

              {/* Card Cliente */}
              <section className="dashed" style={{padding:12, marginBottom:12}}>
                <div className="grid-two">
                  <div>
                    <label className="label">Nome cliente</label>
                    <input
                      className="input"
                      value={clientName}
                      onChange={e=>setClientName(e.target.value)}
                      placeholder="Mario Rossi"
                      autoComplete="name"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="label">Email cliente <span style={{color:'#b91c1c'}}>*</span></label>
                    <input
                      className="input" type="email" autoComplete="email"
                      value={clientEmail} placeholder="mario.rossi@example.com"
                      onChange={e=>setClientEmail(e.target.value)}
                      onBlur={()=>setTouched(p=>({...p, clientEmail:true}))}
                      style={touched.clientEmail && invalid.clientEmail ? { borderColor:'#fca5a5' } : {}}
                      disabled={saving}
                    />
                    {touched.clientEmail && invalid.clientEmail && (
                      <div className="error">{!clientEmail?.trim() ? 'Email obbligatoria' : 'Email non valida'}</div>
                    )}
                  </div>
                </div>
              </section>

              {/* Card Itinerario */}
              <section className="dashed" style={{padding:12}}>
                <div className="grid" style={{gap:12}}>
                  <div>
                    <label className="label">Titolo <span style={{color:'#b91c1c'}}>*</span></label>
                    <input
                      className="input"
                      value={title}
                      onChange={e=>setTitle(e.target.value)}
                      onBlur={()=>setTouched(p=>({...p, title:true}))}
                      style={touched.title && invalid.title ? { borderColor:'#fca5a5' } : {}}
                      placeholder="Tour Roma 2 giorni"
                      disabled={saving}
                    />
                    {touched.title && invalid.title && <div className="error">Inserisci un titolo</div>}
                  </div>

                  <div className="grid-two">
                    <div>
                      <label className="label">Data inizio <span style={{color:'#b91c1c'}}>*</span></label>
                      <input
                        className="input" type="date"
                        value={startDate}
                        onChange={e=>setStartDate(e.target.value)}
                        onBlur={()=>setTouched(p=>({...p, startDate:true}))}
                        style={touched.startDate && invalid.startDate ? { borderColor:'#fca5a5' } : {}}
                        placeholder="YYYY-MM-DD"
                        disabled={saving}
                      />
                      {touched.startDate && invalid.startDate && <div className="error">Inserisci la data di inizio</div>}
                    </div>
                    <div>
                      <label className="label">Data fine <span style={{color:'#b91c1c'}}>*</span></label>
                      <input
                        className="input" type="date"
                        value={endDate}
                        onChange={e=>setEndDate(e.target.value)}
                        onBlur={()=>setTouched(p=>({...p, endDate:true}))}
                        style={touched.endDate && invalid.endDate ? { borderColor:'#fca5a5' } : {}}
                        placeholder="YYYY-MM-DD"
                        disabled={saving}
                      />
                      {touched.endDate && invalid.endDate && (
                        <div className="error">{endDate?.trim() ? 'La fine non può precedere l’inizio' : 'Inserisci la data di fine'}</div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </form>
          </Modal>
        )}
      </main>
    </>
  );
}
