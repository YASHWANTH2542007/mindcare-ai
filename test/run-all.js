/**
 * Simple test runner — no DB required.
 * Runs the logic/unit tests for the stress engine, auth, middleware, and AI fallback.
 *
 * Run with: node test/run-all.js
 *
 * Note: these are unit tests that mock or avoid the database layer entirely.
 * They verify business logic correctness, not live PostgreSQL connectivity.
 * To test the full stack end-to-end, run the real server against a real
 * PostgreSQL connection (see README.md) and exercise the API with curl/Postman
 * or the actual frontend.
 */

const { execSync } = require('child_process');
const path = require('path');

const files = [
  'stressEngine.test.js',
  'auth.test.js',
  'middleware.test.js',
  'aiService.test.js',
];

let failed = 0;

for (const file of files) {
  console.log(`\n${'='.repeat(50)}\nRunning ${file}\n${'='.repeat(50)}`);
  try {
    execSync(`node ${path.join(__dirname, file)}`, { stdio: 'inherit' });
  } catch (err) {
    failed++;
    console.error(`\n❌ ${file} FAILED`);
  }
}

console.log(`\n${'='.repeat(50)}`);
if (failed) {
  console.log(`❌ ${failed} test file(s) failed.`);
  process.exit(1);
} else {
  console.log('✅ All test files passed.');
}
