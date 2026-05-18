import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const {
  PAGE_TEMPLATE_DEMO_CONTENT_PACK_NAME,
  getPageTemplateDemoHomeLinks,
  getPageTemplateDemoHomeNavigation,
  getPageTemplateDemoPage,
  pageTemplateDemoContentPack,
  pageTemplateDemoPreset,
} = await importShim();

async function importShim() {
  const testRoot = path.dirname(fileURLToPath(import.meta.url));
  const packageRoot = path.resolve(testRoot, "..");
  const smokeRoot = path.resolve(packageRoot, ".smoke-dist");
  const presetSmokeRoot = path.resolve(packageRoot, ".smoke-presets-dist");
  const distRoot = path.resolve(packageRoot, "dist");
  const presetsDistRoot = path.resolve(packageRoot, "..", "..", "lander", "lander-page-template-presets", "dist");
  const templatesDist = path.resolve(packageRoot, "..", "..", "lander", "lander-page-templates", "dist", "index.js").replace(/\\/g, "/");

  fs.rmSync(smokeRoot, { recursive: true, force: true });
  fs.rmSync(presetSmokeRoot, { recursive: true, force: true });
  fs.cpSync(distRoot, smokeRoot, { recursive: true });
  fs.cpSync(presetsDistRoot, presetSmokeRoot, { recursive: true });
  for (const file of fs.readdirSync(path.join(presetSmokeRoot, "presets"))) {
    if (!file.endsWith(".js")) continue;
    const target = path.join(presetSmokeRoot, "presets", file);
    fs.writeFileSync(
      target,
      fs.readFileSync(target, "utf8").replaceAll('"@mdwrk/lander-page-templates"', `"file:///${templatesDist}"`),
    );
  }
  const indexPath = path.join(smokeRoot, "index.js");
  const presetsDist = path.join(presetSmokeRoot, "index.js").replace(/\\/g, "/");
  fs.writeFileSync(
    indexPath,
    fs.readFileSync(indexPath, "utf8")
      .replaceAll('"@mdwrk/lander-page-template-presets"', `"file:///${presetsDist}"`)
      .replaceAll('"@mdwrk/lander-page-templates"', `"file:///${templatesDist}"`),
  );
  const imported = await import(`file:///${indexPath.replace(/\\/g, "/")}`);
  fs.rmSync(smokeRoot, { recursive: true, force: true });
  fs.rmSync(presetSmokeRoot, { recursive: true, force: true });
  return imported;
}

assert.equal(PAGE_TEMPLATE_DEMO_CONTENT_PACK_NAME, "@mdwrk/page-template-demo-content-pack");
assert.equal(pageTemplateDemoPreset.id, "preset.product-site");
assert.equal(pageTemplateDemoContentPack.presetId, "preset.product-site");
assert.equal(pageTemplateDemoContentPack.domain, "product");
assert.deepEqual(pageTemplateDemoContentPack.diagnostics.filter((item) => item.level === "error"), []);

const home = getPageTemplateDemoPage("/demo/");
assert.equal(home?.title, "Acme Notebook");
assert.equal(home?.kind, "home");
assert.ok(home?.sections.length > 0);
assert.ok(home?.schema.some((item) => item.kind === "SoftwareApplication"));

const links = getPageTemplateDemoHomeLinks();
assert.deepEqual(links.children.map((link) => link.href), ["/demo/features/core/", "/demo/pricing/"]);
assert.deepEqual(links.legal.map((link) => link.href), ["/demo/privacy/", "/demo/terms/"]);

const navigation = getPageTemplateDemoHomeNavigation();
assert.deepEqual(
  navigation.related.map((item) => item.href),
  ["/demo/features/core/", "/demo/pricing/", "/demo/support/", "/demo/privacy/", "/demo/terms/"],
);

assert.ok(getPageTemplateDemoPage("/demo/features/core/"));
assert.ok(getPageTemplateDemoPage("/demo/pricing/"));
assert.ok(getPageTemplateDemoPage("/demo/support/"));
