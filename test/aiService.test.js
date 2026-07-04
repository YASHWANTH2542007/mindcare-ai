delete process.env.ANTHROPIC_API_KEY; // simulate no key configured
const assert = require('assert');
const { generateRecommendations } = require('../server/services/aiService');

console.log('=== Testing aiService.js fallback behavior ===\n');

(async () => {
  const result = await generateRecommendations({
    mood: 'okay', sleepHrs: 4, studyLoad: 8, energy: 3,
    tags: ['exam', 'sleep', 'burnout'], note: 'feeling overwhelmed',
    stressScore: 98, stressLevel: 'Moderate-High',
  });

  console.log('Result source:', result.source);
  assert.strictEqual(result.source, 'fallback-rule-based');
  assert.ok(result.summary.length > 0, 'Should have a summary');
  assert.ok(Array.isArray(result.cards) && result.cards.length > 0, 'Should have cards');
  console.log('✅ PASS — falls back to rule-based when no API key is set');
  console.log('   Summary:', result.summary.slice(0, 80) + '...');
  console.log('   Cards:', result.cards.map(c => c.title).join(', '));

  console.log('\n=== aiService fallback test passed ===');
})();
