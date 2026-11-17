# Draft merge proposal

Proposed title `Complete ScamShield authentication security and production configuration`

This release replaces browser-stored credentials with cookie authentication,
adds signed CSRF protection, database-backed rate limits and revocable sessions,
and prepares a same-origin Vercel API proxy to the Render backend. Existing branding
and scanner improvements are retained in separate changesets. Scanner regressions
cover URL parsing, scoring and partial-word false positives.

Local validation passed 13 backend security tests and 5 scanner/hosting tests,
lint, production build and both dependency audits. Local browser authentication,
scanner history and responsive checks passed. The live Atlas integration failed
during TLS negotiation before an account was created.

Keep this proposal in draft until the Atlas password is rotated, Atlas access is
restored, the existing Vercel project is confirmed and the assigned Render origin
and matching proxy secrets are configured. Public HTTPS authentication verification
is pending approved deployment. Full evidence and release settings are in RELEASE.md.
