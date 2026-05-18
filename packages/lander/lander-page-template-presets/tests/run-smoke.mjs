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
  buildPresetGraphFromMaps,
} = await import(`file:///${path.join(smokeRoot, "index.js").replace(/\\/g, "/")}`);

fs.rmSync(smokeRoot, { recursive: true, force: true });

const coveredFeatures = new Set();
function covers(featureId, assertion) {
  assertion();
  coveredFeatures.add(featureId);
}

const defaultGraphCoveredFeatures = new Set();
function coversDefaultGraph(featureId, assertion) {
  assertion();
  defaultGraphCoveredFeatures.add(featureId);
}

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
  ["/product/", "/features/core/", "/compare/", "/pricing/", "/customers/story/", "/changelog/", "/support/", "/privacy/", "/terms/"],
);

const docs = createDocsHubPreset();
assert.equal(templates.deriveTemplateNavigation(docs.graph, "docs:guide").next?.href, "/docs/reference/");

const authoredProduct = createProductSitePreset({
  title: "Authored Product",
  pages: {
    home: {
      title: "Authored Home",
      description: "Authored home description.",
      data: {
        summary: "Authored home summary.",
        intro: "Authored home intro with enough copy for a meaningful generated page.",
      },
    },
    featureTwo: {
      id: "product:feature-two",
      templateId: "product.feature",
      slug: "/features/two/",
      title: "Feature Two",
      description: "Second feature page.",
      summary: "Second feature summary.",
      order: 2,
    },
  },
  links: {
    home: {
      children: ["feature", "featureTwo"],
    },
  },
});

assert.equal(authoredProduct.graph.instances.find((item) => item.id === "product:home").title, "Authored Home");
assert.deepEqual(
  templates.resolveLinkSlots(authoredProduct.graph, "product:home").children.map((link) => link.href),
  ["/features/core/", "/features/two/"],
);
assert.equal(templates.resolveIncomingLinkSlots(authoredProduct.graph, "product:feature-two")["incoming:children"][0].href, "/");
assert.deepEqual(templates.validateTemplateGraph(authoredProduct.graph).filter((item) => item.level === "error"), []);

assert.throws(() => buildPresetGraphFromMaps({
  bundles: product.bundles,
  pages: {},
  links: { missing: { children: ["also-missing"] } },
}), /not a known page/);

covers("feat:lander.page-template-presets.types", () => {
  assert.equal(product.id, "preset.product-site");
  assert.ok(Array.isArray(product.bundles));
  assert.ok(product.graph.instances.every((item) => item.id && item.templateId && item.slug));
});

covers("feat:lander.page-template-presets.authored-page-content", () => {
  const home = authoredProduct.graph.instances.find((item) => item.id === "product:home");
  assert.equal(home.title, "Authored Home");
  assert.equal(home.data.summary, "Authored home summary.");
  assert.equal(home.data.intro, "Authored home intro with enough copy for a meaningful generated page.");
});

covers("feat:lander.page-template-presets.named-page-map", () => {
  const featureTwo = authoredProduct.graph.instances.find((item) => item.id === "product:feature-two");
  assert.equal(featureTwo.templateId, "product.feature");
  assert.equal(featureTwo.slug, "/features/two/");
});

covers("feat:lander.page-template-presets.named-link-map", () => {
  assert.deepEqual(
    authoredProduct.graph.edges
      .filter((item) => item.sourceId === "product:home" && item.slotId === "children")
      .map((item) => item.targetId),
    ["product:feature", "product:feature-two"],
  );
});

covers("feat:lander.page-template-presets.authored-graph-builder", () => {
  const graph = buildPresetGraphFromMaps({
    bundles: product.bundles,
    pages: {
      start: {
        id: "product:start",
        templateId: "product.home",
        slug: "/start/",
        title: "Start",
        description: "Start page.",
        summary: "Start summary.",
      },
      feature: {
        id: "product:start-feature",
        templateId: "product.feature",
        slug: "/start/feature/",
        title: "Start Feature",
        description: "Start feature page.",
        summary: "Feature summary.",
      },
    },
    links: { start: { children: ["feature"] } },
  });
  assert.equal(graph.instances.length, 2);
  assert.equal(templates.resolveLinkSlots(graph, "product:start").children[0].href, "/start/feature/");
});

