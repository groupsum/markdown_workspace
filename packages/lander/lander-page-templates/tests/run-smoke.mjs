import assert from "node:assert/strict";

const {
  buildPageSpecFromTemplate,
  buildPageSpecsFromGraph,
  defineEdge,
  definePageInstance,
  defineTemplateGraph,
  deriveTemplateNavigation,
  docsDomainBundle,
  educationDomainBundle,
  packageDomainBundle,
  productDomainBundle,
  resolveIncomingLinkSlots,
  resolveLinkSlots,
  supportDomainBundle,
  trustDomainBundle,
  validateTemplateGraph,
} = await import("../dist/index.js");

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

const educationGraph = defineTemplateGraph({
  templates: educationDomainBundle.templates,
  bundles: [educationDomainBundle],
  instances: [
    definePageInstance({ id: "path", templateId: "education.learning-path", slug: "/learn/", title: "Learning Path", description: "A sequenced learning path.", data: { summary: "Start here and follow the courses." } }),
    definePageInstance({ id: "course", templateId: "education.course", slug: "/learn/course/", title: "Course", description: "A course in the path.", data: { summary: "Course overview and modules." } }),
    definePageInstance({ id: "module", templateId: "education.module", slug: "/learn/course/module/", title: "Module", description: "A course module.", data: { summary: "Module lessons and checks." } }),
    definePageInstance({ id: "quiz", templateId: "education.quiz", slug: "/learn/course/module/quiz/", title: "Quiz", description: "A quiz for the module.", data: { summary: "Validate module understanding." } }),
  ],
  edges: [
    defineEdge({ sourceId: "path", targetId: "course", relationship: "child", slotId: "courses", order: 1 }),
    defineEdge({ sourceId: "course", targetId: "module", relationship: "course_module", slotId: "modules", order: 1 }),
    defineEdge({ sourceId: "module", targetId: "quiz", relationship: "module_quiz", slotId: "quizzes", order: 1 }),
  ],
});

assert.deepEqual(validateTemplateGraph(educationGraph).filter((item) => item.level === "error"), []);
assert.equal(resolveLinkSlots(educationGraph, "path").courses[0].href, "/learn/course/");
assert.equal(resolveLinkSlots(educationGraph, "course").modules[0].label, "Module");
assert.equal(resolveLinkSlots(educationGraph, "module").quizzes[0].targetTemplateId, "education.quiz");
assert.equal(resolveLinkSlots(educationGraph, "path").courses[0].role, "tree_child");
assert.equal(resolveIncomingLinkSlots(educationGraph, "course")["incoming:courses"][0].href, "/learn/");
assert.equal(deriveTemplateNavigation(educationGraph, "course").breadcrumbs[1].href, "/learn/");

const coursePage = buildPageSpecFromTemplate(educationGraph, educationGraph.instances[1]);
assert.equal(coursePage.kind, "docs_bridge");
assert.equal(coursePage.slug, "/learn/course/");
assert.ok(coursePage.schema.some((item) => item.kind === "Course"));
assert.ok(coursePage.componentIntents.some((item) => item.kind === "page_shell"));

const supportGraph = defineTemplateGraph({
  templates: supportDomainBundle.templates,
  bundles: [supportDomainBundle],
  instances: [
    definePageInstance({ id: "hub", templateId: "support.hub", slug: "/support/", title: "Support", description: "Support hub page.", data: { summary: "Find support answers." } }),
    definePageInstance({ id: "question", templateId: "support.qa", slug: "/support/question/", title: "Question", description: "Question answer page.", data: { summary: "Direct answer.", schemaKinds: ["QAPage"] } }),
  ],
  edges: [
    defineEdge({ sourceId: "hub", targetId: "question", relationship: "faq_question", slotId: "questions", order: 1 }),
  ],
});

