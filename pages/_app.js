export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <style jsx global>{`
        :root{
          --bg:#f7f8fb;
          --card:#ffffff;
          --text:#0f172a;
          --muted:#64748b;
          --border:#e2e8f0;
          --brand:#f7b500;
          --radius:12px;

          /* scala tipografica fluida ma contenuta */
          --fs-base: clamp(14px, 1.5vw, 16px);
          --fs-h1: clamp(22px, 3.6vw, 34px);
          --fs-h2: clamp(18px, 2.6vw, 22px);
        }
        @media (prefers-color-scheme: dark){
          :root{
            --bg:#0b0f14; --card:#0f141b; --text:#e6edf3; --muted:#93a4b7; --border:#1e293b;
          }
        }

        /* reset leggero */
        *{box-sizing:border-box}
        html,body{margin:0;padding:0}
        body{
          background:var(--bg); color:var(--text);
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
          font-size: var(--fs-base);
          -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
        }
        a{color:inherit; text-decoration:none}
        .container{max-width:1100px; margin:0 auto; padding:16px clamp(16px,4vw,28px);}

        /* componenti base coerenti */
        .card{background:var(--card); border:1px solid var(--border); border-radius:var(--radius); box-shadow:0 1px 2px rgba(0,0,0,.04);}
        .grid{display:grid; gap:12px;}
        .btn{display:inline-flex; align-items:center; justify-content:center; height:44px; padding:0 16px; border-radius:10px; border:1px solid var(--border); background:var(--card); cursor:pointer; font-weight:600;}
        .btn.primary{background:var(--brand); border-color:var(--brand); color:#111;}
        .btn.ghost{background:transparent;}
        .btn:hover{filter:brightness(.98)}
        .input{height:44px; padding:0 12px; border-radius:10px; border:1px solid var(--border); background:transparent; color:inherit; width:100%;}
        .label{font-size:.95rem; color:var(--muted); margin-bottom:6px; display:block;}
        .h1{font-size:var(--fs-h1); margin:0;}
        .h2{font-size:var(--fs-h2); margin:0;}
        .muted{color:var(--muted)}
      `}</style>
    </>
  );
}
