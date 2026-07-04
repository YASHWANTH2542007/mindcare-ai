/**
 * Calls the Anthropic API to generate personalized wellness recommendations
 * based on a student's check-in data. Falls back to rule-based recommendations
 * (see stressEngine.js) if the API call fails for any reason — so the app
 * stays usable even without connectivity or a valid key.
 */

const { fallbackRecommendations } = require('./stressEngine');

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

function buildPrompt({ mood, sleepHrs, studyLoad, energy, tags, note, stressScore, stressLevel }) {
  const tagList = tags.length ? tags.join(', ') : 'none specified';

  return `You are MindCare AI, a calm and supportive wellness assistant for college students.
A student just completed a mental health check-in. Here is their data:

- Mood: ${mood}
- Sleep last night: ${sleepHrs} hours
- Study load today (0-10): ${studyLoad}
- Energy level (0-10): ${energy}
- Stress triggers selected: ${tagList}
- Their own words: "${note || 'No additional notes provided.'}"
- Computed stress score: ${stressScore}/100 (${stressLevel})

Respond with ONLY valid JSON (no markdown fences, no preamble) in this exact shape:

{
  "summary": "A warm, 2-3 sentence message acknowledging what's going on and reassuring them, written in second person. Do not diagnose. Do not replace professional care — mention that briefly only if stress level is Moderate-High.",
  "cards": [
    { "icon": "single emoji", "title": "short action title", "description": "1-2 sentence actionable, specific tip", "category": "one of: sleep, study, mindfulness, social, professional" }
  ]
}

Generate 3 to 5 cards, prioritized by what would help most given their specific data (e.g. if sleep is low, lead with a sleep card; if stress score is above 65, include exactly one "professional" category card encouraging counselor support). Keep tone warm, concrete, and non-clinical. Never use the words "diagnose" or "disorder".`;
}

async function generateRecommendations(checkInData) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn('⚠️  ANTHROPIC_API_KEY not set — using rule-based fallback recommendations.');
    return { ...fallbackRecommendations(checkInData), source: 'fallback-rule-based', model: '' };
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        messages: [{ role: 'user', content: buildPrompt(checkInData) }],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`Anthropic API ${response.status}: ${errBody.slice(0, 200)}`);
    }

    const data = await response.json();
    const rawText = data?.content?.[0]?.text?.trim();

    if (!rawText) throw new Error('Empty response from Anthropic API');

    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
    const parsed = JSON.parse(cleaned);

    if (!parsed.summary || !Array.isArray(parsed.cards)) {
      throw new Error('Malformed JSON shape from LLM response');
    }

    return { summary: parsed.summary, cards: parsed.cards, source: 'llm', model: MODEL };
  } catch (err) {
    console.error('⚠️  LLM recommendation generation failed, using fallback:', err.message);
    return { ...fallbackRecommendations(checkInData), source: 'fallback-rule-based', model: '' };
  }
}

module.exports = { generateRecommendations };
