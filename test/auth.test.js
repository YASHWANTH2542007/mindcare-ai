process.env.JWT_SECRET = 'test-secret-for-unit-tests';
process.env.JWT_EXPIRES_IN = '7d';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const assert = require('assert');
const { signToken } = require('../server/middleware/auth');

console.log('=== Testing auth (bcrypt + JWT) ===\n');

(async () => {
  // Test 1: password hashing round-trip
  const plain = 'mySecurePassword123';
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(plain, salt);
  console.log('Test 1 — hash generated:', hash.slice(0, 20) + '...');
  assert.notStrictEqual(hash, plain, 'Hash should not equal plaintext');

  const isValid = await bcrypt.compare(plain, hash);
  assert.strictEqual(isValid, true, 'Correct password should verify');
  console.log('✅ PASS — correct password verifies against hash\n');

  const isInvalid = await bcrypt.compare('wrongPassword', hash);
  assert.strictEqual(isInvalid, false, 'Wrong password should not verify');
  console.log('✅ PASS — wrong password correctly rejected\n');

  // Test 2: JWT signing and verification
  const fakeUser = { id: '64f1a2b3c4d5e6f7a8b9c0d1', email: 'test@example.com' };
  const token = signToken(fakeUser);
  console.log('Test 2 — token generated:', token.slice(0, 30) + '...');

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  assert.strictEqual(decoded.sub, '64f1a2b3c4d5e6f7a8b9c0d1');
  assert.strictEqual(decoded.email, 'test@example.com');
  console.log('✅ PASS — token decodes with correct sub + email\n');

  // Test 3: tampered/invalid token should fail verification
  let threw = false;
  try {
    jwt.verify(token + 'tampered', process.env.JWT_SECRET);
  } catch (e) {
    threw = true;
  }
  assert.strictEqual(threw, true, 'Tampered token should throw');
  console.log('✅ PASS — tampered token correctly rejected\n');

  // Test 4: wrong secret should fail verification
  let threw2 = false;
  try {
    jwt.verify(token, 'wrong-secret');
  } catch (e) {
    threw2 = true;
  }
  assert.strictEqual(threw2, true, 'Wrong secret should throw');
  console.log('✅ PASS — wrong secret correctly rejected\n');

  console.log('=== All auth tests passed ===');
})();
