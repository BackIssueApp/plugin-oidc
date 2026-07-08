// OIDC settings UI — injected into the Sign-in section on the Settings page.
// Fields use the id="set-<configKey>" convention so core's generic settings
// load/save handles them; no custom wiring needed.
(function () {
  window.BackIssue.registerClient((api) => {
    const slot = api.slot('settings-plugin-auth');
    if (!slot || document.getElementById('set-oidcIssuer')) return;
    slot.insertAdjacentHTML('beforeend',
      '<div class="src-block src-block--open">' +
        '<div class="src-toggle__text"><b>OpenID Connect (SSO)</b>' +
        '<span class="modal__note">Sign in with an identity provider — Authentik, Keycloak, Auth0, Google, Microsoft Entra, and more.</span></div>' +
        '<label class="field"><span>Issuer URL</span><input id="set-oidcIssuer" type="text" spellcheck="false" placeholder="https://id.example.com/application/o/backissue/"></label>' +
        '<label class="field"><span>Client ID</span><input id="set-oidcClientId" type="text" spellcheck="false" autocomplete="off"></label>' +
        '<label class="field"><span>Client secret</span><input id="set-oidcClientSecret" type="password" spellcheck="false" autocomplete="new-password"></label>' +
        '<label class="field"><span>Button label</span><input id="set-oidcLabel" type="text" spellcheck="false" placeholder="SSO"></label>' +
        '<label class="field"><span>Scopes</span><input id="set-oidcScopes" type="text" spellcheck="false" placeholder="openid email profile"></label>' +
        '<label class="field"><span>New-user role</span><input id="set-oidcAutoRole" type="text" spellcheck="false" placeholder="viewer"></label>' +
        '<label class="field"><span>Allowed email domains</span><input id="set-oidcAllowedDomains" type="text" spellcheck="false" placeholder="example.com, other.org  (blank = any)"></label>' +
        '<label class="field"><span>Redirect base URL</span><input id="set-oidcRedirectBase" type="text" spellcheck="false" placeholder="https://backissue.example.com  (blank = auto)"></label>' +
        '<p class="modal__note">Register this <b>redirect URI</b> with your provider: <code>&lt;your BackIssue URL&gt;/api/oidc/callback</code>. Changing the button label needs a restart.</p>' +
      '</div>');
  });
})();
