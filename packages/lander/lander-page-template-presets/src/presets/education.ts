import { educationDomainBundle } from "@mdwrk/lander-page-templates";
import type { PageTemplatePreset, PresetOptions } from "../types.js";
import { buildPresetFromMaps, mergePresetLinks, mergePresetPages } from "../authoring.js";
import { presetSlug } from "../types.js";

export function createEducationPathPreset(options: PresetOptions = {}): PageTemplatePreset {
  const title = options.title ?? "Learning Path";
  return buildPresetFromMaps({
    id: "preset.education-path",
    title: "Education path preset",
    description: "Learning path with course, module, and quiz links.",
    domain: "education",
    bundles: [educationDomainBundle],
    pages: mergePresetPages({
      path: { id: "education:path", templateId: "education.learning-path", slug: presetSlug(options.baseSlug, "learn"), title, description: options.description ?? "Guided learning path.", summary: "Start here and follow the course sequence." },
      course: { id: "education:course", templateId: "education.course", slug: presetSlug(options.baseSlug, "learn/course"), title: "Course", description: "Course overview.", summary: "Review modules and outcomes.", order: 1 },
      module: { id: "education:module", templateId: "education.module", slug: presetSlug(options.baseSlug, "learn/course/module"), title: "Module", description: "Course module.", summary: "Complete module material.", order: 1 },
      quiz: { id: "education:quiz", templateId: "education.quiz", slug: presetSlug(options.baseSlug, "learn/course/module/quiz"), title: "Quiz", description: "Module quiz.", summary: "Check understanding.", order: 1 },
      assessment: { id: "education:assessment", templateId: "education.assessment", slug: presetSlug(options.baseSlug, "learn/course/module/assessment"), title: "Assessment", description: "Module assessment.", summary: "Validate readiness for completion.", order: 2 },
      certificate: { id: "education:certificate", templateId: "education.certificate", slug: presetSlug(options.baseSlug, "learn/certificate"), title: "Certificate", description: "Certificate page.", summary: "Describe completion and certification.", order: 3 },
    }, options.pages),
    links: mergePresetLinks({
      path: { courses: ["course"] },
      course: { modules: ["module"] },
      module: { quizzes: ["quiz", "assessment"] },
    }, options.links),
  });
}
