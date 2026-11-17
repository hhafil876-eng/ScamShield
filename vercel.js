const apiOrigin = process.env.RENDER_API_ORIGIN;
if (!apiOrigin || new URL(apiOrigin).protocol !== "https:" || new URL(apiOrigin).origin !== apiOrigin) {
  throw new Error("Set RENDER_API_ORIGIN to the assigned HTTPS Render origin before deployment.");
}
if (!process.env.PROXY_SHARED_SECRET || process.env.PROXY_SHARED_SECRET.length < 32) {
  throw new Error("Set the same private PROXY_SHARED_SECRET on Vercel and Render.");
}

export const config = {
  framework: "vite",
  installCommand: "npm ci",
  buildCommand: "npm run build",
  outputDirectory: "dist",
  routes: [
    {
      src: "/api/(.*)",
      dest: `${apiOrigin}/api/$1`,
      headers: { "Cache-Control": "no-store", "x-vercel-enable-rewrite-caching": "0" },
      transforms: [{
        type: "request.headers",
        op: "set",
        target: { key: "x-scamshield-proxy-secret" },
        args: "$PROXY_SHARED_SECRET",
        env: ["PROXY_SHARED_SECRET"],
      }],
    },
    { handle: "filesystem" },
    { src: "/.*", dest: "/index.html" },
  ],
};
