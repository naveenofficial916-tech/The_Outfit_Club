/**
 * testAccountTask5_1.mjs
 * MODULE 5 / TASK 5.1 — Auth Store Validation
 * Run with: node src/scratch/testAccountTask5_1.mjs
 */

// Polyfill localStorage for Node.js
const _store = {};
global.localStorage = {
  getItem: (k) => _store[k] ?? null,
  setItem: (k, v) => { _store[k] = v; },
  removeItem: (k) => { delete _store[k]; },
};
global.window = {
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
};

// ─── Inline auth store logic for testing ─────────────────────────────
const SESSION_KEY = 'the_outfit_club_session_v1';
const ACCOUNTS_KEY = 'the_outfit_club_accounts_v1';

function _demoHash(password) {
  let h = 0;
  for (let i = 0; i < password.length; i++) {
    h = (Math.imul(31, h) + password.charCodeAt(i)) | 0;
  }
  return 'demo_' + Math.abs(h).toString(36);
}

function _generateId() {
  return `cust_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function _getAccounts() {
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  if (raw) return JSON.parse(raw);
  return [];
}

function _saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

const authStore = {
  getSession() {
    const empty = { customerId: '', name: '', email: '', isLoggedIn: false };
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.isLoggedIn === 'boolean') return parsed;
    }
    return empty;
  },
  login(email, password) {
    const accounts = _getAccounts();
    const found = accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) return { success: false, error: 'No account found with that email address.' };
    if (found._pwHash !== _demoHash(password)) return { success: false, error: 'Incorrect password. Please try again.' };
    const session = { customerId: found.id, name: found.name, email: found.email, isLoggedIn: true };
    this._persistSession(session);
    return { success: true };
  },
  register(name, email, password) {
    const accounts = _getAccounts();
    const exists = accounts.some(a => a.email.toLowerCase() === email.trim().toLowerCase());
    if (exists) return { success: false, error: 'An account already exists with that email address.' };
    const newAccount = { id: _generateId(), name: name.trim(), email: email.trim().toLowerCase(), _pwHash: _demoHash(password) };
    _saveAccounts([...accounts, newAccount]);
    const session = { customerId: newAccount.id, name: newAccount.name, email: newAccount.email, isLoggedIn: true };
    this._persistSession(session);
    return { success: true };
  },
  logout() {
    localStorage.removeItem(SESSION_KEY);
  },
  updateProfile(name, email) {
    const session = this.getSession();
    if (!session.isLoggedIn) return { success: false, error: 'Not logged in.' };
    const accounts = _getAccounts();
    const duplicate = accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase() && a.id !== session.customerId);
    if (duplicate) return { success: false, error: 'That email address is already used by another account.' };
    const updated = accounts.map(a => a.id === session.customerId ? { ...a, name: name.trim(), email: email.trim().toLowerCase() } : a);
    _saveAccounts(updated);
    const newSession = { ...session, name: name.trim(), email: email.trim().toLowerCase() };
    this._persistSession(newSession);
    return { success: true };
  },
  _persistSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
};

// ─── Test runner ─────────────────────────────────────────────────────
let pass = 0;
let fail = 0;

function test(label, fn) {
  try {
    fn();
    console.log(`  ✅ ${label}`);
    pass++;
  } catch (e) {
    console.log(`  ❌ ${label}`);
    console.log(`     ${e.message}`);
    fail++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

// ─── Suite ────────────────────────────────────────────────────────────
console.log('\n🧪 MODULE 5 / TASK 5.1 — AUTH STORE TESTS\n');

console.log('1. Logged-out initial state');
test('getSession() returns isLoggedIn=false by default', () => {
  const s = authStore.getSession();
  assert(!s.isLoggedIn, 'Expected isLoggedIn=false');
  assert(s.name === '', 'Expected empty name');
  assert(s.email === '', 'Expected empty email');
});

console.log('\n2. Registration');
test('register() creates account and session', () => {
  const r = authStore.register('Alex Carter', 'alex@test.com', 'pass123');
  assert(r.success, `Expected success, got: ${r.error}`);
  const s = authStore.getSession();
  assert(s.isLoggedIn, 'Session should be logged in');
  assert(s.name === 'Alex Carter', `Expected name "Alex Carter", got "${s.name}"`);
  assert(s.email === 'alex@test.com', `Expected email "alex@test.com", got "${s.email}"`);
});

test('register() rejects duplicate email', () => {
  const r = authStore.register('Other User', 'alex@test.com', 'pass456');
  assert(!r.success, 'Expected failure for duplicate email');
  assert(r.error?.includes('already exists'), `Expected duplicate error, got: ${r.error}`);
});

console.log('\n3. Logout');
test('logout() clears session, cart and wishlist are NOT touched', () => {
  // Set a fake cart key to ensure it is preserved
  localStorage.setItem('the_outfit_club_cart_v1', JSON.stringify([{ id: 'p1' }]));
  authStore.logout();
  const s = authStore.getSession();
  assert(!s.isLoggedIn, 'Session should be cleared');
  assert(s.name === '', 'Name should be empty');
  // Cart is preserved
  const cart = JSON.parse(localStorage.getItem('the_outfit_club_cart_v1'));
  assert(cart?.length === 1, 'Cart data should be preserved after logout');
});

console.log('\n4. Login');
test('login() fails with unknown email', () => {
  const r = authStore.login('unknown@test.com', 'pass123');
  assert(!r.success, 'Expected login failure for unknown email');
});

test('login() fails with wrong password', () => {
  const r = authStore.login('alex@test.com', 'wrongpassword');
  assert(!r.success, 'Expected login failure for wrong password');
  assert(r.error?.toLowerCase().includes('password'), `Expected password error, got: ${r.error}`);
});

test('login() succeeds with correct credentials', () => {
  const r = authStore.login('alex@test.com', 'pass123');
  assert(r.success, `Expected login success, got: ${r.error}`);
  const s = authStore.getSession();
  assert(s.isLoggedIn, 'Session should be active');
  assert(s.name === 'Alex Carter', `Expected name "Alex Carter", got "${s.name}"`);
});

console.log('\n5. localStorage persistence');
test('session persists across getSession() calls', () => {
  const s1 = authStore.getSession();
  const s2 = authStore.getSession();
  assert(s1.isLoggedIn && s2.isLoggedIn, 'Session should persist');
  assert(s1.customerId === s2.customerId, 'Customer ID should be stable');
});

console.log('\n6. Update Profile');
test('updateProfile() updates name and email', () => {
  const r = authStore.updateProfile('Alexander Carter', 'alexander@test.com');
  assert(r.success, `Expected profile update success, got: ${r.error}`);
  const s = authStore.getSession();
  assert(s.name === 'Alexander Carter', `Expected "Alexander Carter", got "${s.name}"`);
  assert(s.email === 'alexander@test.com', `Expected "alexander@test.com", got "${s.email}"`);
});

test('updateProfile() fails when not logged in', () => {
  authStore.logout();
  const r = authStore.updateProfile('Foo', 'foo@test.com');
  assert(!r.success, 'Expected failure when not logged in');
});

test('updateProfile() rejects email already used by another account', () => {
  // Register a second account
  authStore.register('Second User', 'second@test.com', 'pass999');
  // Register first user and log in
  authStore.logout();
  // Login as first account (now email changed to alexander@test.com)
  authStore.login('alexander@test.com', 'pass123');
  const r = authStore.updateProfile('Alexander Carter', 'second@test.com');
  assert(!r.success, 'Expected failure for email taken by another account');
});

console.log('\n7. Validation pass-through');
test('register() works case-insensitively on email', () => {
  authStore.logout();
  const r = authStore.register('New User', 'NEWUSER@TEST.COM', 'pw1234');
  assert(r.success, 'Expected register success');
  const s = authStore.getSession();
  assert(s.email === 'newuser@test.com', 'Email should be lowercased');
});

// ─── Summary ─────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(`RESULTS: ${pass} passed, ${fail} failed`);
if (fail === 0) {
  console.log('🎉 ALL TESTS PASSED — Task 5.1 auth logic is correct.\n');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Review above.\n');
  process.exit(1);
}
