const fs = require("node:fs");
const { execFileSync } = require("node:child_process");

const git = (args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const staged = process.argv.includes("--staged");
const sensitiveValues = new Set();
const collectValues = (source) => {
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^(?:JWT_SECRET|PROXY_SHARED_SECRET|MONGO_URI|MONGO_URL)=(.*)$/);
    if (match && match[1].trim().length >= 16) sensitiveValues.add(match[1].trim());
  }
};
if (fs.existsSync("server/.env")) collectValues(fs.readFileSync("server/.env", "utf8"));
for (const commit of git(["log", "--all", "--format=%H", "--", "server/.env"]).trim().split("\n").filter(Boolean)) {
  try { collectValues(git(["show", `${commit}:server/.env`])); } catch { /* A removal commit has no environment blob. */ }
}
const files = (staged
  ? git(["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"])
  : git(["ls-files", "--cached", "--others", "--exclude-standard", "-z"]))
  .split("\0").filter(Boolean);
const findings = [];
for (const file of new Set(files)) {
  const privateEnvironment = /(^|\/)\.env($|\.(?!example$))/.test(file);
  if (privateEnvironment) {
    if (staged) findings.push(`${file} contains a private environment file`);
    continue;
  }
  if (!staged && !fs.existsSync(file)) continue;
  const source = staged ? git(["show", `:${file}`]) : fs.readFileSync(file, "utf8");
  if ([...sensitiveValues].some(value => source.includes(value))) findings.push(`${file} contains a current or historically exposed credential value`);
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(source)) findings.push(`${file} contains a private key`);
  const connections = source.match(/mongodb(?:\+srv)?:\/\/[^\s'"`]+/g) || [];
  if (connections.some(value => value.includes("@") && !/[<>]/.test(value))) findings.push(`${file} contains populated database credentials`);
  if (/^\s*(?:JWT_SECRET|PROXY_SHARED_SECRET)\s*=\s*[a-f0-9]{32,}\s*$/mi.test(source)) findings.push(`${file} contains a populated signing or proxy secret`);
}
if (findings.length) {
  console.error(findings.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Secret-pattern scan passed for ${new Set(files).size} ${staged ? "staged" : "project"} paths. Values were suppressed.`);
}
