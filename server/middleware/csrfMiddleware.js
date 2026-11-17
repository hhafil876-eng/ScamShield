const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const cookieOptions = () => ({
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  path: "/",
});

const signCsrf = (nonce, session = "") => crypto
  .createHmac("sha256", process.env.JWT_SECRET)
  .update(`${nonce.length}:${nonce}:${session}`)
  .digest("hex");

const generateCsrfToken = (session = "") => {
  const nonce = crypto.randomBytes(32).toString("hex");
  return `${nonce}.${signCsrf(nonce, session)}`;
};

const setCsrfCookie = (res, csrfToken, maxAge = 7 * 86400000) => {
  res.cookie("scamshield_csrf", csrfToken, {
    ...cookieOptions(), httpOnly: false, maxAge,
  });
};

const setAuthCookies = (res, token, csrfToken) => {
  const maxAge = Math.max(0, jwt.decode(token).exp * 1000 - Date.now());
  res.cookie("scamshield_token", token, {
    ...cookieOptions(), httpOnly: true, maxAge,
  });
  setCsrfCookie(res, csrfToken, maxAge);
};

const clearAuthCookies = (res) => {
  res.clearCookie("scamshield_token", { ...cookieOptions(), httpOnly: true });
  res.clearCookie("scamshield_csrf", { ...cookieOptions(), httpOnly: false });
};

const verifyCsrf = (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const cookie = req.cookies?.scamshield_csrf;
  const header = req.headers["x-csrf-token"];
  if (typeof cookie === "string" && typeof header === "string" &&
      cookie === header && /^[a-f0-9]{64}\.[a-f0-9]{64}$/.test(header)) {
    const [nonce, signature] = header.split(".");
    const expected = signCsrf(nonce, req.cookies?.scamshield_token || "");
    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return next();
  }
  return res.status(403).json({ success: false, message: "Invalid or missing CSRF token." });
};

module.exports = { generateCsrfToken, setCsrfCookie, setAuthCookies, clearAuthCookies, verifyCsrf };
