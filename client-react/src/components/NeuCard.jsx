import { motion } from 'framer-motion';

export default function NeuCard({ children, style = {}, pressed = false, ...rest }) {
  return (
    <motion.div
      style={{
        background: 'var(--bg)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: pressed ? 'var(--shadow-pressed)' : 'var(--shadow-raised)',
        padding: 28,
        ...style,
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
