import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { parse } from 'yaml';

test('Render Blueprint targets the reviewed branch and provider-assigned port', () => {
  const blueprint = parse(readFileSync(new URL('../render.yaml', import.meta.url), 'utf8'));
  assert.equal(blueprint.services.length, 1);
  const service = blueprint.services[0];
  assert.equal(service.name, 'scamshield-api');
  assert.equal(service.repo, 'https://github.com/hhafil876-eng/ScamShield');
  assert.equal(service.branch, 'security-fix');
  assert.equal(service.rootDir, 'server');
  assert.equal(service.plan, 'free');
  assert.equal(service.buildCommand, 'npm ci --omit=dev');
  assert.equal(service.startCommand, 'npm start');
  assert.equal(service.healthCheckPath, '/api/health');
  assert.equal(service.autoDeployTrigger, 'off');
  const variables = new Map(service.envVars.map(entry => [entry.key, entry]));
  assert.equal(variables.get('NODE_ENV').value, 'production');
  assert.equal(variables.has('PORT'), false);
  for (const key of ['MONGO_URI', 'JWT_SECRET', 'PROXY_SHARED_SECRET']) {
    assert.equal(variables.get(key).sync, false);
    assert.equal(variables.get(key).value, undefined);
  }
});

test('Vercel configuration fails closed without assigned hosting settings', async () => {
  const source = readFileSync(new URL('../vercel.mjs', import.meta.url), 'utf8');
  const originalOrigin = process.env.RENDER_API_ORIGIN;
  const originalSecret = process.env.PROXY_SHARED_SECRET;
  const load = () => import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#${randomBytes(4).toString('hex')}`);
  try {
    delete process.env.RENDER_API_ORIGIN;
    await assert.rejects(load(), /RENDER_API_ORIGIN/);
    process.env.RENDER_API_ORIGIN = 'https://render-origin.example.test';
    delete process.env.PROXY_SHARED_SECRET;
    await assert.rejects(load(), /PROXY_SHARED_SECRET/);
    process.env.PROXY_SHARED_SECRET = randomBytes(48).toString('hex');
    const { config } = await load();
    assert.equal(config.routes[0].dest, 'https://render-origin.example.test/api/$1');
    assert.equal(config.routes[0].headers['Cache-Control'], 'no-store');
    assert.equal(config.routes[0].transforms[0].args, '$PROXY_SHARED_SECRET');
    assert.equal(JSON.stringify(config).includes(process.env.PROXY_SHARED_SECRET), false);
    assert.deepEqual(config.routes[1], { handle: 'filesystem' });
    assert.equal(config.routes[2].dest, '/index.html');
    assert.equal(config.outputDirectory, 'dist');
  } finally {
    if (originalOrigin === undefined) delete process.env.RENDER_API_ORIGIN;
    else process.env.RENDER_API_ORIGIN = originalOrigin;
    if (originalSecret === undefined) delete process.env.PROXY_SHARED_SECRET;
    else process.env.PROXY_SHARED_SECRET = originalSecret;
  }
});

test('frontend authentication uses exactly one same-origin API prefix', async () => {
  const source = readFileSync(new URL('../src/utils/auth.js', import.meta.url), 'utf8')
    .replace('import.meta.env.VITE_API_URL', 'undefined');
  const originalFetch = global.fetch;
  const storageDescriptor = Object.getOwnPropertyDescriptor(global, 'localStorage');
  const values = new Map();
  const requests = [];
  Object.defineProperty(global, 'localStorage', { configurable: true, value: {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  } });
  global.fetch = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, status: 200, json: async () => ({
      success: true, csrfToken: 'test-csrf', user: { id: 'test-user', name: 'Hosting Test', email: 'hosting@example.test' },
    }) };
  };
  try {
    const auth = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}#routing-check`);
    assert.equal((await auth.createUser({ name: 'Hosting Test', email: 'hosting@example.test', password: 'test-only-password' })).success, true);
    assert.equal((await auth.loginUser('hosting@example.test', 'test-only-password')).success, true);
    assert.ok(await auth.fetchCurrentUserProfile());
    assert.equal((await auth.logoutUser()).success, true);
    assert.equal((await auth.deleteCurrentUser()).success, true);
    for (const request of requests) {
      assert.match(request.url, /^\/api\/auth\//);
      assert.equal(request.url.includes('/api/api/'), false);
      assert.equal(request.options.credentials, 'include');
    }
    assert.equal(requests.some(request => request.url === '/api/auth/register'), true);
    assert.equal(requests.some(request => request.url === '/api/auth/account' && request.options.method === 'DELETE'), true);
  } finally {
    global.fetch = originalFetch;
    if (storageDescriptor) Object.defineProperty(global, 'localStorage', storageDescriptor);
    else delete global.localStorage;
  }
});
