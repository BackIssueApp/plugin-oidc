// OIDC settings UI — injected into the Sign-in section on the Settings page.
// Fields use the id="set-<configKey>" convention so core's generic settings
// load/save handles them; no custom wiring needed.
(function () {
  window.BackIssue.registerClient((api) => {
    const slot = api.slot('settings-plugin-auth');
    if (!slot || document.getElementById('set-oidcIssuer')) return;
    // Translations: api.t when the host has it (BackIssue > 0.9.0), the inline
    // English otherwise. Catalog keys live under locales/<lang>.json.
    const NS = 'oidc.';
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fill = (s, p) => (p ? String(s).replace(/\{(\w+)\}/g, (m, k) => (p[k] === undefined || p[k] === null ? m : String(p[k]))) : String(s));
    const tr = (key, en, params) => { if (typeof api.t !== 'function') return fill(en, params); const v = api.t(NS + key, params); return v === NS + key ? fill(en, params) : v; };
    // innerHTML variant: params escaped, only simple inline tags pass through.
    const trh = (key, en, params) => {
      if (typeof api.th === 'function' && api.t(NS + key) !== NS + key) return api.th(NS + key, params);
      const tokens = params ? Object.fromEntries(Object.keys(params).map((k) => [k, '\u0000' + k + '\u0000'])) : undefined;
      let html = esc(fill(en, tokens)).replace(/&lt;(\/?)(b|i|em|strong|code|br|kbd)&gt;/g, '<$1$2>');
      if (params) for (const [k, v] of Object.entries(params)) html = html.split('\u0000' + k + '\u0000').join(esc(v ?? ''));
      return html;
    };
    const te = (key, en, params) => esc(tr(key, en, params));

    slot.insertAdjacentHTML('beforeend',
      '<div class="src-block src-block--open">' +
        '<div class="src-toggle__text"><b>' + te('title', 'OpenID Connect (SSO)') + '</b>' +
        '<span class="modal__note">' + te('intro', 'Sign in with an identity provider — Authentik, Keycloak, Auth0, Google, Microsoft Entra, and more.') + '</span></div>' +
        '<label class="field"><span>' + te('issuerUrl', 'Issuer URL') + '</span><input id="set-oidcIssuer" type="text" spellcheck="false" placeholder="https://id.example.com/application/o/backissue/"></label>' +
        '<label class="field"><span>' + te('clientId', 'Client ID') + '</span><input id="set-oidcClientId" type="text" spellcheck="false" autocomplete="off"></label>' +
        '<label class="field"><span>' + te('clientSecret', 'Client secret') + '</span><input id="set-oidcClientSecret" type="password" spellcheck="false" autocomplete="new-password"></label>' +
        '<label class="field"><span>' + te('buttonLabel', 'Button label') + '</span><input id="set-oidcLabel" type="text" spellcheck="false" placeholder="SSO"></label>' +
        '<label class="field"><span>' + te('scopes', 'Scopes') + '</span><input id="set-oidcScopes" type="text" spellcheck="false" placeholder="openid email profile"></label>' +
        '<label class="field"><span>' + te('newUserRole', 'New-user role') + '</span><input id="set-oidcAutoRole" type="text" spellcheck="false" placeholder="viewer"></label>' +
        '<label class="field"><span>' + te('allowedDomains', 'Allowed email domains') + '</span><input id="set-oidcAllowedDomains" type="text" spellcheck="false" placeholder="' + te('allowedDomainsPlaceholder', 'example.com, other.org  (blank = any)') + '"></label>' +
        '<label class="field"><span>' + te('redirectBase', 'Redirect base URL') + '</span><input id="set-oidcRedirectBase" type="text" spellcheck="false" placeholder="' + te('redirectBasePlaceholder', 'https://backissue.example.com  (blank = auto)') + '"></label>' +
        '<label class="field field--check"><span class="switch"><input id="set-oidcTrustEmail" type="checkbox"><span class="switch__track"></span></span><span>' + te('trustEmail', 'Trust email addresses from this provider') + '</span></label>' +
        '<p class="modal__note">' + te('trustEmailNote', 'An email the provider has not marked as verified is never used to link an existing account or to pass the domain check. Turn this on only for a provider that checks addresses but does not say so, such as Microsoft Entra.') + '</p>' +
        '<p class="modal__note">' + trh('redirectNote', 'Register this <b>redirect URI</b> with your provider: <code>{uri}</code>. Changing the button label needs a restart.', { uri: '<your BackIssue URL>/api/oidc/callback' }) + '</p>' +
      '</div>');
  });
})();
