import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const templates = await import("../../lander-page-templates/dist/index.js");
const testRoot = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(testRoot, "..");
const distRoot = path.resolve(packageRoot, "dist");
const smokeRoot = path.resolve(packageRoot, ".smoke-dist");
const templateDist = path.resolve(packageRoot, "..", "lander-page-templates", "dist", "index.js").replace(/\\/g, "/");

fs.rmSync(smokeRoot, { recursive: true, force: true });
fs.cpSync(distRoot, smokeRoot, { recursive: true });
for (const file of fs.readdirSync(path.join(smokeRoot, "presets"))) {
  if (!file.endsWith(".js")) continue;
  const target = path.join(smokeRoot, "presets", file);
  fs.writeFileSync(
    target,
    fs.readFileSync(target, "utf8").replaceAll('"@mdwrk/lander-page-templates"', `"file:///${templateDist}"`),
  );
}

const {
  createDocsHubPreset,
  createEducationPathPreset,
  createFaqHubPreset,
  createPackageCatalogPreset,
  createProductSitePreset,
  createTrustCenterPreset,
} = await import(`file:///${path.join(smokeRoot, "index.js").replace(/\\/g, "/")}`);

fs.rmSync(smokeRoot, { recursive: true, force: true });

const presets = [
  createProductSitePreset({ title: "Example Product" }),
  createFaqHubPreset({ baseSlug: "/help" }),
  createEducationPathPreset({ baseSlug: "/academy" }),
  createDocsHubPreset(),
  createPackageCatalogPreset(),
  createTrustCenterPreset(),
];

for (const preset of presets) {
  const diagnostics = templates.validateTemplateGraph(preset.graph);
  assert.deepEqual(diagnostics.filter((item) => item.level === "error"), [], preset.id);
  const result = templates.buildPageSpecsFromGraph(preset.graph);
  assert.deepEqual(result.diagnostics.filter((item) => item.level === "error"), [], preset.id);
  assert.equal(result.pages.length, preset.graph.instances.length, preset.id);
  assert.ok(result.pages.every((page) => page.slug && page.title && page.sections.length > 0), preset.id);
}

const education = createEducationPathPreset({ baseSlug: "/academy" });
assert.equal(templates.resolveLinkSlots(education.graph, "education:path").courses[0].href, "/academy/learn/course/");
assert.equal(templates.resolveLinkSlots(education.graph, "education:course").modules[0].href, "/academy/learn/course/module/");
assert.equal(templates.resolveLinkSlots(education.graph, "education:module").quizzes[0].href, "/academy/learn/course/module/quiz/");

const product = createProductSitePreset();
assert.deepEqual(
  templates.deriveTemplateNavigation(product.graph, "product:home").related.map((item) => item.href),
  ["/features/core/", "/support/", "/privacy/", "/terms/"],
);

const docs = createDocsHubPreset();
assert.equal(templates.deriveTemplateNavigation(docs.graph, "docs:guide").next?.href, "/docs/tutorial/");
