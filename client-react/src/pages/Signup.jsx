import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import NeuCard from '../components/NeuCard.jsx';
import NeuInput from '../components/NeuInput.jsx';
import NeuButton from '../components/NeuButton.jsx';
import BrainPulse from '../components/BrainPulse.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', institution: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      const serverError = err.response?.data?.error;
      setError(typeof serverError === 'string' ? serverError : 'Something went wrong creating your account.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <BrainPulse size={140} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, type: 'spring', stiffness: 120 }}
      >
        <NeuCard style={{ width: 400, maxWidth: '90vw' }}>
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Create your account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            Two minutes, then your first check-in.
          </p>

          <form onSubmit={handleSubmit}>
            <NeuInput label="Full name" value={form.name} onChange={update('name')} required />
            <NeuInput
              label="Email"
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="you@university.edu"
              required
            />
            <NeuInput
              label="Password"
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder="At least 8 characters"
              required
            />
            <NeuInput
              label="Institution (optional)"
              value={form.institution}
              onChange={update('institution')}
              placeholder="Your university"
            />

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 14 }}>{error}</p>
            )}

            <NeuButton type="submit" full disabled={busy}>
              {busy ? 'Creating account…' : 'Create account'}
            </NeuButton>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </NeuCard>
      </motion.div>
    </div>
  );
}
