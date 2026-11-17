# ScamShield production release

Release remains blocked on Atlas access, database credential rotation and hosting
account verification. Local engineering checks have passed as listed below.

## Hosting configuration

The existing public frontend responds at https://scam-shield-gules.vercel.app/.
Public GitHub deployment records identify two Vercel project environments,
`scam-shield` and `scam-shield-hjjp`. Confirm which existing project owns the alias
and is linked to `hhafil876-eng/ScamShield` before release. Account ownership and
dashboard environment settings could not be verified from this workspace.

Use the existing Vercel project with repository root `.`, install command `npm ci`,
build command `npm run build` and output directory `dist`. `vercel.js` sends `/api/*`
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
| Install/build command | `npm ci --omit=dev` |
| Start command | `npm start` |
| Node runtime | Node 24, satisfying the supported `>=22.12.0 <25` range |
| Readiness health check | `/api/ready` |
| Liveness endpoint | `/api/health` |
| Automatic deployment | Disabled in the prepared Blueprint |
| Port | Provider-assigned `PORT` |

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

The user confirmed earlier credential rotation. Private values also differed from
the values in Git history. During configuration inspection, populated credentials
were found in `server/.env.example` and exposed in tool output. The example was
scrubbed. The private JWT secret was subsequently rotated locally without printing
it. The Atlas password from that example still requires rotation through Atlas
Database Access. No Atlas admin API credentials or authenticated account session
were available to perform that operation here.

Save credentials only in private `server/.env` or hosting secret settings.
Environment examples contain placeholders. Actual environment files are ignored,
and the previously tracked `server/.env` is removed from the new source tree.

Atlas DNS returned three SRV records. All three connection attempts failed during
TLS negotiation with `ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR`. A TLS 1.2 diagnostic
with certificate verification enabled also failed. `/api/health` passed and
`/api/ready` returned 503. No Atlas test account was created.

Required account actions are to rotate the exposed database password, update the
private URI, verify that the existing cluster is active, verify Network Access
entries for the developer and Render outbound addresses, and confirm the database
user has access to the application database. The transport failure occurs before
authentication, so password correctness could not be established. If access rules
are already correct, investigate local TLS interception/firewalls and the Atlas
cluster with MongoDB support. Certificate verification remains enabled.

## Verification evidence

Checks were executed on 2026-11-17.

| Check | Actual result |
| --- | --- |
| Backend security regression suite | 13 passed, 0 failed, using isolated MongoDB |
| Scanner and hosting configuration tests | 5 passed, 0 failed |
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
| Live Atlas test | 1 health subtest passed, 1 integration test failed before account creation |
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

Before publication, complete Atlas rotation and connectivity, confirm the existing
Vercel project, assign the actual Render origin and set matching proxy secrets on
both platforms. Run `npm run test:atlas` in `server` and require live signup, login,
session persistence, logout and dedicated-account cleanup to pass. Following explicit
release approval, deploy and verify the same flows through the public frontend,
including rejected direct API requests, CSRF failures and rate limiting.

No push, merge, deployment or Git history rewrite is authorized by this document.
The current source commits remove the environment file but do not remove historical
blobs. A separate history-cleanup proposal requires explicit approval, a verified
backup, a clean mirror, removal of `server/.env` from all affected refs, verification
and coordinated collaborator recovery. Any remote history replacement would need
its own explicit approval. Credential rotation is required regardless of cleanup.

Configuration references are the official [Vercel rewrite documentation](https://vercel.com/docs/routing/rewrites),
[Vercel programmatic configuration documentation](https://vercel.com/docs/project-configuration/vercel-ts),
[Render Blueprint reference](https://render.com/docs/blueprint-spec) and
[MongoDB connection troubleshooting](https://www.mongodb.com/docs/atlas/troubleshoot-connection/).
