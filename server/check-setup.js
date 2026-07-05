/**
 * Quick sanity check before you run the real server.
 * Run with: node server/check-setup.js
 */
require('dotenv').config();

const checks = [
  {
    name: 'DATABASE_URL',
    ok: Boolean(process.env.DATABASE_URL),
    hint: 'Set this to your PostgreSQL connection string (local or Render) in .env',
  },
  {
    name: 'JWT_SECRET',
    ok: Boolean(process.env.JWT_SECRET) && process.env.JWT_SECRET !== 'change-this-to-a-long-random-string',
    hint: "Set a real random secret in .env, e.g. run: openssl rand -hex 32",
  },
  {
    name: 'GEMINI_API_KEY',
    ok: Boolean(process.env.GEMINI_API_KEY),
    hint: 'Optional — without this, AI recommendations use the rule-based fallback (app still works). Get a free key at https://aistudio.google.com/apikey',
    warn: true,
  },
];

console.log('\n🧠 MindCare AI — environment check\n' + '─'.repeat(40));

let hasError = false;
for (const c of checks) {
  const icon = c.ok ? '✅' : c.warn ? '⚠️ ' : '❌';
  console.log(`${icon} ${c.name.padEnd(20)} ${c.ok ? 'OK' : 'missing'}`);
  if (!c.ok) {
    console.log(`   → ${c.hint}`);
    if (!c.warn) hasError = true;
  }
}

console.log('─'.repeat(40));
if (hasError) {
  console.log('\n❌ Fix the items above before running `npm start`.\n');
  process.exit(1);
} else {
  console.log('\n✅ Required configuration looks good. Run `npm start` to launch the server.\n');
}
