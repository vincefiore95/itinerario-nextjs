export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <style jsx global>{`
  /* =============== TOKENS BASE =============== */
  :root{
    /* colori UI */
    --bg:#f7f8fb; --card:#ffffff; --text:#0f172a; --muted:#64748b; --border:#e2e8f0;

    /* brand travel */
    --brand:#ffb703; --brand-700:#f7a600; --accent:#219ebc;

    /* layout & type */
    --radius:12px; --radius-xl:16px;
    --shadow-soft:0 6px 24px rgba(16,24,40,.06);
    --fs-base:clamp(14px,1.5vw,16px);
    --fs-h1:clamp(22px,3.6vw,34px);
    --fs-h2:clamp(18px,2.6vw,22px);

    /* spacing responsive */
    --container-pad:clamp(14px,4vw,28px);
    --panel: var(--card);
    --ring: var(--accent);
    --shadow: var(--shadow-soft);
    --primary: var(--brand);
    --primary-press: var(--brand-700);
  }
  @media (prefers-color-scheme: dark){
    :root{ --bg:#0b0f14; --card:#0f141b; --text:#e6edf3; --muted:#93a4b7; --border:#1e293b; }
  }

  /* =============== RESET LEGGERO =============== */
  *{box-sizing:border-box}
  html,body{margin:0;padding:0}
  body{
    background:var(--bg); color:var(--text);
    font:400 var(--fs-base)/1.45 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
  }
  a{color:inherit; text-decoration:none}

  /* =============== PRIMITIVE UI =============== */
  .container{max-width:1100px; margin:0 auto; padding:16px var(--container-pad);}
  .card{background:var(--card); border:1px solid var(--border); border-radius:var(--radius-xl); box-shadow:var(--shadow-soft);}
  .grid{display:grid; gap:12px;}

  .h1{font-size:var(--fs-h1); margin:0;}
  .h2{font-size:var(--fs-h2); margin:0;}
  .label{font-weight:600; color:var(--text); margin-bottom:6px; display:block;}
  .muted{color:var(--muted)}

  .btn{
    display:inline-flex; align-items:center; justify-content:center;
    height:44px; padding:0 16px; border-radius:10px;
    border:1px solid var(--border); background:var(--card); cursor:pointer; font-weight:600;
    min-height:44px;
  }
  .btn:hover{filter:brightness(.98)}
  .btn.primary{ background:var(--brand); border-color:var(--brand); color:#111; }
  .btn.primary:hover{ background:var(--brand-700); border-color:var(--brand-700); }

  .input{
    height:44px; width:100%; padding:0 12px;
    border-radius:10px; border:1.5px solid var(--border); background:transparent; color:inherit;
    transition: box-shadow .2s ease, border-color .2s ease;
  }
  .input:focus{ outline:none; border-color:var(--accent); box-shadow:0 0 0 3px rgba(33,158,188,.15); }

  /* =============== LAYOUT E SEZIONI =============== */
  .appbar{
    display:flex; align-items:center; justify-content:space-between; gap:10px;
    padding:12px 16px; background:linear-gradient(90deg,#fff,#fff,#f9fcff);
    border-radius:var(--radius-xl);
  }
  @media (max-width:640px){ .appbar{ flex-direction:column; align-items:flex-start; } }

  .section{ background:#fff; border-radius:var(--radius-xl); padding:16px; }
  .section + .section{ margin-top:8px; }

  .sand{ background:linear-gradient(135deg,#fff,#fff8ec); border:1px dashed #ffe7bf; }

  .chips{ display:flex; gap:8px; flex-wrap:wrap; }
  .chip{ padding:4px 10px; border-radius:999px; background:#eef6ff; font-weight:600; }

  .actions{ display:flex; justify-content:flex-end; gap:8px; }
  @media (max-width:640px){
    .actions{ position:sticky; bottom:calc(env(safe-area-inset-bottom,0) + 8px); z-index:50; }
    .actions .btn{ width:100%; }
  }

  .grid-two{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  @media (max-width:640px){ .grid-two{ grid-template-columns:1fr; } }

  .error{ color:#b91c1c; margin-top:6px; font-size:.95rem; }

  /* =============== TABELLA LIST VIEW =============== */
  .table{ width:100%; border-collapse:collapse; }
  .table th, .table td{ padding:10px 12px; border-bottom:1px solid var(--border); }
  .table th{ text-align:left; font-weight:700; color:var(--muted); }
  .row:hover{ background:rgba(33,158,188,.04); }

  /* =============== MODAL =============== */
  .modal-overlay{
    position:fixed; inset:0; background:rgba(15,23,42,.45);
    display:grid; place-items:center; z-index:1000; padding:16px;
  }
  .modal-card{
    width:100%; max-width:720px; background:#fff; border-radius:16px;
    box-shadow:0 20px 60px rgba(16,24,40,.2); overflow:hidden; animation:modalIn .18s ease-out both;
  }
  .modal-header{ display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid var(--border); }
  .modal-body{ padding:16px; }
  .modal-footer{ padding:12px 16px; border-top:1px solid var(--border); display:flex; gap:8px; justify-content:flex-end; }
  @keyframes modalIn{ from{ transform:translateY(8px); opacity:0 } to{ transform:none; opacity:1 } }

  /* =============== CARDS SPECIALI =============== */
  .dashed{ border:2px dashed #ffe7bf; border-radius:12px; background:linear-gradient(135deg,#fff,#fff8ec); }

  /* =============== READONLY MODERN =============== */
  .ro{ display:grid; gap:4px; }
  .ro-label{ font-weight:600; }
  .ro-outline, .ro-underline{ padding:10px 12px; color:inherit; background:#fff; }
  .ro-outline{ border-radius:10px; border:1.5px solid var(--border); box-shadow:0 1px 2px rgba(0,0,0,.03); }
  .ro-underline{
    border:none; border-bottom:2px solid var(--border); border-radius:0;
    padding-left:0; padding-right:0; background:transparent;
  }

  /* stato disabled uniforme */
.btn[disabled]{
  opacity:.55;
  cursor:not-allowed;
  filter:saturate(.2) brightness(.96);
  box-shadow:none;
}

/* anche i primary diventano “spenti” quando disabled */
.btn.primary[disabled]{
  background: var(--brand-700);
  border-color: var(--brand-700);
}

/* spinner minimal che usa currentColor */
.spinner{
  width:16px; height:16px;
  border:2px solid currentColor;
  border-right-color: transparent;
  border-radius:50%;
  display:inline-block;
  vertical-align:middle;
  animation: spin .6s linear infinite;
  margin-right:8px;
}
@keyframes spin{ to { transform: rotate(360deg); } }

*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0; color:var(--text); background:var(--bg);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

.page{
  min-height:100vh; padding:28px;
}
.shell{
  max-width:980px; margin:0 auto;
}

.header{
  display:flex; align-items:center; justify-content:space-between;
  background:var(--panel); border:1px solid var(--border);
  border-radius:var(--radius); padding:14px 18px; box-shadow:var(--shadow);
}
.header h1{font-size:18px; margin:0; display:flex; align-items:center; gap:10px}
.badge{
  width:28px; height:28px; border-radius:8px;
  display:inline-grid; place-items:center;
  background:linear-gradient(135deg,#60a5fa 0%,#34d399 100%);
  color:white; font-weight:700;
}

.card{
  margin-top:18px; background:var(--panel); border:1px solid var(--border);
  border-radius:var(--radius); box-shadow:var(--shadow); padding:22px;
}

.form{max-width:520px}
.row{display:flex; flex-direction:column; gap:8px; margin-bottom:14px}
.label{font-size:14px; color:#374151}
.input{
  width:100%; padding:12px 14px; border:1px solid var(--border); background:#fff;
  border-radius:12px; outline:none; font-size:15px;
  transition:border-color .15s, box-shadow .15s;
}
.input:focus{
  border-color:var(--ring);
  box-shadow:0 0 0 4px rgba(59,130,246,.12);
}
.hint{font-size:12px; color:var(--muted)}

.actions{display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:2px}
.link{font-size:13px; color:#2563eb; text-decoration:none}
.link:hover{text-decoration:underline}

.btn{
  display:inline-flex; align-items:center; justify-content:center;
  gap:8px; padding:10px 14px; border-radius:12px; border:1px solid #111827;
  background:#111827; color:#fff; font-weight:600; cursor:pointer;
  transition:transform .02s ease, opacity .15s;
}
.btn:active{transform:translateY(1px)}
.btn:disabled{opacity:.65; cursor:not-allowed}

.btn-primary{
  background:var(--primary); border-color:var(--primary-press); color:#111827;
}
.btn-primary:active{background:var(--primary-press)}

.alert{
  border:1px solid #fecaca; background:#fef2f2; color:#991b1b;
  padding:10px 12px; border-radius:12px; font-size:14px; margin-bottom:12px;
}

@media (max-width:640px){
  .page{padding:18px}
  .header{padding:12px 14px}
}
`}</style>
    </>
  );
}
