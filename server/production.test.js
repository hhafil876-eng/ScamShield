const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const crypto = require("node:crypto");
const { MongoMemoryServer } = require("mongodb-memory-server");

test("production entry point uses the assigned port and proxy settings", { timeout: 45000 }, async (t) => {
  const database = await MongoMemoryServer.create();
  const secret = crypto.randomBytes(48).toString("hex");
  const child = spawn(process.execPath, ["index.js"], {
    cwd: __dirname,
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: "0",
      MONGO_URI: database.getUri(),
      JWT_SECRET: crypto.randomBytes(48).toString("hex"),
      PROXY_SHARED_SECRET: secret,
      CLIENT_ORIGIN: "https://scam-shield-gules.vercel.app",
      TRUST_PROXY: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  // Consume diagnostics without printing credentials if an unexpected dependency fails.
  child.stderr.resume();
  try {
    const port = await new Promise((resolve, reject) => {
      let output = "";
      child.stdout.on("data", chunk => {
        output += chunk.toString();
        const match = output.match(/API running on port (\d+)/);
        if (match) resolve(Number(match[1]));
      });
      child.once("error", () => reject(new Error("Production process could not start.")));
      child.once("exit", () => reject(new Error("Production process exited before startup.")));
    });
    assert.ok(port > 0);
    const origin = `http://127.0.0.1:${port}`;
    await t.test("liveness responds on the assigned IPv4 port", async () => {
      assert.equal((await fetch(`${origin}/api/health`)).status, 200);
    });
    await t.test("readiness reports the connected database", async () => {
      let response;
      for (let attempt = 0; attempt < 50; attempt++) {
        response = await fetch(`${origin}/api/ready`);
        if (response.status === 200) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.ready, true);
      assert.equal(body.database.readyState, 1);
    });
    await t.test("production auth requires the trusted proxy and returns Secure CSRF cookies", async () => {
      assert.equal((await fetch(`${origin}/api/auth/csrf`)).status, 403);
      const response = await fetch(`${origin}/api/auth/csrf`, { headers: {
        "x-scamshield-proxy-secret": secret,
        "x-real-ip": "198.51.100.173",
        Origin: "https://scam-shield-gules.vercel.app",
      } });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("access-control-allow-origin"), "https://scam-shield-gules.vercel.app");
      const cookie = response.headers.getSetCookie().find(value => value.startsWith("scamshield_csrf="));
      assert.ok(cookie?.includes("Secure") && cookie.includes("SameSite=Strict"));
    });
  } finally {
    if (child.exitCode === null && child.signalCode === null) {
      const stopped = once(child, "exit");
      child.kill();
      await stopped;
    }
    await database.stop();
  }
});
