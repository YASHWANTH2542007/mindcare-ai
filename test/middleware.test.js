process.env.JWT_SECRET = 'test-secret-for-unit-tests';
const assert = require('assert');
const { requireAuth, signToken } = require('../server/middleware/auth');

console.log('=== Testing requireAuth middleware ===\n');

function mockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.body = obj; return this; },
  };
  return res;
}

// Test 1: missing Authorization header → 401
{
  const req = { headers: {} };
  const res = mockRes();
  let nextCalled = false;
  requireAuth(req, res, () => { nextCalled = true; });
  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(nextCalled, false);
  console.log('✅ PASS — missing header rejected with 401:', res.body.error);
}

// Test 2: valid token → calls next(), attaches req.user
{
  const fakeUser = { id: 'abc123', email: 'student@college.edu' };
  const token = signToken(fakeUser);
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = mockRes();
  let nextCalled = false;
  requireAuth(req, res, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, true);
  assert.strictEqual(req.user.id, 'abc123');
  assert.strictEqual(req.user.email, 'student@college.edu');
  console.log('✅ PASS — valid token calls next() with req.user =', JSON.stringify(req.user));
}

// Test 3: malformed header (no "Bearer" prefix) → 401
{
  const req = { headers: { authorization: 'sometoken' } };
  const res = mockRes();
  let nextCalled = false;
  requireAuth(req, res, () => { nextCalled = true; });
  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(nextCalled, false);
  console.log('✅ PASS — malformed header rejected:', res.body.error);
}

// Test 4: garbage token → 401 with "Invalid" message
{
  const req = { headers: { authorization: 'Bearer not.a.valid.jwt' } };
  const res = mockRes();
  let nextCalled = false;
  requireAuth(req, res, () => { nextCalled = true; });
  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(nextCalled, false);
  console.log('✅ PASS — garbage token rejected:', res.body.error);
}

console.log('\n=== All middleware tests passed ===');
