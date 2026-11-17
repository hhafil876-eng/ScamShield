const { test } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

test("frontend credential migration and authentication failure handling", async () => {
  const fs = require("node:fs");
  const values = new Map([
    ["scamshieldUsers", JSON.stringify([{ password: "legacy-password" }])],
    ["scamshieldSession", JSON.stringify({ id: "legacy", name: "Audit", password: "legacy-password", token: "legacy-token" })],
  ]);
  const originalFetch = global.fetch;
  global.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  try {
    const source = fs.readFileSync(require("node:path").resolve(__dirname, "../src/utils/auth.js"), "utf8")
      .replace("import.meta.env.VITE_API_URL", '"http://localhost:5000"');
    const auth = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
    assert.equal(values.has("scamshieldUsers"), false);
    assert.equal(auth.getSession().password, undefined);
    assert.equal(auth.getSession().token, undefined);
    global.fetch = async url => url.endsWith("/csrf")
      ? { ok: true, json: async () => ({ csrfToken: "test-csrf" }) }
      : { ok: false, status: 403, json: async () => ({ success: false }) };
    assert.equal((await auth.logoutUser()).success, false);
    assert.ok(auth.getSession());
    assert.equal(await auth.fetchCurrentUserProfile(), null);
    assert.equal(auth.getSession(), null);
    assert.equal((await auth.deleteCurrentUser()).success, false);
  } finally {
    global.fetch = originalFetch;
    delete global.localStorage;
  }
});

