# Proposed release changesets

This release plan has been implemented on `security-fix`. Existing branding and
scanner work were retained. The tracked `server/.env` was removed from the new
source tree while the private local file remains ignored.

| Local commit | Changeset |
| --- | --- |
| `3784202` | Authentication security, revocable sessions, shared rate limiting and production API access |
| `df60dd5` | Existing branding, responsive presentation, logo and extracted scene components |
| `cc2ca46` | Scanner behavior and regression tests |

The security and UI staged snapshots were exported and validated separately.
Mixed authentication pages include line-ending churn in the intermediate commits.
The final tree is normalized and passes the diff whitespace check. See RELEASE.md
for actual verification results, deployment settings and external release gates.

## 1. Authentication and security

Proposed commit message `fix(security): harden authentication and session handling`

Include these complete files.

- `.gitignore`
- `eslint.config.js` for separate browser and CommonJS backend lint configuration
- `.env.example` (new)
- `server/.env.example` (new)
- `server/index.js` (new)
- `server/server.js`
- `server/config/db.js`
- `server/controller/authcontroller.js`
- `server/middleware/authmiddleware.js`
- `server/middleware/authRateLimit.js` (new)
- `server/middleware/csrfMiddleware.js` (new)
- `server/models/user.js`
- `server/models/authSession.js`, `server/models/authAttempt.js` and `server/middleware/proxyIdentity.js` (new)
- `server/routes/authRoutes.js` (new)
- `server/security.test.js` and `server/atlas.test.js` (new)
- `vercel.mjs`, `render.yaml`, `tests/hosting.test.js` and `scripts/check-secrets.cjs` (new)
- `vite.config.js` for the local same-origin API proxy and production API guard
- `server/package.json` and `server/package-lock.json`
- `src/utils/auth.js`
- `src/components/ProtectedRoute.jsx`
- `package.json` and `package-lock.json` for backend launch scripts and security dependency updates
- The existing tracked-file removal of `server/.env`

Include only the authentication hunks from these mixed files.

| File | Security hunks | Defer to visual changeset |
| --- | --- | --- |
| `src/pages/Login.jsx` | Await login, handle failure and loading state, redirect after success | Logo import and markup, icon changes, copy and formatting |
| `src/pages/Signup.jsx` | Await registration, handle failure and loading state, redirect after success | Logo import and markup, copy and formatting |
| `src/pages/Profile.jsx` | Await logout, retain the session on failure, call authenticated account deletion and clear local history only after success | Layout, additional account-action button and its presentation, formatting |

Account deletion now has an authenticated, CSRF-protected backend endpoint. It
removes the user, invalidates sessions and clears history in the current browser
only after the request succeeds.

The security changeset must build with the original branding before the visual
changeset is applied. Review whole-function edits where Git combines unrelated
lines into one hunk. Avoid staging mixed files wholesale.

## 2. Visual presentation

Proposed commit message `style(ui): update ScamShield branding and presentation`

- `src/App.css`
- `src/index.css`
- `src/components/CyberWorld.jsx`
- `src/components/CyberGrid.jsx`, `src/components/SecurityCore.jsx`,
  `src/components/ThreatNetwork.jsx` and `src/components/ScrollScene.jsx`, populated
  by extracting the existing scene implementation from `CyberWorld.jsx`
- `src/pages/profile.css`
- `src/assets/scamshield-logo.png` (new)
- Visual imports, markup and copy in `src/App.jsx`, `src/pages/Login.jsx`,
  `src/pages/Signup.jsx` and `src/pages/Profile.jsx`
- Whitespace-only changes in `src/main.jsx` and presentation formatting in mixed files

The logo asset must enter the same changeset as its first component imports.
Current consumers are `src/App.jsx`, `src/pages/Login.jsx` and
`src/pages/Signup.jsx`. Keep their associated CSS together with the branding.
The profile action button depends on the security changeset's helper and handling.

## 3. Scanner behavior

