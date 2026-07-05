/**
 * Thin wrapper around Google's Gemini API (generativelanguage.googleapis.com).
 * Gemini has a real free tier (Google AI Studio), unlike Anthropic's API which
 * is pay-as-you-go only. Get a free key at https://aistudio.google.com/apikey
 */

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function endpoint(apiKey) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
}

/**
 * Sends a single-turn prompt to Gemini and returns the raw text response.
 * Throws on any failure (non-2xx, empty response, timeout) so callers can
 * fall back to their own rule-based logic.
 */
async function callGemini(prompt, { maxTokens = 500 } = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set');
  }

  const response = await fetch(endpoint(apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: maxTokens },
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`Gemini API ${response.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) throw new Error('Empty response from Gemini API');

  return { text, model: MODEL };
}

module.exports = { callGemini, MODEL };
