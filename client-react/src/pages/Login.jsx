import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import NeuCard from '../components/NeuCard.jsx';
import NeuInput from '../components/NeuInput.jsx';
import NeuButton from '../components/NeuButton.jsx';
import BrainPulse from '../components/BrainPulse.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong signing you in.');
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
        <BrainPulse />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, type: 'spring', stiffness: 120 }}
      >
        <NeuCard style={{ width: 380, maxWidth: '90vw' }}>
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
            Sign in to check in with your mind.
          </p>

          <form onSubmit={handleSubmit}>
            <NeuInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              required
            />
            <NeuInput
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 14 }}>{error}</p>
            )}

            <NeuButton type="submit" full disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </NeuButton>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
            New here?{' '}
            <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Create an account
            </Link>
          </p>
        </NeuCard>
      </motion.div>
    </div>
  );
}
