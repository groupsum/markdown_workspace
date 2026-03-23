export type ExtensionSupportStatus = "experimental" | "active" | "deprecated" | "internal";
export type ExtensionSupportLevel = "official" | "community";

export interface ExtensionSupportDeclaration {
  readonly status: ExtensionSupportStatus;
  readonly level: ExtensionSupportLevel;
  readonly owner?: string;
  readonly documentationUrl?: string;
  readonly supportChannel?: string;
}