covers("feat:lander.page-template-presets.authoring-topology-smoke-tests", () => {
  assert.deepEqual(templates.validateTemplateGraph(authoredProduct.graph).filter((item) => item.level === "error"), []);
  assert.throws(() => buildPresetGraphFromMaps({
    bundles: product.bundles,
    pages: {},
    links: { missing: { children: ["also-missing"] } },
  }), /not a known page/);
});

assert.deepEqual([...coveredFeatures].sort(), [
  "feat:lander.page-template-presets.authored-graph-builder",
  "feat:lander.page-template-presets.authored-page-content",
  "feat:lander.page-template-presets.authoring-topology-smoke-tests",
  "feat:lander.page-template-presets.named-link-map",
  "feat:lander.page-template-presets.named-page-map",
  "feat:lander.page-template-presets.types",
]);

const faq = createFaqHubPreset({ baseSlug: "/help" });
const packageCatalog = createPackageCatalogPreset();
const trust = createTrustCenterPreset();

coversDefaultGraph("feat:lander.page-template-presets.product-site", () => {
  assert.deepEqual(product.graph.instances.map((item) => item.id), [
    "product:home",
    "product:detail",
    "product:feature",
    "product:compare",
    "product:pricing",
    "product:case-study",
    "product:changelog",
    "support:hub",
    "trust:privacy",
    "trust:terms",
  ]);
  assert.equal(templates.resolveLinkSlots(product.graph, "product:home").children.length, 6);
});

coversDefaultGraph("feat:lander.page-template-presets.faq-hub", () => {
  assert.deepEqual(faq.graph.instances.map((item) => item.templateId), [
    "support.hub",
    "support.qa",
    "support.qa",
    "support.article",
    "support.contact",
    "support.status",
    "support.ticket-intent",
  ]);
  assert.equal(templates.resolveLinkSlots(faq.graph, "support:hub").questions.length, 2);
});

coversDefaultGraph("feat:lander.page-template-presets.education-path", () => {
  assert.deepEqual(education.graph.instances.map((item) => item.templateId), [
    "education.learning-path",
    "education.course",
    "education.module",
    "education.quiz",
    "education.assessment",
    "education.certificate",
  ]);
  assert.equal(templates.resolveLinkSlots(education.graph, "education:module").quizzes.length, 2);
});

coversDefaultGraph("feat:lander.page-template-presets.docs-hub", () => {
  assert.deepEqual(docs.graph.instances.map((item) => item.templateId), [
    "docs.hub",
    "docs.guide",
    "docs.reference",
    "docs.api",
    "docs.tutorial",
    "docs.troubleshooting",
    "docs.release-note",
  ]);
  assert.equal(templates.deriveTemplateNavigation(docs.graph, "docs:api").next?.href, "/docs/tutorial/");
});

coversDefaultGraph("feat:lander.page-template-presets.package-catalog", () => {
  assert.deepEqual(packageCatalog.graph.instances.map((item) => item.templateId), [
    "package.catalog",
    "package.detail",
    "package.api",
    "package.plugin",
    "package.integration",
    "package.version",
  ]);
  assert.equal(templates.resolveLinkSlots(packageCatalog.graph, "package:catalog").packages.length, 3);
});

coversDefaultGraph("feat:lander.page-template-presets.trust-center", () => {
  assert.deepEqual(trust.graph.instances.map((item) => item.templateId), [
    "trust.hub",
    "trust.privacy",
    "trust.terms",
    "trust.security",
    "trust.compliance",
    "trust.policy",
    "trust.legal",
    "trust.support",
  ]);
  assert.equal(templates.resolveLinkSlots(trust.graph, "trust:hub").legal.length, 6);
});

coversDefaultGraph("feat:lander.page-template-presets.smoke-tests", () => {
  for (const preset of [product, faq, education, docs, packageCatalog, trust]) {
    assert.deepEqual(templates.validateTemplateGraph(preset.graph).filter((item) => item.level === "error"), [], preset.id);
    assert.equal(templates.buildPageSpecsFromGraph(preset.graph).pages.length, preset.graph.instances.length);
  }
});