test("production authentication security integration", async (t) => {
  const database = await MongoMemoryServer.create();
  process.env.NODE_ENV = "production";
  process.env.MONGO_URI = database.getUri();
  process.env.JWT_SECRET = crypto.randomBytes(48).toString("hex");
  process.env.JWT_EXPIRES_IN = "2h";
  process.env.PROXY_SHARED_SECRET = crypto.randomBytes(48).toString("hex");
  process.env.CLIENT_ORIGIN = "https://app.scamshield.test";
  const app = require("./index");
  process.env.NODE_ENV = "production";
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const User = require("./models/user");
  const jar = new Map();
  const request = async (path, options = {}) => {
    const headers = {
      "x-scamshield-proxy-secret": process.env.PROXY_SHARED_SECRET,
      "x-real-ip": "192.0.2.1",
      ...options.headers,
    };
    if (!headers.Cookie) headers.Cookie = [...jar].map(([key, value]) => `${key}=${value}`).join("; ");
    const response = await fetch(`${base}${path}`, { ...options, headers });
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(";");
      const split = pair.indexOf("=");
      jar.set(pair.slice(0, split), pair.slice(split + 1));
    }
    return response;
  };
  const csrf = async () => (await (await request("/api/auth/csrf")).json()).csrfToken;
  const post = async (path, body, token) => request(path, {
    method: "POST", headers: { "Content-Type": "application/json", "X-CSRF-Token": token ?? await csrf() },
    body: JSON.stringify(body),
  });

  try {
    await mongoose.connection.asPromise();
    await t.test("production proxy rejects direct access and invalid visitor addresses", async () => {
      assert.equal((await request("/api/auth/csrf", { headers: { "x-scamshield-proxy-secret": "" } })).status, 403);
      assert.equal((await request("/api/auth/csrf", { headers: { "x-real-ip": "not-an-address" } })).status, 400);
    });
    await t.test("MongoDB ready and production CORS allowlist", async () => {
      assert.equal((await request("/api/ready")).status, 200);
      const allowed = await request("/api/health", { headers: { Origin: process.env.CLIENT_ORIGIN } });
      assert.equal(allowed.headers.get("access-control-allow-origin"), process.env.CLIENT_ORIGIN);
      assert.equal(allowed.headers.get("access-control-allow-credentials"), "true");
      for (const origin of ["https://attacker.test", "http://localhost:5173"]) {
        const denied = await request("/api/health", { headers: { Origin: origin } });
        assert.equal(denied.headers.get("access-control-allow-origin"), null);
      }
      const preflight = await request("/api/auth/login", { method: "OPTIONS", headers: {
        Origin: process.env.CLIENT_ORIGIN, "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type,x-csrf-token",
      } });
      assert.equal(preflight.status, 204);
    });
    await t.test("CSRF missing, mismatched, forged and missing-cookie tokens rejected on all auth mutations", async () => {
      const token = await csrf();
      for (const path of ["/api/auth/login", "/api/auth/register", "/api/auth/logout"]) {
        assert.equal((await request(path, { method: "POST" })).status, 403);
        assert.equal((await post(path, {}, "mismatch")).status, 403);
        const forged = `${"a".repeat(64)}.${"b".repeat(64)}`;
        assert.equal((await request(path, { method: "POST", headers: {
          Cookie: `scamshield_csrf=${forged}`, "X-CSRF-Token": forged,
        } })).status, 403);
        assert.equal((await request(path, { method: "POST", headers: {
          Cookie: "unrelated=1", "X-CSRF-Token": token,
        } })).status, 403);
      }
    });
    await t.test("registration validation rejects object injection, malformed email and bcrypt truncation", async () => {
      for (const body of [null, {}, { name: {}, email: "a@b.test", password: "123456" },
        { name: "Audit", email: { $ne: null }, password: "123456" },
        { name: "Audit", email: "bad", password: "123456" },
        { name: "Audit", email: "a@b.test", password: "x".repeat(73) },
        { name: "Audit", email: "a@b.test", password: "short" }]) {
        assert.equal((await post("/api/auth/register", body)).status, 400);
      }
    });
    let user;
    let oldCsrf;
    let registrationToken;
    await t.test("register hashes password, omits secrets and sets production cookies with JWT-aligned expiry", async () => {
      const response = await post("/api/auth/register", { name: "Security Audit", email: "audit@example.test", password: "Audit-test-123!" });
      assert.equal(response.status, 201);
      const body = await response.json();
      user = body.user;
      assert.equal(body.token, undefined);
      assert.equal(body.user.password, undefined);
      const stored = await User.findById(user.id).select("+password");
      assert.match(stored.password, /^\$2[aby]\$12\$/);
      assert.equal(await stored.matchPassword("Audit-test-123!"), true);
      const cookie = response.headers.getSetCookie().find(value => value.startsWith("scamshield_token="));
      assert.match(cookie, /HttpOnly/);
      assert.match(cookie, /Secure/);
      assert.match(cookie, /SameSite=Strict/);
      assert.match(cookie, /Max-Age=7[12]\d\d/);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.equal((await request("/api/auth/me")).status, 200);
      oldCsrf = body.csrfToken;
      registrationToken = jar.get("scamshield_token");
    });
    await t.test("login validation, wrong password, persistence, expired and invalid JWT", async () => {
      assert.equal((await post("/api/auth/login", { email: { $ne: null }, password: "123456" })).status, 400);
      assert.equal((await post("/api/auth/login", { email: "audit@example.test", password: "wrong" })).status, 401);
      assert.equal((await post("/api/auth/login", { email: " AUDIT@example.test ", password: "Audit-test-123!" })).status, 200);
      assert.equal((await request("/api/auth/me")).status, 200);
      for (const token of ["invalid", jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: -1 })]) {
        assert.equal((await request("/api/auth/me", { headers: { Cookie: `scamshield_token=${token}` } })).status, 401);
      }
    });
    await t.test("CSRF is session-bound and logout clears both cookies", async () => {
      const currentToken = jar.get("scamshield_token");
      assert.equal((await request("/api/auth/logout", { method: "POST", headers: {
        Cookie: `scamshield_token=different; scamshield_csrf=${oldCsrf}`, "X-CSRF-Token": oldCsrf,
      } })).status, 403);
      assert.ok(currentToken);
      const response = await post("/api/auth/logout", {});
      assert.equal(response.status, 200);
      for (const cookie of response.headers.getSetCookie()) assert.match(cookie, /Expires=Thu, 01 Jan 1970/);
      assert.equal((await request("/api/auth/me")).status, 401);
      assert.equal((await request("/api/auth/me", { headers: { Cookie: `scamshield_token=${currentToken}` } })).status, 401);
      assert.equal((await request("/api/auth/me", { headers: { Cookie: `scamshield_token=${registrationToken}` } })).status, 200);
    });
    await t.test("concurrent rate limits are shared in MongoDB", async () => {
      const token = await csrf();
      const responses = await Promise.all(Array.from({ length: 30 }, () => request("/api/auth/login", {
        method: "POST",
        headers: { "x-real-ip": "198.51.100.42", "X-CSRF-Token": token, "Content-Type": "application/json" },
        body: "{}",
      })));
      assert.equal(responses.filter(response => response.status === 400).length, 20);
      assert.equal(responses.filter(response => response.status === 429).length, 10);
    });
    await t.test("account deletion requires authentication and CSRF and invalidates every session", async () => {
      const AuthSession = require("./models/authSession");
      assert.equal((await request("/api/auth/account", { method: "DELETE" })).status, 403);
      const token = await csrf();
      assert.equal((await request("/api/auth/account", { method: "DELETE", headers: { "X-CSRF-Token": token } })).status, 401);
      jar.set("scamshield_token", registrationToken);
      const authToken = await csrf();
      const response = await request("/api/auth/account", { method: "DELETE", headers: { "X-CSRF-Token": authToken } });
      assert.equal(response.status, 200);
      assert.equal(await User.findById(user.id), null);
      assert.equal(await AuthSession.countDocuments({ userId: user.id }), 0);
      assert.equal((await request("/api/auth/me", { headers: { Cookie: `scamshield_token=${registrationToken}` } })).status, 401);
    });
    await t.test("rate limiting returns 429 with Retry-After and ignores spoofed forwarding headers", async () => {
      let response;
      for (let index = 0; index < 22; index++) {
        response = await post("/api/auth/login", { email: "bad@example.test", password: "bad" });
        if (response.status === 429) break;
      }
      assert.equal(response.status, 429);
      assert.ok(Number(response.headers.get("retry-after")) > 0);
      const token = await csrf();
      const spoofed = await request("/api/auth/login", { method: "POST", headers: {
        "X-CSRF-Token": token, "X-Forwarded-For": "192.0.2.123",
      } });
      assert.equal(spoofed.status, 429);
    });
    await t.test("disconnected database returns readiness and auth 503", async () => {
      await mongoose.disconnect();
      assert.equal((await request("/api/ready")).status, 503);
      assert.equal((await request("/api/auth/me")).status, 503);
      assert.equal((await request("/api/health")).status, 200);
    });
  } finally {
    await mongoose.disconnect();
    await new Promise(resolve => server.close(resolve));
    await database.stop();
  }
});
