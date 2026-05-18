import { defineTemplateBundle } from "../define.js";
import { createDomainPageTemplate } from "./shared.js";

export const educationTemplates = [
  createDomainPageTemplate({ id: "education.learning-path", domain: "education", kind: "docs_bridge", title: "Learning path", description: "Learning path hub page.", fallbackSchemaKinds: ["ItemList", "Course"], linkSlots: [{ id: "courses", relationship: "child", targetTemplateIds: ["education.course"], cardinality: "optional_many", ordered: true }] }),
  createDomainPageTemplate({ id: "education.course", domain: "education", kind: "docs_bridge", title: "Course page", description: "Course overview page.", fallbackSchemaKinds: ["Course"], linkSlots: [{ id: "parent", relationship: "parent", cardinality: "optional_one" }, { id: "modules", relationship: "course_module", targetTemplateIds: ["education.module"], cardinality: "optional_many", ordered: true }] }),
  createDomainPageTemplate({ id: "education.module", domain: "education", kind: "docs_bridge", title: "Module page", description: "Course module page.", fallbackSchemaKinds: ["TechArticle"], linkSlots: [{ id: "parent", relationship: "parent", cardinality: "optional_one" }, { id: "quizzes", relationship: "module_quiz", targetTemplateIds: ["education.quiz"], cardinality: "optional_many", ordered: true }, { id: "previous", relationship: "previous", cardinality: "optional_one" }, { id: "next", relationship: "next", cardinality: "optional_one" }] }),
  createDomainPageTemplate({ id: "education.lesson", domain: "education", kind: "docs_bridge", title: "Lesson page", description: "Lesson page.", fallbackSchemaKinds: ["TechArticle"] }),
  createDomainPageTemplate({ id: "education.quiz", domain: "education", kind: "answer", title: "Quiz page", description: "Quiz or assessment page.", fallbackSchemaKinds: ["WebPage"] }),
];

export const educationDomainBundle = defineTemplateBundle({
  id: "domain.education",
  domain: "education",
  title: "Education page templates",
  templates: educationTemplates,
});
