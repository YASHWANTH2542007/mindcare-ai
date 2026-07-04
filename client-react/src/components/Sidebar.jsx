import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '◱' },
  { to: '/checkin', label: 'Mood Check-In', icon: '◈' },
  { to: '/ask', label: 'Ask AI', icon: '✦' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        width: 240,
        minHeight: '100vh',
        padding: '32px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        position: 'sticky',
        top: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 30 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: 'linear-gradient(145deg, #786fff, #6058e8)',
            boxShadow: 'var(--shadow-flat)',
          }}
        />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
          MindCare
        </span>
      </div>

      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '13px 16px',
            borderRadius: 'var(--radius-sm)',
            textDecoration: 'none',
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: 14,
            fontFamily: 'var(--font-display)',
            boxShadow: isActive ? 'var(--shadow-pressed)' : 'none',
            transition: 'box-shadow 0.2s ease, color 0.2s ease',
          })}
        >
          <span style={{ fontSize: 16 }}>{link.icon}</span>
          {link.label}
        </NavLink>
      ))}

      <div style={{ flex: 1 }} />

      <div style={{ padding: '0 8px', marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.email}</p>
      </div>

      <button
        onClick={logout}
        style={{
          border: 'none',
          background: 'var(--bg)',
          boxShadow: 'var(--shadow-raised-sm)',
          borderRadius: 'var(--radius-sm)',
          padding: '11px 16px',
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 13,
          color: 'var(--danger)',
          cursor: 'pointer',
        }}
      >
        Sign out
      </button>
    </motion.aside>
  );
}
