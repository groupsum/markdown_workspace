import { educationDomainBundle } from "@mdwrk/lander-page-templates";
import type { PageTemplatePreset, PresetOptions } from "../types.js";
import { edge, presetSlug, seedInstance } from "../types.js";

export function createEducationPathPreset(options: PresetOptions = {}): PageTemplatePreset {
  const title = options.title ?? "Learning Path";
  const instances = [
    seedInstance({ id: "education:path", templateId: "education.learning-path", slug: presetSlug(options.baseSlug, "learn"), title, description: options.description ?? "Guided learning path.", summary: "Start here and follow the course sequence." }),
    seedInstance({ id: "education:course", templateId: "education.course", slug: presetSlug(options.baseSlug, "learn/course"), title: "Course", description: "Course overview.", summary: "Review modules and outcomes.", order: 1 }),
    seedInstance({ id: "education:module", templateId: "education.module", slug: presetSlug(options.baseSlug, "learn/course/module"), title: "Module", description: "Course module.", summary: "Complete module material.", order: 1 }),
    seedInstance({ id: "education:quiz", templateId: "education.quiz", slug: presetSlug(options.baseSlug, "learn/course/module/quiz"), title: "Quiz", description: "Module quiz.", summary: "Check understanding.", order: 1 }),
  ];
  return {
    id: "preset.education-path",
    title: "Education path preset",
    description: "Learning path with course, module, and quiz links.",
    domain: "education",
    bundles: [educationDomainBundle],
    graph: {
      templates: educationDomainBundle.templates,
      bundles: [educationDomainBundle],
      instances,
      edges: [
        edge("education:path", "education:course", "child", "courses", 1),
        edge("education:course", "education:module", "course_module", "modules", 1),
        edge("education:module", "education:quiz", "module_quiz", "quizzes", 1),
      ],
    },
  };
}
