import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { useState, useMemo } from 'react';

export default function AgencyLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const canSubmit = useMemo(() => email.trim() && password.length >= 6, [email, password]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true); setErr(null);

    // 1) login client-side
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setErr(error.message); setLoading(false); return; }

    // 2) sincronizza i cookie httpOnly via API route
    const { session } = data;
    const syncRes = await fetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: session?.access_token,
        refresh_token: session?.refresh_token,
      }),
    });

    if (!syncRes.ok) {
      const body = await syncRes.json().catch(() => ({}));
      setErr(body?.error || 'Impossibile sincronizzare la sessione');
      setLoading(false);
      return;
    }

    // 3) redirect: ora i cookie httpOnly sono impostati
    const to = router.query.from || '/admin';
    router.push(to);
  }



  return (
    <div
      className="container"
      style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', paddingTop: 24, paddingBottom: 24 }}
    >
      {/* Unica CARD: header + form */}
      <div className="card" style={{ width: '100%', maxWidth: 720, padding: 22 }}>
        {/* Header compatto della card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span
            aria-hidden
            style={{
              width: 32, height: 32, borderRadius: 10,
              display: 'inline-grid', placeItems: 'center',
              background: 'linear-gradient(135deg,#60a5fa 0%,#34d399 100%)',
              color: '#fff', fontWeight: 700
            }}
          >
            A
          </span>
          <div>
            <h1 className="h1" style={{ margin: 0 }}>Agenzia — Accesso</h1>
            <p className="muted" style={{ margin: 0, marginTop: 2 }}>
              Accedi per creare e gestire gli itinerari dei tuoi clienti.
            </p>
          </div>
        </div>

        {/* Divider leggero */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '14px 0' }} />

        {/* Form */}
        {err && <div className="error" role="alert">{err}</div>}

        <form onSubmit={onSubmit} className="grid" style={{ gap: 12 }}>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              placeholder="es. nome@agenzia.it"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                className="input"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: 110 }}
              />
              <button
                type="button"
                className="btn"
                onClick={() => setShowPwd(s => !s)}
                aria-pressed={showPwd}
                style={{
                  position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                  height: 36, padding: '0 12px'
                }}
                title={showPwd ? 'Nascondi password' : 'Mostra password'}
              >
                {showPwd ? 'Nascondi' : 'Mostra'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" /> Ricordami
            </label>
            <a className="muted" href="#" onClick={(e) => e.preventDefault()}>
              Password dimenticata?
            </a>
          </div>

          <div className="actions" style={{ marginTop: 6, justifyContent: 'flex-start' }}>
            <button className="btn primary" disabled={loading || !canSubmit}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Accesso…' : 'Entra'}
            </button>
          </div>

          <p className="muted" style={{ margin: 0, fontSize: '0.95rem' }}>
            Premendo “Entra” accetti i termini del servizio e la privacy policy.
          </p>
        </form>
      </div>
    </div>
  );
}
