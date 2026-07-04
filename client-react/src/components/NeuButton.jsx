import { motion } from 'framer-motion';

export default function NeuButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  full = false,
  style = {},
}) {
  const base = {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: 15,
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: '14px 28px',
    width: full ? '100%' : 'auto',
    opacity: disabled ? 0.55 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...style,
  };

  const variants = {
    primary: {
      background: 'linear-gradient(145deg, #786fff, #6058e8)',
      color: '#fff',
      boxShadow: '6px 6px 14px var(--shadow-dark), -2px -2px 8px var(--shadow-light)',
    },
    neutral: {
      background: 'var(--bg)',
      color: 'var(--text)',
      boxShadow: 'var(--shadow-raised)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)',
      boxShadow: 'none',
    },
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant] }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.button>
  );
}
