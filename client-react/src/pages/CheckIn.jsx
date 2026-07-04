import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api.js';
import NeuCard from '../components/NeuCard.jsx';
import NeuButton from '../components/NeuButton.jsx';
import StressGauge from '../components/StressGauge.jsx';

const MOODS = [
  { value: 'great', emoji: '😄', label: 'Great' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'low', emoji: '😕', label: 'Low' },
  { value: 'stressed', emoji: '😣', label: 'Stressed' },
];

const TAGS = ['exam', 'sleep', 'social', 'financial', 'burnout', 'family', 'positive'];

export default function CheckIn() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = form, 2 = result
  const [mood, setMood] = useState(null);
  const [sleepHrs, setSleepHrs] = useState(7);
  const [studyLoad, setStudyLoad] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [tags, setTags] = useState([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  function toggleTag(tag) {
    setTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]));
  }

  async function handleAnalyze() {
    if (!mood) {
      setError('Pick a mood first.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const res = await api.post('/checkins', {
        mood,
        sleepHrs: Number(sleepHrs),
        studyLoad: Number(studyLoad),
        energy: Number(energy),
        tags,
        note,
      });
      setResult(res.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong analyzing your check-in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: '36px 40px', maxWidth: 900 }}>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>Mood check-in</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
        A few quick questions, then MindCare AI gives you a plan.
      </p>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <NeuCard>
              <p style={{ fontWeight: 600, marginBottom: 14, fontFamily: 'var(--font-display)' }}>
                How are you feeling?
              </p>
              <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                {MOODS.map((m) => (
                  <motion.button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(m.value)}
                    whileTap={{ scale: 0.92 }}
                    whileHover={{ scale: 1.05 }}
                    style={{
                      border: 'none',
                      background: 'var(--bg)',
                      boxShadow: mood === m.value ? 'var(--shadow-pressed)' : 'var(--shadow-raised-sm)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px 18px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      minWidth: 84,
                    }}
                  >
                    <span style={{ fontSize: 28 }}>{m.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: mood === m.value ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {m.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              <SliderRow label="Hours of sleep last night" value={sleepHrs} setValue={setSleepHrs} min={0} max={12} step={0.5} />
              <SliderRow label="Study / workload (0–10)" value={studyLoad} setValue={setStudyLoad} min={0} max={10} step={1} />
              <SliderRow label="Energy level (0–10)" value={energy} setValue={setEnergy} min={0} max={10} step={1} />

              <p style={{ fontWeight: 600, margin: '20px 0 10px', fontFamily: 'var(--font-display)', fontSize: 14 }}>
                What's contributing? (optional)
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      border: 'none',
                      borderRadius: 999,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: tags.includes(tag) ? 'var(--accent)' : 'var(--bg)',
                      color: tags.includes(tag) ? '#fff' : 'var(--text-muted)',
                      boxShadow: tags.includes(tag) ? 'none' : 'var(--shadow-flat)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <label style={{ display: 'block', marginBottom: 20 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Anything you want to add? (optional)
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="What's on your mind..."
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: 'var(--bg)',
                    boxShadow: 'var(--shadow-pressed)',
                    fontSize: 14,
                    color: 'var(--text)',
                    fontFamily: 'var(--font-body)',
                    resize: 'vertical',
                  }}
                />
              </label>

              {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 14 }}>{error}</p>}

              <NeuButton onClick={handleAnalyze} disabled={busy} full>
                {busy ? 'Analyzing…' : 'Analyze my mood with AI →'}
              </NeuButton>
            </NeuCard>
          </motion.div>
        )}

        {step === 2 && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <NeuCard style={{ marginBottom: 20, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <StressGauge score={result.checkIn.stressScore} level={result.checkIn.stressLevel} size={130} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <h3 style={{ marginBottom: 8 }}>Here's your plan</h3>
                <p style={{ color: 'var(--text-muted)' }}>{result.recommendation.summary}</p>
              </div>
            </NeuCard>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
              {result.recommendation.cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.03 }}
                  style={{
                    background: 'var(--bg)',
                    boxShadow: 'var(--shadow-raised-sm)',
                    borderRadius: 'var(--radius-md)',
                    padding: 20,
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
                  <p style={{ fontWeight: 700, marginBottom: 6 }}>{card.title}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{card.description}</p>
                </motion.div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <NeuButton variant="neutral" onClick={() => navigate('/dashboard')}>
                Go to dashboard
              </NeuButton>
              <NeuButton
                variant="ghost"
                onClick={() => {
                  setStep(1);
                  setMood(null);
                  setResult(null);
                }}
              >
                New check-in
              </NeuButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SliderRow({ label, value, setValue, min, max, step }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
          {label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ width: '100%', accentColor: '#6C63FF' }}
      />
    </div>
  );
}
