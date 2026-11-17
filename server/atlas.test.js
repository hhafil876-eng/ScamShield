const { test } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const mongoose = require("mongoose");

test("live Atlas health, readiness and dedicated-account authentication", { timeout: 45000 }, async (t) => {
  process.env.NODE_ENV = "test";
  const app = require("./index");
  app.set("trust proxy", "loopback");
  const address = `fd00::${crypto.randomBytes(2).toString("hex")}:${crypto.randomBytes(2).toString("hex")}`;
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const jar = new Map();
  let userId;
  const request = async (path, options = {}) => {
    const headers = { "X-Forwarded-For": address, Cookie: [...jar].map(([key, value]) => `${key}=${value}`).join("; "), ...options.headers };
    const response = await fetch(`${base}${path}`, { ...options, headers });
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(";")[0];
      const split = pair.indexOf("=");
      jar.set(pair.slice(0, split), pair.slice(split + 1));
    }
    return response;
  };
  const post = async (path, body) => {
    const csrf = await (await request("/api/auth/csrf")).json();
    return request(path, { method: "POST", headers: {
      "Content-Type": "application/json", "X-CSRF-Token": csrf.csrfToken,
    }, body: JSON.stringify(body) });
  };
  try {
    await t.test("API health responds", async () => assert.equal((await request("/api/health")).status, 200));
    try {
      await mongoose.connection.asPromise();
    } catch {
      console.log(`Atlas readiness HTTP status: ${(await request("/api/ready")).status}`);
      assert.fail("Atlas connection failed. Live signup, login, session and logout checks could not run.");
    }
    assert.equal((await request("/api/ready")).status, 200);
    const email = `scamshield-release-${crypto.randomUUID()}@example.test`;
    const password = crypto.randomBytes(24).toString("hex");
    const registration = await post("/api/auth/register", { name: "Dedicated Release Test", email, password });
    const body = await registration.json();
    userId = body.user?.id;
    assert.equal(registration.status, 201);
    assert.equal((await request("/api/auth/me")).status, 200);
    assert.equal((await post("/api/auth/login", { email, password: "incorrect-password" })).status, 401);
    assert.equal((await post("/api/auth/login", { email, password })).status, 200);
    const token = jar.get("scamshield_token");
    assert.equal((await request("/api/auth/me")).status, 200);
    assert.equal((await post("/api/auth/logout", {})).status, 200);
    assert.equal((await request("/api/auth/me")).status, 401);
    assert.equal((await request("/api/auth/me", { headers: { Cookie: `scamshield_token=${token}` } })).status, 401);
  } finally {
    if (mongoose.connection.readyState === 1) {
      if (userId) {
        await require("./models/authSession").deleteMany({ userId });
        await require("./models/user").deleteOne({ _id: userId });
      }
      const addressHash = crypto.createHmac("sha256", process.env.JWT_SECRET).update(address).digest("hex");
      await require("./models/authAttempt").deleteMany({ _id: { $regex: `^${addressHash}:` } });
    }
    await mongoose.disconnect();
    await new Promise(resolve => server.close(resolve));
  }
});
