// components/ReadonlyField.js
export default function ReadonlyField({
  label,
  value,
  placeholder = '—',
  variant = 'outline', // 'outline' | 'underline'
}) {
  const display = (value ?? '') === '' ? placeholder : value;

  return (
    <div className="ro">
      {label && <label className="ro-label">{label}</label>}
      <div className={variant === 'underline' ? 'ro-underline' : 'ro-outline'}>
        {display}
      </div>
    </div>
  );
}
