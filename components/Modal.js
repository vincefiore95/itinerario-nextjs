export default function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <section className="modal-card">
        <header className="modal-header">
          <strong>{title}</strong>
          <button className="btn" onClick={onClose} aria-label="Chiudi">Chiudi</button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </section>
    </div>
  );
}
