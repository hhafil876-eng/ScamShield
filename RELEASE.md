# ScamShield production release

Release is locally verified against Atlas. Publication is gated on authenticated
hosting access and approval for GitHub publishing, Render creation, environment
changes and deployment. The original four release commits are preserved.

## Hosting configuration

Authenticated Vercel CLI inspection verified project `scam-shield`, owned by team
`acme-2d69`, with OWNER membership for the signed-in `hhafil876-eng` account.
The project is linked to GitHub repository `hhafil876-eng/ScamShield`, with
production branch `main`. Its READY deployment owns the existing public alias
https://scam-shield-gules.vercel.app/. Root directory is the repository root,
framework is Vite and Node is 24.x. No project environment variables are configured.
The local checkout is linked to this existing project through ignored
`.vercel/project.json` metadata. No duplicate frontend project was created.

The user confirmed that the Render workspace contains no backend service. A Render
service and assigned URL are still pending explicit creation/deployment approval.

Use the existing Vercel project with repository root `.`, install command `npm ci`,
build command `npm run build` and output directory `dist`. `vercel.mjs` sends `/api/*`
to the configured Render origin, preserves filesystem assets and falls back to
`index.html` for React routes. It fails configuration loading if required hosting
values are missing. No Render hostname has been invented.

| Vercel variable | Required value |
| --- | --- |
| `RENDER_API_ORIGIN` | Actual HTTPS origin assigned to the intended Render service, without a trailing slash |
| `PROXY_SHARED_SECRET` | Same private random value configured on Render, at least 32 characters |
| `VITE_API_URL` | Leave unset or empty so the frontend uses its own `/api` route |

The secret header uses Vercel's deployment environment transform and is not embedded
in the frontend bundle or committed configuration. Browser cookies remain Secure,
HttpOnly and SameSite=Strict because browser requests stay on the frontend origin.
CSRF validation remains enabled on every authentication mutation. API rewrite
caching is explicitly disabled.

`render.yaml` prepares a Node web service. Apply settings to the intended service
after approval, checking for an existing service before creating one.

| Render setting | Value |
| --- | --- |
| Root directory | `server` |
| Source | `hhafil876-eng/ScamShield`, branch `security-fix` |
| Plan | Free, selected for initial verification and subject to creation approval |
| Install/build command | `npm ci --omit=dev` |
| Start command | `npm start` |
| Node runtime | Node 24, satisfying the supported `>=22.12.0 <25` range |
| Render health check | `/api/health` |
| Database readiness endpoint | `/api/ready`, which must report ready before release promotion |
| Liveness endpoint | `/api/health` |
| Automatic deployment | Disabled in the prepared Blueprint |
| Port | Provider-assigned `PORT`, bound explicitly on `0.0.0.0` |

| Render variable | Required value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGO_URI` | Private rotated Atlas connection URI |
| `JWT_SECRET` | Private random signing secret, at least 32 characters |
| `JWT_EXPIRES_IN` | `7d`, or the approved session lifetime |
| `CLIENT_ORIGIN` | `https://scam-shield-gules.vercel.app` |
| `PROXY_SHARED_SECRET` | Same private random value configured on Vercel |

`MONGO_URL` remains a fallback. `MONGO_URI` takes precedence if both are present.
The production authentication routes accept visitor IP headers only after
validating the private Vercel proxy header. Rate-limit counters are atomic MongoDB
documents shared by all backend instances. `TRUST_PROXY` can remain unset for this
deployment. If another trusted ingress is later added, configure explicit proxy
addresses or CIDRs instead of trusting arbitrary forwarding headers.

JWTs contain a random session identifier and require a live, unexpired session
document. Logout deletes only that session. Replayed tokens are rejected. Other
sessions remain active. Account deletion removes the user and all sessions, then
clears local profile state and scan history in the current browser. Older tokens
without session identifiers require a fresh login.

## Credentials and Atlas access

Private environment values differ from the historical Git-exposed values. A
read-only connection attempt with the historical Atlas credential was rejected by
Atlas authentication. A JWT signed with the historical signing secret also fails
verification against the current secret. Values were suppressed throughout.

A previous inspection exposed populated example-file credentials in tool output.
The example was scrubbed and the JWT secret regenerated privately. The user later
updated the private Atlas configuration. Subsequent live verification passed 27
checks, including real signup, password hashing, session expiry, replay rejection
and account deletion. The dedicated account and all its sessions were removed,
and the existing-account metadata baseline was unchanged.

A separate production-mode process also connected to Atlas successfully and
returned HTTP 200 for both probes, with `ready=true` and `readyState=1`. It used an
OS-assigned port and was stopped after the smoke test. The existing development
backend was preserved. Atlas access from Render remains pending an actual service.

Save credentials only in private `server/.env` or hosting secret settings.
Environment examples contain placeholders. Actual environment files are ignored,
and the previously tracked `server/.env` is absent from the current source tree.

The official Vercel CLI 65.17.0 is available through the npm cache. The user
authorized its login flow, and authentication succeeded as `hhafil876-eng`. The configuration was renamed from `vercel.js` to `vercel.mjs`
because Windows resolved the former as a command ahead of the actual CLI.

