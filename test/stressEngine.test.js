const { computeStressScore, classifyScore, fallbackRecommendations } = require('../server/services/stressEngine');
const assert = require('assert');

console.log('=== Testing stressEngine.js ===\n');

// Test 1: matches the demo scenario from earlier (4hrs sleep, high study, low energy, exam/sleep/burnout tags)
const score1 = computeStressScore({
  mood: 'okay', sleepHrs: 4, studyLoad: 8, energy: 3,
  tags: ['exam', 'sleep', 'burnout'],
});
console.log('Test 1 — demo scenario score:', score1);
assert.strictEqual(score1, 98, `Expected 98, got ${score1}`);
assert.strictEqual(classifyScore(score1), 'Moderate-High');
console.log('✅ PASS — matches expected 98/100, Moderate-High\n');

// Test 2: a well-rested, positive student should score low
const score2 = computeStressScore({
  mood: 'great', sleepHrs: 8, studyLoad: 3, energy: 9,
  tags: ['positive'],
});
console.log('Test 2 — healthy scenario score:', score2);
assert.ok(score2 <= 35, `Expected Low range (<=35), got ${score2}`);
assert.strictEqual(classifyScore(score2), 'Low');
console.log('✅ PASS — healthy scenario classifies as Low\n');

// Test 3: score is always clamped between 2 and 98
const extreme = computeStressScore({
  mood: 'stressed', sleepHrs: 0, studyLoad: 10, energy: 0,
  tags: ['exam', 'sleep', 'social', 'financial', 'burnout', 'family'],
});
console.log('Test 3 — extreme worst-case score:', extreme);
assert.ok(extreme <= 98 && extreme >= 2, `Score out of bounds: ${extreme}`);
console.log('✅ PASS — score properly clamped\n');

// Test 4: fallback recommendations include sleep card when sleep < 6
const fb1 = fallbackRecommendations({ sleepHrs: 4, tags: ['exam'], stressScore: 70 });
assert.ok(fb1.cards.some(c => c.category === 'sleep'), 'Expected sleep card');
assert.ok(fb1.cards.some(c => c.category === 'professional'), 'Expected professional card at score 70');
console.log('Test 4 — fallback cards:', fb1.cards.map(c => c.category).join(', '));
console.log('✅ PASS — fallback includes sleep + professional cards correctly\n');

// Test 5: fallback does NOT include professional card for low stress
const fb2 = fallbackRecommendations({ sleepHrs: 8, tags: ['positive'], stressScore: 20 });
assert.ok(!fb2.cards.some(c => c.category === 'professional'), 'Should not suggest counselor at low stress');
console.log('Test 5 — low-stress fallback cards:', fb2.cards.map(c => c.category).join(', '));
console.log('✅ PASS — no professional card at low stress\n');

console.log('=== All stressEngine tests passed ===');