assert.equal(resolveLinkSlots(supportGraph, "hub").questions[0].href, "/support/question/");
assert.ok(buildPageSpecFromTemplate(supportGraph, supportGraph.instances[1]).schema.some((item) => item.kind === "QAPage"));

const productTrustGraph = defineTemplateGraph({
  templates: [...productDomainBundle.templates, ...trustDomainBundle.templates],
  bundles: [productDomainBundle, trustDomainBundle],
  instances: [
    definePageInstance({ id: "home", templateId: "product.home", slug: "/", title: "Product Home", description: "Product home page.", data: { summary: "Product overview." } }),
    definePageInstance({ id: "privacy", templateId: "trust.privacy", slug: "/privacy/", title: "Privacy", description: "Privacy policy page.", data: { summary: "Privacy policy." } }),
    definePageInstance({ id: "tos", templateId: "trust.terms", slug: "/terms/", title: "Terms", description: "Terms page.", data: { summary: "Terms of service." } }),
  ],
  edges: [
    defineEdge({ sourceId: "home", targetId: "privacy", relationship: "legal", slotId: "legal", order: 1 }),
    defineEdge({ sourceId: "home", targetId: "tos", relationship: "legal", slotId: "legal", order: 2 }),
  ],
});

const homeNav = deriveTemplateNavigation(productTrustGraph, "home");
assert.deepEqual(homeNav.related.map((item) => item.href), ["/privacy/", "/terms/"]);
assert.equal(buildPageSpecsFromGraph(productTrustGraph).pages.length, 3);

const missingRequiredChildGraph = defineTemplateGraph({
  templates: educationDomainBundle.templates,
  instances: [
    definePageInstance({ id: "path", templateId: "education.learning-path", slug: "/learn/", title: "Learning Path", description: "A path.", data: {} }),
  ],
  edges: [],
});
assert.ok(validateTemplateGraph(missingRequiredChildGraph).some((item) => item.code === "slot.required.missing" || item.code === "topology.child.required.missing"));

const invalidGraph = defineTemplateGraph({
  templates: educationDomainBundle.templates,
  instances: [
    definePageInstance({ id: "path", templateId: "education.learning-path", slug: "/learn/", title: "Learning Path", description: "A path.", data: {} }),
    definePageInstance({ id: "wrong", templateId: "education.quiz", slug: "/quiz/", title: "Quiz", description: "A quiz.", data: {} }),
  ],
  edges: [
    defineEdge({ sourceId: "path", targetId: "wrong", relationship: "child", slotId: "courses" }),
  ],
});

assert.ok(validateTemplateGraph(invalidGraph).some((item) => item.code === "edge.slot.target.invalid"));

const terminalChildGraph = defineTemplateGraph({
  templates: educationDomainBundle.templates,
  instances: [
    definePageInstance({ id: "quiz", templateId: "education.quiz", slug: "/quiz/", title: "Quiz", description: "A quiz.", data: {} }),
    definePageInstance({ id: "lesson", templateId: "education.lesson", slug: "/lesson/", title: "Lesson", description: "A lesson.", data: {} }),
  ],
  edges: [
    defineEdge({ sourceId: "quiz", targetId: "lesson", relationship: "child", role: "tree_child", slotId: "children" }),
  ],
});
assert.ok(validateTemplateGraph(terminalChildGraph).some((item) => item.code === "template.terminal.child.invalid"));

covers("feat:lander.page-templates.relationship-role-types", () => {
  assert.equal(resolveLinkSlots(educationGraph, "path").courses[0].role, "tree_child");
  assert.equal(resolveLinkSlots(productTrustGraph, "home").legal[0].role, "semantic");
});

covers("feat:lander.page-templates.template-topology-types", () => {
  const learningPath = educationGraph.templates.find((item) => item.id === "education.learning-path");
  const quiz = educationGraph.templates.find((item) => item.id === "education.quiz");
  assert.equal(learningPath.topology.childPolicy, "required");
  assert.equal(learningPath.topology.childSlots[0].id, "courses");
  assert.equal(quiz.topology.childPolicy, "terminal");
});

