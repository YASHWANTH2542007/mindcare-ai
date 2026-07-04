export default function NeuInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  name,
}) {
  return (
    <label style={{ display: 'block', marginBottom: 18 }}>
      {label && (
        <span
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-muted)',
            marginBottom: 8,
            fontFamily: 'var(--font-display)',
          }}
        >
          {label}
        </span>
      )}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '14px 18px',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          background: 'var(--bg)',
          boxShadow: 'var(--shadow-pressed)',
          fontSize: 15,
          color: 'var(--text)',
          fontFamily: 'var(--font-body)',
        }}
      />
    </label>
  );
}
