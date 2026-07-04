import { motion } from 'framer-motion';

const LEVEL_COLOR = {
  Low: '#35c17d',
  Moderate: '#e0a537',
  'Moderate-High': '#e0537a',
};

export default function StressGauge({ score = 0, level = 'Low', size = 160 }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const color = LEVEL_COLOR[level] || 'var(--accent)';

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--shadow-dark)" strokeWidth="12" />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          transform="rotate(-90 80 80)"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700 }}>
          {score}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{level}</span>
      </div>
    </div>
  );
}
