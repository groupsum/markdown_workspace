import { defineTemplateBundle } from "../define.js";
import { createDomainPageTemplate } from "./shared.js";

export const educationTemplates = [
  createDomainPageTemplate({ id: "education.learning-path", domain: "education", kind: "docs_bridge", title: "Learning path", description: "Learning path hub page.", fallbackSchemaKinds: ["ItemList", "Course"], linkSlots: [{ id: "courses", relationship: "child", role: "tree_child", targetTemplateIds: ["education.course"], cardinality: "many", ordered: true }], topology: { childPolicy: "required", childSlots: [{ id: "courses", relationship: "child", targetTemplateIds: ["education.course"], min: 1, ordered: true }] } }),
  createDomainPageTemplate({ id: "education.course", domain: "education", kind: "docs_bridge", title: "Course page", description: "Course overview page.", fallbackSchemaKinds: ["Course"], linkSlots: [{ id: "parent", relationship: "parent", role: "navigation", cardinality: "optional_one" }, { id: "modules", relationship: "course_module", role: "tree_child", targetTemplateIds: ["education.module"], cardinality: "many", ordered: true }], topology: { childPolicy: "required", childSlots: [{ id: "modules", relationship: "course_module", targetTemplateIds: ["education.module"], min: 1, ordered: true }] } }),
  createDomainPageTemplate({ id: "education.module", domain: "education", kind: "docs_bridge", title: "Module page", description: "Course module page.", fallbackSchemaKinds: ["TechArticle"], linkSlots: [{ id: "parent", relationship: "parent", role: "navigation", cardinality: "optional_one" }, { id: "quizzes", relationship: "module_quiz", role: "tree_child", targetTemplateIds: ["education.quiz", "education.assessment"], cardinality: "optional_many", ordered: true }, { id: "previous", relationship: "previous", role: "navigation", cardinality: "optional_one" }, { id: "next", relationship: "next", role: "navigation", cardinality: "optional_one" }], topology: { childPolicy: "optional", childSlots: [{ id: "quizzes", relationship: "module_quiz", targetTemplateIds: ["education.quiz", "education.assessment"], min: 0, ordered: true }] } }),
  createDomainPageTemplate({ id: "education.lesson", domain: "education", kind: "docs_bridge", title: "Lesson page", description: "Lesson page.", fallbackSchemaKinds: ["TechArticle"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "education.quiz", domain: "education", kind: "answer", title: "Quiz page", description: "Quiz or assessment page.", fallbackSchemaKinds: ["WebPage"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "education.assessment", domain: "education", kind: "answer", title: "Assessment page", description: "Assessment page.", fallbackSchemaKinds: ["WebPage"], topology: { childPolicy: "terminal" } }),
  createDomainPageTemplate({ id: "education.certificate", domain: "education", kind: "proof", title: "Certificate page", description: "Certificate or completion page.", fallbackSchemaKinds: ["WebPage"], topology: { childPolicy: "terminal" } }),
];

export const educationDomainBundle = defineTemplateBundle({
  id: "domain.education",
  domain: "education",
  title: "Education page templates",
  templates: educationTemplates,
});
