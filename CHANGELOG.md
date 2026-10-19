# Changelog

Notable, user-facing changes per release. Format follows [Keep a Changelog](https://keepachangelog.com);
versions follow the tags in this repository (`vX.Y.Z` → the release bundle BackIssue's plugin catalog installs).

Contributors: please **don't** edit this file in pull requests — entries are added
by the maintainers when changes merge, so concurrent PRs don't conflict here.

## [Unreleased]

## [1.2.0] — 2026-10-18

### Added

- **Trust email addresses from this provider**, a switch under Settings →
  Sign-in for providers that check addresses but don't mark them as verified,
  such as Microsoft Entra.

### Changed

- **No SSO button until SSO is set up.** On BackIssue 0.9.2 and newer, the
  login page shows the button only once an issuer and client ID are filled in,
  and a renamed button shows without a restart.

### Fixed

- **Only a verified email links an account.** A first sign-in used to link to
  any existing account with the same email, even one the provider never
  verified, so someone who could set an unverified address at the provider
  could sign in as another user. The allowed-domains check now also needs a
  verified email. If your provider doesn't send that flag and you restrict
  domains, turn on the new trust switch or those sign-ins are refused.
- **SSO fields can be cleared.** Blanking a field in Settings used to be
  ignored, so a value could never be removed once saved.

## [1.1.0] — 2026-10-17

### Added

- **Translated settings card.** The card's labels and notes follow the
  language picked under Profile → Language on BackIssue 0.9.1 and newer, and
  stay English on older ones. Translations ship for French, German, Spanish,
  Italian, Portuguese (Portugal and Brazil), Dutch, Polish, Japanese and
  Simplified Chinese in `locales/`. Also covers the permission, job and
  library-type labels, the plugin description and the notification titles
  shown in BackIssue’s own screens.

## [1.0.0] — 2026-07-08

Initial release: sign in to BackIssue with an OpenID Connect identity provider —
Authentik, Keycloak, Auth0, Google, Microsoft Entra, and more. Adds a
"Sign in with …" button to the login page and maps provider users to
BackIssue accounts.