coversDefaultGraph("feat:lander.page-template-presets.product-site-authored-graph", () => {
  assert.equal(authoredProduct.graph.instances.find((item) => item.id === "product:feature-two").title, "Feature Two");
  assert.deepEqual(templates.resolveLinkSlots(authoredProduct.graph, "product:home").children.map((link) => link.href), ["/features/core/", "/features/two/"]);
});

coversDefaultGraph("feat:lander.page-template-presets.faq-hub-authored-graph", () => {
  const authoredFaq = createFaqHubPreset({
    pages: {
      question3: { id: "support:question-3", templateId: "support.qa", slug: "/support/question-3/", title: "Question Three", description: "Third question.", summary: "Answer the third question.", order: 3 },
    },
    links: { hub: { questions: ["question1", "question2", "question3"] } },
  });
  assert.equal(templates.resolveLinkSlots(authoredFaq.graph, "support:hub").questions.length, 3);
});

coversDefaultGraph("feat:lander.page-template-presets.education-path-authored-graph", () => {
  const authoredEducation = createEducationPathPreset({
    pages: {
      moduleTwo: { id: "education:module-two", templateId: "education.module", slug: "/learn/course/module-two/", title: "Module Two", description: "Second module.", summary: "Continue learning.", order: 2 },
    },
    links: { course: { modules: ["module", "moduleTwo"] } },
  });
  assert.deepEqual(templates.resolveLinkSlots(authoredEducation.graph, "education:course").modules.map((link) => link.href), ["/learn/course/module/", "/learn/course/module-two/"]);
});

coversDefaultGraph("feat:lander.page-template-presets.docs-hub-authored-graph", () => {
  const authoredDocs = createDocsHubPreset({
    pages: {
      extraGuide: { id: "docs:extra-guide", templateId: "docs.guide", slug: "/docs/extra-guide/", title: "Extra Guide", description: "Extra guide.", summary: "Read another guide.", order: 7 },
    },
    links: { hub: { children: ["guide", "reference", "api", "tutorial", "troubleshooting", "releaseNote", "extraGuide"] } },
  });
  assert.equal(templates.resolveLinkSlots(authoredDocs.graph, "docs:hub").children.length, 7);
});

coversDefaultGraph("feat:lander.page-template-presets.package-catalog-authored-graph", () => {
  const authoredPackage = createPackageCatalogPreset({
    pages: {
      secondDetail: { id: "package:detail-two", templateId: "package.detail", slug: "/packages/package-two/", title: "Package Two", description: "Second package.", summary: "Second package details.", order: 4 },
    },
    links: { catalog: { packages: ["detail", "plugin", "integration", "secondDetail"] } },
  });
  assert.equal(templates.resolveLinkSlots(authoredPackage.graph, "package:catalog").packages.length, 4);
});

coversDefaultGraph("feat:lander.page-template-presets.trust-center-authored-graph", () => {
  const authoredTrust = createTrustCenterPreset({
    pages: {
      complianceTwo: { id: "trust:compliance-two", templateId: "trust.compliance", slug: "/compliance/two/", title: "Compliance Two", description: "Second compliance page.", summary: "Additional compliance posture.", order: 8 },
    },
    links: { hub: { legal: ["privacy", "terms", "security", "compliance", "policy", "legal", "complianceTwo"] } },
  });
  assert.equal(templates.resolveLinkSlots(authoredTrust.graph, "trust:hub").legal.length, 7);
});

assert.deepEqual([...defaultGraphCoveredFeatures].sort(), [
  "feat:lander.page-template-presets.docs-hub",
  "feat:lander.page-template-presets.docs-hub-authored-graph",
  "feat:lander.page-template-presets.education-path",
  "feat:lander.page-template-presets.education-path-authored-graph",
  "feat:lander.page-template-presets.faq-hub",
  "feat:lander.page-template-presets.faq-hub-authored-graph",
  "feat:lander.page-template-presets.package-catalog",
  "feat:lander.page-template-presets.package-catalog-authored-graph",
  "feat:lander.page-template-presets.product-site",
  "feat:lander.page-template-presets.product-site-authored-graph",
  "feat:lander.page-template-presets.smoke-tests",
  "feat:lander.page-template-presets.trust-center",
  "feat:lander.page-template-presets.trust-center-authored-graph",
]);
