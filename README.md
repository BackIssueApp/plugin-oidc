# SSO (OpenID Connect)

Lets BackIssue users sign in with an OpenID Connect identity provider —
**Authentik**, **Keycloak**, **Auth0**, **Google**, **Microsoft Entra**, and
anything else that implements standard OIDC discovery. Adds a "Sign in with
…" button to the login page; first-time sign-ins are provisioned as local
accounts, returning ones are linked by subject.

## Install

One click from **Sidebar → Plugins** in BackIssue, or drop this folder into
the app's `plugins/` directory and restart.

## Setup

1. Register BackIssue in your provider with redirect URI
   `http(s)://<your-backissue-host>/api/oidc/callback`.
2. In **Settings → Sign-in**, fill in the **issuer URL** (the provider's
   base — discovery is automatic), **client ID**, and **client secret**.
3. Optional: the button **label**, requested **scopes**, restrict sign-ins
   to **allowed email domains**, the **role** new users get, and a
   **redirect base** if BackIssue sits behind a proxy that hides its
   public URL.

A first sign-in links to an existing account only when the provider marks
the email as verified, and only a verified email passes the domain check. If
your provider checks addresses but doesn't send that flag (Microsoft Entra),
turn on **Trust email addresses from this provider**.

A *Disable password login* toggle makes the site SSO-only; admins always
keep a password fallback, so a downed provider can't lock you out.

Full guide: <https://backissue.app/users#signing-in-with-an-identity-provider-sso>
