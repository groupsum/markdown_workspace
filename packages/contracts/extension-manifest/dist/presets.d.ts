import type { ExtensionCapability } from "./capabilities.js";
import type { WorkspaceModuleCapabilityProfile } from "./contributions.js";
import type { ExtensionManifest } from "./manifest.js";
export type CapabilityPresetId = "workspace.module.standard" | "workspace.module.reader" | "workspace.module.writer" | "workspace.module.provider" | "workspace.module.diagnostics";
export type CapabilityPresetSet = readonly CapabilityPresetId[];
export type CapabilityPresetRequiredContributionKind = "views" | "workspaceModules" | "actionRail" | "settingsSections";
export interface CapabilityPresetDescriptor {
    readonly id: CapabilityPresetId;
    readonly title: string;
    readonly description: string;
    readonly profileIds: readonly WorkspaceModuleCapabilityProfile[];
    readonly recommendedCapabilities: readonly ExtensionCapability[];
    readonly requiredContributionKinds: readonly CapabilityPresetRequiredContributionKind[];
    readonly notes: readonly string[];
}
export interface CapabilityPresetComposition {
    readonly ids: CapabilityPresetSet;
    readonly profileIds: readonly WorkspaceModuleCapabilityProfile[];
    readonly recommendedCapabilities: readonly ExtensionCapability[];
    readonly requiredContributionKinds: readonly CapabilityPresetRequiredContributionKind[];
    readonly notes: readonly string[];
}
export type CapabilityPresetGapKind = "unknown-preset" | "missing-capability" | "missing-profile" | "missing-contribution";
export interface CapabilityPresetAdvisoryGap {
    readonly kind: CapabilityPresetGapKind;
    readonly id: string;
    readonly presetId?: string;
    readonly message: string;
}
export interface CapabilityPresetEvaluation {
    readonly ids: readonly string[];
    readonly composition: CapabilityPresetComposition;
    readonly gaps: readonly CapabilityPresetAdvisoryGap[];
}
export declare const CAPABILITY_PRESETS: readonly CapabilityPresetDescriptor[];
export declare function getCapabilityPresetDescriptor(id: CapabilityPresetId): CapabilityPresetDescriptor;
export declare function composeCapabilityPresetSet(ids: CapabilityPresetSet): CapabilityPresetComposition;
export declare function recommendCapabilityPresets(manifest: ExtensionManifest): CapabilityPresetSet;
export declare function evaluateCapabilityPresetSet(manifest: ExtensionManifest, ids: readonly string[]): CapabilityPresetEvaluation;
//# sourceMappingURL=presets.d.ts.map