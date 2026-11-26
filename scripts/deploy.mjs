// Deploy both hospital sites to Vercel production: builds with the production URLs, links each
// dist folder to its Vercel project (dialect-hospital-a / dialect-hospital-b), removes the
// .env.local and .gitignore that `vercel link` writes (they never belong in a published folder),
// then deploys. Needs the Vercel CLI, logged in. Usage: npm run deploy
import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITES = ["hospital-a", "hospital-b"];
const run = (cmd, cwd = ROOT) => execSync(cmd, { cwd, stdio: "inherit" });

run("node scripts/build-sites.mjs --env production");
run("npm test");
for (const id of SITES) {
  const dir = join(ROOT, "dist", id);
  run(`vercel link --yes --project dialect-${id}`, dir);
  for (const f of [".env.local", ".gitignore"]) if (existsSync(join(dir, f))) rmSync(join(dir, f));
  run("vercel deploy --prod --yes", dir);
}
console.log("\nDeployed: https://dialect-hospital-a.vercel.app and https://dialect-hospital-b.vercel.app");
console.log("Run `npm run build` to get the local build back for npm run serve:a / serve:b.");