covers("feat:lander.page-templates.required-child-validation", () => {
  const diagnostics = validateTemplateGraph(missingRequiredChildGraph);
  assert.ok(diagnostics.some((item) => item.code === "slot.required.missing" || item.code === "topology.child.required.missing"));
});

covers("feat:lander.page-templates.optional-child-validation", () => {
  const moduleWithoutQuizGraph = defineTemplateGraph({
    templates: educationDomainBundle.templates,
    instances: [
      definePageInstance({ id: "path", templateId: "education.learning-path", slug: "/learn/", title: "Learning Path", description: "A path.", data: {} }),
      definePageInstance({ id: "course", templateId: "education.course", slug: "/course/", title: "Course", description: "A course.", data: {} }),
      definePageInstance({ id: "module", templateId: "education.module", slug: "/module/", title: "Module", description: "A module.", data: {} }),
    ],
    edges: [
      defineEdge({ sourceId: "path", targetId: "course", relationship: "child", slotId: "courses" }),
      defineEdge({ sourceId: "course", targetId: "module", relationship: "course_module", slotId: "modules" }),
    ],
  });
  assert.deepEqual(validateTemplateGraph(moduleWithoutQuizGraph).filter((item) => item.level === "error"), []);
});

covers("feat:lander.page-templates.terminal-template-validation", () => {
  assert.ok(validateTemplateGraph(terminalChildGraph).some((item) => item.code === "template.terminal.child.invalid"));
});

covers("feat:lander.page-templates.incoming-edge-derivation", () => {
  const incoming = resolveIncomingLinkSlots(educationGraph, "module");
  assert.equal(incoming["incoming:modules"][0].href, "/learn/course/");
  assert.equal(incoming["incoming:modules"][0].role, "tree_child");
});

covers("feat:lander.page-templates.relationship-validation", () => {
  const diagnostics = validateTemplateGraph(invalidGraph);
  assert.ok(diagnostics.some((item) => item.code === "edge.slot.target.invalid"));
});

covers("feat:lander.page-templates.link-slot-resolution", () => {
  const slots = resolveLinkSlots(educationGraph, "course");
  assert.equal(slots.modules.length, 1);
  assert.equal(slots.modules[0].slotId, "modules");
});

covers("feat:lander.page-templates.ordered-relationship-resolution", () => {
  assert.deepEqual(
    resolveLinkSlots(productTrustGraph, "home").legal.map((item) => item.href),
    ["/privacy/", "/terms/"],
  );
});

covers("feat:lander.page-templates.navigation-derivation", () => {
  const navigation = deriveTemplateNavigation(educationGraph, "course");
  assert.equal(navigation.breadcrumbs[1].href, "/learn/");
  assert.equal(navigation.incoming["incoming:courses"][0].href, "/learn/");
});

covers("feat:lander.page-templates.core-types", () => {
  const page = buildPageSpecFromTemplate(educationGraph, educationGraph.instances[1]);
  assert.equal(page.slug, "/learn/course/");
  assert.ok(Array.isArray(resolveLinkSlots(educationGraph, "path").courses));
  assert.ok(Array.isArray(deriveTemplateNavigation(educationGraph, "course").related));
});

assert.deepEqual([...coveredFeatures].sort(), [
  "feat:lander.page-templates.core-types",
  "feat:lander.page-templates.incoming-edge-derivation",
  "feat:lander.page-templates.link-slot-resolution",
  "feat:lander.page-templates.navigation-derivation",
  "feat:lander.page-templates.optional-child-validation",
  "feat:lander.page-templates.ordered-relationship-resolution",
  "feat:lander.page-templates.relationship-role-types",
  "feat:lander.page-templates.relationship-validation",
  "feat:lander.page-templates.required-child-validation",
  "feat:lander.page-templates.template-topology-types",
  "feat:lander.page-templates.terminal-template-validation",
]);

