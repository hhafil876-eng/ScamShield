import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

test('Vercel configuration fails closed without assigned hosting settings', async () => {
  const source = readFileSync(new URL('../vercel.js', import.meta.url), 'utf8');
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
