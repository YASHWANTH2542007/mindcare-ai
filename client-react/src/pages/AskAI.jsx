import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api.js';
import NeuCard from '../components/NeuCard.jsx';
import NeuButton from '../components/NeuButton.jsx';

export default function AskAI() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi, I'm MindCare AI. Ask me anything about stress, sleep, focus, or how you're feeling." },
  ]);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  async function handleSend(e) {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;

    setMessages((m) => [...m, { role: 'user', text: q }]);
    setQuestion('');
    setBusy(true);

    try {
      const res = await api.post('/ask', { question: q });
      setMessages((m) => [...m, { role: 'ai', text: res.data.answer }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'ai', text: "Sorry, I couldn't reach the AI service just now. Please try again." },
      ]);
    } finally {
      setBusy(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  return (
   <div className="page-padding" style={{ padding: '36px 40px', maxWidth: 780, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>Ask AI</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
        Free-form questions, answered with your latest check-in as context.
      </p>

      <NeuCard
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}
        pressed
      >
        <div className="scrollbar-thin" style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  background: m.role === 'user' ? 'linear-gradient(145deg, #786fff, #6058e8)' : 'var(--bg)',
                  color: m.role === 'user' ? '#fff' : 'var(--text)',
                  boxShadow: m.role === 'user' ? 'none' : 'var(--shadow-raised-sm)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 18px',
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {m.text}
              </motion.div>
            ))}
            {busy && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ alignSelf: 'flex-start', display: 'flex', gap: 4, padding: '12px 18px' }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSend} style={{ display: 'flex', gap: 10, padding: 16, borderTop: '1px solid var(--shadow-dark)' }}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about sleep, exam stress, focus…"
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'var(--bg)',
              boxShadow: 'var(--shadow-flat)',
              fontSize: 14,
            }}
          />
          <NeuButton type="submit" disabled={busy}>
            Send
          </NeuButton>
        </form>
      </NeuCard>
    </div>
  );
}
