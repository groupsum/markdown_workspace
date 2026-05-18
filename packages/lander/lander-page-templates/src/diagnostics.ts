import type { TemplateDiagnostic } from "./types.js";

export function errorDiagnostic(input: Omit<TemplateDiagnostic, "level">): TemplateDiagnostic {
  return { ...input, level: "error" };
}

export function warningDiagnostic(input: Omit<TemplateDiagnostic, "level">): TemplateDiagnostic {
  return { ...input, level: "warning" };
}
