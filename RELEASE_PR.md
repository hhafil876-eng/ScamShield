# Draft merge proposal

Proposed title `Complete ScamShield authentication security and production configuration`

This release replaces browser-stored credentials with cookie authentication,
adds signed CSRF protection, database-backed rate limits and revocable sessions,
and prepares a same-origin Vercel API proxy to the Render backend. Existing branding
and scanner improvements are retained in separate changesets. Scanner regressions
cover URL parsing, scoring and partial-word false positives.

Local validation passed 17 backend security/startup tests and 7 scanner/hosting tests,
lint, production build and both dependency audits. Local browser authentication,
scanner history and responsive checks passed. The completed live Atlas verification passed 27 checks and removed its dedicated account.

The existing Vercel project and OWNER access are verified. Keep this proposal in
draft until the approved Render service is configured with its assigned origin
and matching private proxy secrets. Public HTTPS authentication verification
is pending approved deployment. Full evidence and release settings are in RELEASE.md.
