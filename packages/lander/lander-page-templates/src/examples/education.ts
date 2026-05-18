import { defineEdge, definePageInstance, defineTemplateGraph } from "../define.js";
import { educationDomainBundle } from "../domains/education.js";

export const educationTemplateGraph = defineTemplateGraph({
  templates: educationDomainBundle.templates,
  bundles: [educationDomainBundle],
  instances: [
    definePageInstance({ id: "path", templateId: "education.learning-path", slug: "/learn/", title: "Learning Path", description: "Learning path overview.", data: { summary: "Start here." } }),
    definePageInstance({ id: "course", templateId: "education.course", slug: "/learn/course/", title: "Course", description: "Course overview.", data: { summary: "Take the course." } }),
    definePageInstance({ id: "module", templateId: "education.module", slug: "/learn/course/module/", title: "Module", description: "Module overview.", data: { summary: "Complete the module." } }),
    definePageInstance({ id: "quiz", templateId: "education.quiz", slug: "/learn/course/module/quiz/", title: "Quiz", description: "Quiz page.", data: { summary: "Check understanding." } }),
  ],
  edges: [
    defineEdge({ sourceId: "path", targetId: "course", relationship: "child", slotId: "courses", order: 1 }),
    defineEdge({ sourceId: "course", targetId: "module", relationship: "course_module", slotId: "modules", order: 1 }),
    defineEdge({ sourceId: "module", targetId: "quiz", relationship: "module_quiz", slotId: "quizzes", order: 1 }),
  ],
});
