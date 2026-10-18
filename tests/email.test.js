// Only a verified email may link an existing account or pass the domain check.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trustedEmail } from '../index.js';

test('trustedEmail: verified emails only, unless the admin trusts the provider', () => {
  assert.equal(trustedEmail({ email: 'a@x.com', email_verified: true }), 'a@x.com');
  assert.equal(trustedEmail({ email: 'a@x.com', email_verified: 'true' }), 'a@x.com', 'some providers send a string');
  assert.equal(trustedEmail({ email: 'admin@x.com', email_verified: false }), null, 'an unverified email is ignored');
  assert.equal(trustedEmail({ email: 'admin@x.com' }), null, 'no verified flag means not verified');
  assert.equal(trustedEmail({ email: 'a@x.com' }, { oidcTrustEmail: true }), 'a@x.com', 'opt-in for providers that never send the flag');
  assert.equal(trustedEmail({ email_verified: true }), null, 'no email, nothing to trust');
});
