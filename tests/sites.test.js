// Checks the built sites (run `npm run build` first): SEO tags, accessibility basics,
// working internal links, the project's disclaimers, and no secrets in published files.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITES = ["hospital-a", "hospital-b"].map((id) => ({ id, dir: join(ROOT, "dist", id) }));
const built = SITES.every((s) => existsSync(join(s.dir, "index.html")));

const pagesOf = (dir) => readdirSync(dir).filter((f) => f.endsWith(".html"));
const all = (re, text) => [...text.matchAll(re)];
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

test("sites are built", { skip: built ? false : "run npm run build first" }, () => {
  for (const s of SITES) assert.ok(existsSync(join(s.dir, "agent-manifest.json")));
});

for (const site of SITES) {
  test(`${site.id}: every page has the SEO and accessibility basics`, { skip: !built }, () => {
    for (const file of pagesOf(site.dir)) {
      const html = readFileSync(join(site.dir, file), "utf8");
      const where = `${site.id}/${file}`;
      assert.match(html, /<html lang="en">/, `${where}: lang`);
      assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/, `${where}: viewport`);
      const title = /<title>([^<]+)<\/title>/.exec(html)?.[1] ?? "";
      assert.ok(title.length >= 15 && title.length <= 90, `${where}: title length ${title.length}`);
      const description = /<meta name="description" content="([^"]+)">/.exec(html)?.[1] ?? "";
      assert.ok(description.length >= 40 && description.length <= 300, `${where}: description length ${description.length}`);
      assert.match(html, /<link rel="canonical" href="https?:\/\/[^"]+">/, `${where}: canonical`);
      assert.match(html, /<meta property="og:image" content="https?:\/\/[^"]+og\.png">/, `${where}: og:image`);
      assert.equal(all(/<h1[\s>]/g, html).length, 1, `${where}: exactly one h1`);
      assert.match(html, /<a class="skip-link" href="#main">/, `${where}: skip link`);
      assert.match(html, /<main id="main">/, `${where}: main landmark`);
      assert.doesNotMatch(html, /\{\{[^}]*\}\}/, `${where}: leftover template token`);
      assert.doesNotMatch(html, /\sstyle="/, `${where}: inline style attribute`);
      assert.match(html, /Synthetic scenario\./, `${where}: synthetic banner`);
      const ids = all(/\sid="([^"]+)"/g, html).map((m) => m[1]);
      const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
      assert.deepEqual(dupes, [], `${where}: duplicate ids`);
      for (const m of all(/<input\b[^>]*\bid="([^"]+)"[^>]*>/g, html)) {
        if (/type="(hidden|radio)"/.test(m[0]) && /type="hidden"/.test(m[0])) continue;
        assert.ok(html.includes(`for="${m[1]}"`) || /aria-label(ledby)?=/.test(m[0]), `${where}: input #${m[1]} has no label`);
      }
      for (const m of all(/<img\b[^>]*>/g, html)) assert.match(m[0], /\balt="/, `${where}: img without alt`);
      for (const m of all(/\shref="(\/[^"#?]*)/g, html)) {
        const target = m[1] === "/" ? "index.html" : m[1].slice(1);
        assert.ok(existsSync(join(site.dir, target)), `${where}: broken link ${m[1]}`);
      }
    }
  });

  test(`${site.id}: doctor and patient pages say "Not medical advice."`, { skip: !built }, () => {
    for (const file of ["referral.html", "report.html"]) {
      assert.match(readFileSync(join(site.dir, file), "utf8"), /Not medical advice\./, `${site.id}/${file}`);
    }
    assert.match(readFileSync(join(site.dir, "workbench.html"), "utf8"), /Synthetic data\. Not for clinical use\. A human must approve\./);
  });

  test(`${site.id}: public agent files, discovery files and headers`, { skip: !built }, () => {
    const manifest = JSON.parse(readFileSync(join(site.dir, "agent-manifest.json"), "utf8"));
    assert.equal(manifest.networks[0].name, "dialect_lab_mapper");
    assert.equal(manifest.deployment.mode, "static");
    assert.equal(manifest.peer_policy.mode, "closed");
    assert.ok(!/contributor/.test(JSON.stringify(manifest)), "no contributor models");
    assert.ok(existsSync(join(site.dir, "dialect_lab_mapper.network.json")));
    for (const f of ["robots.txt", "sitemap.xml", "site.webmanifest", "vercel.json", "_headers", "links.json", "assets/img/og.png", "assets/img/icon-192.png", "assets/img/icon-512.png", "assets/img/apple-touch-icon.png", "assets/img/logo.svg"]) {
      assert.ok(existsSync(join(site.dir, f)), `${site.id}: missing ${f}`);
    }
    const vercel = readFileSync(join(site.dir, "vercel.json"), "utf8");
    assert.match(vercel, /"source": "\/agent-manifest.json"[\s\S]*?Access-Control-Allow-Origin/);
    assert.match(vercel, /sandbox-worker\.js[\s\S]*?default-src 'none'/);
    const sitemap = readFileSync(join(site.dir, "sitemap.xml"), "utf8");
    assert.doesNotMatch(sitemap, /404\.html/, "404 page is not in the sitemap");
  });

  test(`${site.id}: no API keys or secrets in any published file`, { skip: !built }, () => {
    const secret = /(sk-[A-Za-z0-9_-]{20,}|sk-or-[A-Za-z0-9_-]{20,}|otk_[A-Za-z0-9_]{20,}|AIza[0-9A-Za-z_-]{30,}|Bearer\s+[A-Za-z0-9._-]{20,})/;
    for (const file of walk(site.dir).filter((f) => /\.(html|js|json|txt|xml|css|webmanifest)$/.test(f) && !f.includes(`${site.id}\\runtime`) && !f.includes(`${site.id}/runtime`))) {
      assert.doesNotMatch(readFileSync(file, "utf8"), secret, file);
    }
  });
}

test("the answer key never ships to a site", { skip: !built }, () => {
  for (const s of SITES) {
    for (const file of walk(s.dir)) assert.ok(!/answers\.json$/.test(file), file);
  }
});
