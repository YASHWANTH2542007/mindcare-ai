/**
 * Rule-based stress scoring.
 *
 * This runs on every check-in (cheap, deterministic, explainable) to produce
 * stressScore + stressLevel that get stored in PostgreSQL regardless of whether
 * the LLM call succeeds. The LLM is only used to generate the human-readable
 * recommendation text/cards — the score itself stays auditable and instant.
 */

const TAG_WEIGHTS = {
  exam: 18,
  sleep: 16,
  social: 10,
  financial: 14,
  burnout: 20,
  family: 12,
  positive: -22,
};

const MOOD_WEIGHT = { great: -25, good: -12, okay: 0, low: 14, stressed: 26 };

function computeStressScore({ mood, sleepHrs, studyLoad, energy, tags = [] }) {
  let score = 40; // baseline

  score += MOOD_WEIGHT[mood] ?? 0;
  score += Math.max(0, 7 - sleepHrs) * 4; // less sleep = more stress
  score += Math.max(0, studyLoad - 5) * 3; // high study load
  score += Math.max(0, 5 - energy) * 3; // low energy

  for (const tag of tags) {
    score += TAG_WEIGHTS[tag] ?? 0;
  }

  return Math.max(2, Math.min(98, Math.round(score)));
}

function classifyScore(score) {
  if (score <= 35) return 'Low';
  if (score <= 65) return 'Moderate';
  return 'Moderate-High';
}

/**
 * Fallback recommendation cards, used only if the LLM call fails.
 * Keeps the app usable end-to-end even without API connectivity.
 */
function fallbackRecommendations({ sleepHrs, tags = [], stressScore }) {
  const cards = [];

  if (sleepHrs < 6) {
    cards.push({
      icon: '😴',
      title: 'Fix your sleep schedule',
      description:
        'Aim for 7–8 hours tonight. Try the 4-7-8 breathing technique before bed and avoid screens 30 minutes beforehand.',
      category: 'sleep',
    });
  }

  cards.push({
    icon: '⏱️',
    title: 'Use the Pomodoro technique',
    description:
      'Study for 25 minutes, then rest for 5. After 4 rounds, take a longer 20-minute break — this prevents burnout.',
    category: 'study',
  });

  cards.push({
    icon: '🧘',
    title: '5-minute mindfulness exercise',
    description:
      'Try box breathing — inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 5 times to lower cortisol quickly.',
    category: 'mindfulness',
  });

  if (tags.includes('social') || stressScore > 50) {
    cards.push({
      icon: '👥',
      title: 'Talk to someone you trust',
      description:
        'Share what is going on with a friend or family member. Social connection meaningfully reduces perceived stress.',
      category: 'social',
    });
  }

  if (stressScore > 65) {
    cards.push({
      icon: '🤝',
      title: 'Consider counselor support',
      description:
        'If this feeling continues for more than a few days, a counselor can help. MindCare AI supports — it does not replace — professional care.',
      category: 'professional',
    });
  }

  return {
    summary:
      'Based on your check-in, here is a personalized action plan. These suggestions support — but do not replace — professional mental health care.',
    cards,
  };
}

module.exports = { computeStressScore, classifyScore, fallbackRecommendations };
