import assert from "node:assert/strict";

const {
  buildPageSpecFromTemplate,
  buildPageSpecsFromGraph,
  defineEdge,
  definePageInstance,
  defineTemplateGraph,
  deriveTemplateNavigation,
  educationDomainBundle,
  productDomainBundle,
  resolveLinkSlots,
  supportDomainBundle,
  trustDomainBundle,
  validateTemplateGraph,
} = await import("../dist/index.js");

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