coversDefaultGraph("feat:lander.page-templates.product-domain-bundle", () => {
  const ids = productDomainBundle.templates.map((item) => item.id);
  assert.deepEqual(ids, ["product.home", "product.product", "product.feature", "product.compare", "product.pricing", "product.case-study", "product.changelog"]);
  assert.equal(productDomainBundle.templates.find((item) => item.id === "product.product").topology.childSlots[0].targetTemplateIds.includes("product.changelog"), true);
});

coversDefaultGraph("feat:lander.page-templates.support-domain-bundle", () => {
  const ids = supportDomainBundle.templates.map((item) => item.id);
  assert.deepEqual(ids, ["support.hub", "support.faq", "support.qa", "support.article", "support.contact", "support.status", "support.ticket-intent"]);
  assert.equal(supportDomainBundle.templates.find((item) => item.id === "support.hub").linkSlots.some((slot) => slot.id === "support"), true);
});

coversDefaultGraph("feat:lander.page-templates.education-domain-bundle", () => {
  const ids = educationDomainBundle.templates.map((item) => item.id);
  assert.deepEqual(ids, ["education.learning-path", "education.course", "education.module", "education.lesson", "education.quiz", "education.assessment", "education.certificate"]);
  assert.deepEqual(educationDomainBundle.templates.find((item) => item.id === "education.module").linkSlots.find((slot) => slot.id === "quizzes").targetTemplateIds, ["education.quiz", "education.assessment"]);
});

coversDefaultGraph("feat:lander.page-templates.docs-domain-bundle", () => {
  const ids = docsDomainBundle.templates.map((item) => item.id);
  assert.deepEqual(ids, ["docs.hub", "docs.guide", "docs.reference", "docs.api", "docs.tutorial", "docs.troubleshooting", "docs.release-note"]);
  assert.equal(docsDomainBundle.templates.find((item) => item.id === "docs.api").linkSlots.some((slot) => slot.id === "next"), true);
});

coversDefaultGraph("feat:lander.page-templates.package-domain-bundle", () => {
  const ids = packageDomainBundle.templates.map((item) => item.id);
  assert.deepEqual(ids, ["package.catalog", "package.detail", "package.api", "package.plugin", "package.integration", "package.version"]);
  assert.equal(packageDomainBundle.templates.find((item) => item.id === "package.detail").linkSlots.some((slot) => slot.id === "children"), true);
});

coversDefaultGraph("feat:lander.page-templates.trust-domain-bundle", () => {
  const ids = trustDomainBundle.templates.map((item) => item.id);
  assert.deepEqual(ids, ["trust.hub", "trust.privacy", "trust.terms", "trust.security", "trust.compliance", "trust.policy", "trust.legal", "trust.support"]);
  assert.equal(trustDomainBundle.templates.find((item) => item.id === "trust.hub").topology.childSlots[0].targetTemplateIds.includes("trust.support"), true);
});

coversDefaultGraph("feat:lander.page-templates.domain-bundle-smoke-tests", () => {
  const bundles = [productDomainBundle, supportDomainBundle, educationDomainBundle, docsDomainBundle, packageDomainBundle, trustDomainBundle];
  assert.equal(bundles.every((bundle) => bundle.templates.length > 0), true);
  assert.equal(bundles.flatMap((bundle) => bundle.templates).every((template) => template.topology?.childPolicy), true);
});

assert.deepEqual([...defaultGraphCoveredFeatures].sort(), [
  "feat:lander.page-templates.docs-domain-bundle",
  "feat:lander.page-templates.domain-bundle-smoke-tests",
  "feat:lander.page-templates.education-domain-bundle",
  "feat:lander.page-templates.package-domain-bundle",
  "feat:lander.page-templates.product-domain-bundle",
  "feat:lander.page-templates.support-domain-bundle",
  "feat:lander.page-templates.trust-domain-bundle",
]);
