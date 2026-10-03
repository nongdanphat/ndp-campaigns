import * as esbuild from "esbuild";
import fs from "node:fs";

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const values = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    values[key] = value;
  }
  return values;
}

const env = readEnvFile(".env");
const apiRewriteTarget = (
  env.API_REWRITE_TARGET ||
  env.API_BASE_URL ||
  "https://dev-api.ndphat.com"
).replace(/\/$/, "");

await esbuild.build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  outfile: "dist/app.js",
  format: "iife",
  platform: "browser",
  target: "es2020",
  minify: true,
  legalComments: "none",
});

fs.copyFileSync("src/index.html", "dist/index.html");
fs.writeFileSync(
  "dist/_redirects",
  `# /v1 đi tới backend. Path chiến dịch còn lại trả về shell.
/v1/*  ${apiRewriteTarget}/v1/:splat  200
/*    /index.html   200
`
);
console.log(`Built dist. API rewrite: ${apiRewriteTarget}`);