The official Render CLI 2.37.0 archive passed its published SHA-256 checksum.
Windows Application Control blocked execution with a binary-reputation warning,
so neither its authentication check nor its Blueprint validation could run. No
security exception was applied. Dashboard or authenticated API access remains an
alternative once the account connection is available to the assistant.

## Verification evidence

Checks were executed on 2026-11-17.

| Check | Actual result |
| --- | --- |
| Backend security and production-startup regressions | 17 passed, 0 failed, using isolated MongoDB |
| Scanner and hosting configuration tests | 7 passed, 0 failed, including exactly-one `/api` prefix and Render Blueprint coverage |
| Lint | Passed with the normal `npm run lint` command |
| Frontend production build | Passed, with the existing large-chunk warning |
| Dependency audits | Both dependency trees reported zero vulnerabilities |
| Browser authentication | Local signup, incorrect password, login, protected profile, reload and logout passed |
| Browser credential storage | JWT inaccessible to JavaScript, no passwords or JWTs in localStorage |
| Scanner browser check | Demo produced 98/100 and persisted a URL threat in scan history |
| Responsive layout | Dashboard at 320 and 1440 pixels and profile at 390 pixels showed no horizontal overflow |
| Logo | Loaded successfully in the browser and included in the build |
| Production API address | Built JavaScript contains no `http://localhost:5000` API fallback |
| Vercel configuration fields | Used routing and build fields passed validation against the published schema with placeholder test settings |
| Live Atlas authentication | 27 checks passed in the completed live verification, with dedicated-account cleanup |
| Production startup with Atlas | Passed assigned-port IPv4 binding, health 200 and readiness 200 |
| Production-only installation | Exact `npm ci --omit=dev` command passed in a disposable copy, then startup and Atlas readiness passed without development dependencies |
| Render Blueprint schema | Passed local validation against Render's published schema |
| Vercel account ownership | Authenticated alias, project, repository, production branch and OWNER role verified |
| Render CLI | Blocked by Windows Application Control, so CLI authentication remains unverified |
| Public frontend | Existing URL returned HTTP 200 and ScamShield HTML |
| Public frontend-to-Render authentication | Pending actual Render URL, hosting settings and approved deployment |

The isolated database tests do not establish Atlas connectivity. The Vercel rewrite
configuration has local regression coverage. Its public Set-Cookie forwarding,
visitor identity headers and HTTPS authentication still require deployed testing.
Full meta-validation of the published Vercel schema encountered mixed draft syntax
in unrelated experimental fields. The project's used fields were checked separately.

## Integration and approval gates

The latest fetched `origin/main` README content is incorporated with production
documentation links and corrected hashing/entry-point descriptions. Security,
branding and scanner changes are prepared as separate local changesets. Preserve
the logo with its component imports.

The Vercel account and existing project are verified. The user confirmed an empty
Render workspace. Render operations need an enabled account connection or an
authenticated dashboard/API path because Windows blocks the native CLI.

The next publishing operation would run `git push --set-upstream origin security-fix`.
This creates the remote release branch and can trigger connected Vercel preview
builds, because Git deployments are enabled. It requires explicit approval.

Obtain explicit approval before publishing
`security-fix`, creating one `scamshield-api` service, setting private variables or
starting deployments. Render creation can start an initial build/deployment. Use
`server`, Node 24, `npm ci --omit=dev`, `npm start` and health path `/api/health`.
The prepared plan is Free for initial verification. Confirm the plan and region
before creation. Publish the reviewed branch
before choosing it as the Render source, so the service uses the updated code.

Use only the assigned Render HTTPS origin for `RENDER_API_ORIGIN`. Set matching
private proxy secrets on both providers and leave `VITE_API_URL` empty. Preserve
the existing public Vercel alias. A GitHub push may trigger connected Vercel builds,
so publishing approval must cover that effect. Confirm Atlas Network Access for the
Render service's outbound addresses and require readiness to pass before promotion.
Following approved deployment, verify public HTTPS signup, login, refresh, logout,
revocation, CSRF rejection and direct-backend rejection with disposable test data.

No push, merge, deployment or Git history rewrite is authorized by this document.
The source commits remove the environment file but retain historical blobs.
The separate history-cleanup proposal is gated by explicit approval.

1. Verify revoked credentials, then create a private backup and record current branch/tag tips.
2. Use a fresh mirror, preserving the working repository and its release changes.
3. Remove only `server/.env` from the affected history with an explicitly reviewed
   history filter. Expect commit identifiers to change, including descendants.
4. Verify all refs for secret blobs and compare the resulting release source tree
   against the approved source tree so UI, scanner and security changes are retained.
5. Present the exact affected refs and obtain separate approval for any remote
   history replacement. Coordinate collaborator recovery and review retained fork
   or cached copies with GitHub if necessary.

No history-cleanup command has been run. Rotated credentials remain the immediate
protection regardless of any future history cleanup.

Configuration references are the official [Vercel rewrite documentation](https://vercel.com/docs/routing/rewrites),
[Vercel programmatic configuration documentation](https://vercel.com/docs/project-configuration/vercel-ts),
[Render Blueprint reference](https://render.com/docs/blueprint-spec) and
[MongoDB connection troubleshooting](https://www.mongodb.com/docs/atlas/troubleshoot-connection/).
