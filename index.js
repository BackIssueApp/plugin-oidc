// OpenID Connect (SSO) for BackIssue. Adds a "Sign in with <label>" button.
// On callback it verifies the id_token via openid-client (discovery, JWKS,
// PKCE, state, nonce), then hands the VERIFIED identity to core
// (req.app.locals.issueSession) which links or auto-provisions the local
// account. Session/cookie issuance stays in core — this plugin only proves who
// the user is.
import * as client from 'openid-client';
import config from '../../src/config.js';

const PROVIDER = 'oidc';

// In-flight logins: state → { verifier, nonce, at }. Single-process, pruned by TTL.
const pending = new Map();
const PENDING_TTL_MS = 10 * 60 * 1000;
function stash(state, data) {
  const cutoff = Date.now() - PENDING_TTL_MS;
  for (const [k, v] of pending) if (v.at < cutoff) pending.delete(k);
  pending.set(state, { ...data, at: Date.now() });
}
function take(state) {
  const v = pending.get(state);
  pending.delete(state);
  if (!v || v.at < Date.now() - PENDING_TTL_MS) return null;
  return v;
}

// Discovered provider config, cached until the credentials change.
let discovered = null;
let discoveredKey = '';
async function providerConfig() {
  const issuer = String(config.oidcIssuer || '').trim();
  const clientId = String(config.oidcClientId || '').trim();
  const secret = String(config.oidcClientSecret || '');
  if (!issuer || !clientId) throw new Error('OIDC is not configured — set the issuer URL and client ID in Settings.');
  const key = `${issuer}|${clientId}|${secret}`;
  if (discovered && discoveredKey === key) return discovered;
  discovered = await client.discovery(new URL(issuer), clientId, secret);
  discoveredKey = key;
  return discovered;
}

function origin(req) {
  const base = String(config.oidcRedirectBase || '').trim();
  if (base) return new URL(base).origin;
  return `${req.protocol}://${req.get('host')}`;
}
const redirectUri = (req) => `${origin(req)}/api/oidc/callback`;
const scopes = () => String(config.oidcScopes || 'openid email profile').trim() || 'openid email profile';

function esc(s) {
  return String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
}

async function loginHandler(req, res) {
  try {
    const cfg = await providerConfig();
    const verifier = client.randomPKCECodeVerifier();
    const challenge = await client.calculatePKCECodeChallenge(verifier);
    const state = client.randomState();
    const nonce = client.randomNonce();
    stash(state, { verifier, nonce });
    const url = client.buildAuthorizationUrl(cfg, {
      redirect_uri: redirectUri(req),
      scope: scopes(),
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state,
      nonce,
    });
    res.redirect(url.href);
  } catch (e) {
    res.status(500).send(`SSO login failed: ${esc(e?.message || e)}`);
  }
}

async function callbackHandler(req, res) {
  try {
    const state = String(req.query.state || '');
    const saved = take(state);
    if (!saved) throw new Error('login expired or was already used — please try again');
    const cfg = await providerConfig();
    const currentUrl = new URL(req.originalUrl, origin(req));
    const tokens = await client.authorizationCodeGrant(cfg, currentUrl, {
      pkceCodeVerifier: saved.verifier,
      expectedNonce: saved.nonce,
      expectedState: state,
      idTokenExpected: true,
    });
    const claims = tokens.claims() || {};
    const subject = claims.sub;
    const email = claims.email ? String(claims.email) : null;
    const name = claims.name || claims.preferred_username || null;
    if (!subject) throw new Error('the provider returned no subject (sub) claim');

    const allowed = String(config.oidcAllowedDomains || '')
      .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (allowed.length) {
      const domain = email ? email.split('@')[1]?.toLowerCase() : null;
      if (!domain || !allowed.includes(domain)) {
        throw new Error('your account is not permitted to sign in here');
      }
    }

    const defaultRole = String(config.oidcAutoRole || 'viewer').trim() || 'viewer';
    // Core verifies nothing here — WE verified the id_token above — it links or
    // provisions the account and sets the session cookie.
    req.app.locals.issueSession(req, res, { provider: PROVIDER, subject, email, name, defaultRole });
    res.redirect('/');
  } catch (e) {
    const status = e?.status || 403;
    res.status(status).send(`SSO sign-in failed: ${esc(e?.message || e)}`);
  }
}

export default function register(api) {
  api.registerSettings({
    oidcIssuer: { type: 'string' },
    oidcClientId: { type: 'string' },
    oidcClientSecret: { type: 'string' },
    oidcScopes: { type: 'string' },
    oidcLabel: { type: 'string' },
    oidcAllowedDomains: { type: 'string' },
    oidcAutoRole: { type: 'string' },
    oidcRedirectBase: { type: 'string' },
  });
  // The login-page button. Label is read at boot; changing it needs a restart.
  api.registerAuthProvider({ id: PROVIDER, label: String(config.oidcLabel || 'SSO'), loginPath: '/api/oidc/login' });
  api.registerClientAsset({ js: 'client/oidc.js' });
  // Public: the browser hits these unauthenticated (that's the point of login).
  api.registerRoute('get', '/api/oidc/login', loginHandler, { access: 'public' });
  api.registerRoute('get', '/api/oidc/callback', callbackHandler, { access: 'public' });
}