Proposed commit message `fix(scanner): adjust threat scoring and analysis behavior`

Select scanner-function changes from `src/App.jsx` separately from its visual JSX.
Include the score accumulator refactor, changed weights, URL-analysis changes and
verdict wording in this review. Inspect the complete `analyzeMessage` function and
verdict function so the behavioral changes remain coherent.

| Signal | Previous weight | Current weight |
| --- | --- | --- |
| Credential request | 25 | 30 |
| Payment request | 20 | 25 |
| Prize pattern | 18 | 20 |
| Authority impersonation | 15 | 18 |
| Suspicious URL | 25 | 30 |

Security tests do not establish scanner accuracy. Review representative scanner
messages and expected scores before approving this changeset.

## Database configuration

Use `MONGO_URI` in deployment configuration and documentation. The backend reads
`process.env.MONGO_URI || process.env.MONGO_URL`, so `MONGO_URL` remains a fallback.
If both variables are populated, `MONGO_URI` takes precedence. No connection value
belongs in the changesets. Configure the value through the host's secret storage.

The actual `.env` and `.env.*` files are ignored, with `.env.example` intentionally
allowed. `server/.env` is staged only for removal. Review the final staged filenames
before each future commit and avoid force-adding ignored environment files.

## Compatibility with origin/main documentation

The fetched `origin/main` tip is `a14afe5`, whose only change from the original
branch base is `README.md`. Its README content has been incorporated with production
documentation links and corrected hashing and entry-point descriptions.
The proposed security files have no path overlap with that remote update.

Retain the updated showcase README when integration is later authorized. Its
`MONGO_URI` documentation agrees with the backend's preferred variable. A focused
documentation follow-up should add production `NODE_ENV`, `CLIENT_ORIGIN`, the
32-character minimum for `JWT_SECRET`, frontend build-time `VITE_API_URL`, same-site
HTTPS cookie requirements and readiness probes. Its architecture notes should
describe `server/index.js` as app setup and listener, with `server/server.js` as a
compatibility entry point. Describe bcrypt as password hashing.

## Focused verification

Checks were run against the current combined working tree on 2026-11-17.

| Check | Result |
| --- | --- |
| `npm.cmd test` in `server` | 13 passed, 0 failed, using isolated MongoDB |
| `npm.cmd run build` at repository root | Passed, with the existing large-chunk warning |
| `npx.cmd eslint src` | Passed |
| `npm.cmd run lint` after browser/backend configuration correction | Passed |
| `npx.cmd eslint server --global require --global module --global process --global Buffer --global __dirname --global global` | Passed |
| Environment ignore rules and staged paths | Actual environment files ignored, staged environment change is deletion only |
| README integration | Latest upstream showcase content incorporated, with release documentation links |
| `npm.cmd test` at repository root | 5 scanner and hosting tests passed |
| Live Atlas verification | 27 checks passed, with dedicated-account cleanup |

The security snapshot passed lint, hosting tests, frontend build and all 13 backend
security tests. The UI snapshot passed lint, hosting tests and frontend build.
The scanner changeset passed 5 root tests, lint and frontend build. Local browser
checks covered authentication, protected pages, refresh, scanner history and mobile
layout. The completed live Atlas verification passed 27 checks and confirmed dedicated-account
cleanup. The historical Atlas credential is rejected, and historical JWT signatures
fail verification against the current secret. Public HTTPS authentication remains
pending approved hosting setup. See RELEASE.md for current account-access gates.

## Final hosting preparation

Render health checking now uses `/api/health`, with readiness verified separately.
Both backend entry points bind to `0.0.0.0` and the provider-assigned port. Production
startup has isolated regression coverage and a successful Atlas-backed smoke check.
The Vercel configuration uses `vercel.mjs` to avoid Windows CLI command shadowing.
The focused verification now passes 17 backend tests and 7 root tests. Existing
release commits and all branding/scanner changes are preserved.
