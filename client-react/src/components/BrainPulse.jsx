import { motion } from 'framer-motion';

// The signature visual: a brain-like glyph at the center with concentric
// rings pulsing outward like a heartbeat/EEG. Communicates "a living system
// monitoring your mind" rather than a static logo.
export default function BrainPulse({ size = 180 }) {
  const rings = [0, 1, 2];

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} viewBox="0 0 200 200">
        {rings.map((i) => (
          <motion.circle
            key={i}
            cx="100"
            cy="100"
            r="40"
            fill="none"
            stroke="#6C63FF"
            strokeWidth="2"
            initial={{ r: 40, opacity: 0.6 }}
            animate={{ r: [40, 95], opacity: [0.55, 0] }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              ease: 'easeOut',
              delay: i * 0.85,
            }}
          />
        ))}

        <motion.g
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '100px 100px' }}
        >
          <circle cx="100" cy="100" r="38" fill="#6C63FF" />
          <path
            d="M84 92 Q88 78 100 80 Q112 78 116 92 Q124 96 120 106 Q124 116 114 120 Q110 128 100 124 Q90 128 86 120 Q76 116 80 106 Q76 96 84 92Z"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <path
            d="M100 80 L100 124 M84 92 Q92 100 100 96 Q108 100 116 92 M80 106 Q92 110 100 104 Q108 110 120 106"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.7"
          />
        </motion.g>
      </svg>
    </div>
  );
}
