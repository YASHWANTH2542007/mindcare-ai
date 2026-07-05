import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import NeuCard from '../components/NeuCard.jsx';
import NeuButton from '../components/NeuButton.jsx';
import StressGauge from '../components/StressGauge.jsx';

const MOOD_EMOJI = { great: '😄', good: '🙂', okay: '😐', low: '😕', stressed: '😣' };

export default function Dashboard() {
  const { user } = useAuth();
  const [recent, setRecent] = useState([]);
  const [latest, setLatest] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/checkins/recent'), api.get('/checkins/latest')])
      .then(([recentRes, latestRes]) => {
        setRecent([...recentRes.data.checkIns].reverse());
        setLatest(latestRes.data.checkIn);
        setRecommendation(latestRes.data.recommendation);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = recent.map((c) => ({
    date: new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    stress: c.stressScore,
  }));

  return (
    <div className="page-padding" style={{ padding: '36px 40px', maxWidth: 1100 }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Hey {user?.name?.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
          Here's how your mind has been trending.
        </p>
      </motion.div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard…</p>
      ) : !latest ? (
        <NeuCard>
          <h3 style={{ marginBottom: 8 }}>No check-ins yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            Do your first mood check-in to get personalized AI recommendations.
          </p>
          <Link to="/checkin">
            <NeuButton>Start check-in →</NeuButton>
          </Link>
        </NeuCard>
      ) : (
        <div className="dashboard-grid">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 140 }}
          >
            <NeuCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <p style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: 13 }}>
                Current stress level
              </p>
              <StressGauge score={latest.stressScore} level={latest.stressLevel} />
              <p style={{ fontSize: 30 }}>{MOOD_EMOJI[latest.mood]}</p>
            </NeuCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <NeuCard style={{ height: '100%' }}>
              <h3 style={{ marginBottom: 16 }}>7-day trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="var(--shadow-dark)" strokeDasharray="4 4" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="stress"
                    stroke="#6C63FF"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#6C63FF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </NeuCard>
          </motion.div>

          {recommendation && (
            <motion.div
              style={{ gridColumn: '1 / -1' }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <NeuCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3>Your latest AI recommendations</h3>
                  <Link to="/checkin" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                    New check-in →
                  </Link>
                </div>
                <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{recommendation.summary}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  {recommendation.cards.map((card, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.03 }}
                      style={{
                        background: 'var(--bg)',
                        boxShadow: 'var(--shadow-raised-sm)',
                        borderRadius: 'var(--radius-md)',
                        padding: 18,
                      }}
                    >
                      <div style={{ fontSize: 26, marginBottom: 8 }}>{card.icon}</div>
                      <p style={{ fontWeight: 700, marginBottom: 6 }}>{card.title}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{card.description}</p>
                    </motion.div>
                  ))}
                </div>
              </NeuCard>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
