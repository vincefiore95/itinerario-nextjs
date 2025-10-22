export default function FormCard({ title, subtitle, right, children }) {
  return (
    <section className="card" style={{ padding: 16 }}>
      <header className="formcard-header">
        <div>
          <h2 className="h2" style={{ margin: 0 }}>{title}</h2>
          {subtitle ? <div className="muted" style={{ marginTop: 4 }}>{subtitle}</div> : null}
        </div>
        {right ? <div className="formcard-right">{right}</div> : null}
      </header>

      {/* spacer più generoso */}
      <div style={{ height: 16 }} />
      {children}

      <style jsx>{`
        .formcard-header{
          display:flex; align-items:flex-start; justify-content:space-between; gap:12px;
        }
        .formcard-right{
          text-align:right; white-space:nowrap; color:var(--muted); font-weight:600;
        }
        @media (max-width:640px){
          .formcard-header{ flex-direction:column; align-items:flex-start; }
          .formcard-right{ text-align:left; white-space:normal; }
        }
      `}</style>
    </section>
  );
}
