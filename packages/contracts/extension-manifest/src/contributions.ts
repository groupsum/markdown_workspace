import type { I18nLabel } from "./i18n.js";
import type { ExtensionIcon } from "./icon.js";
import type { CapabilityPresetId } from "./presets.js";

export type ActionRailGroup =
  | "workspace.primary"
  | "workspace.secondary"
  | "assistant"
  | "appearance"
  | "extensions"
  | "system";

export interface CommandContributionDescriptor {
  readonly id: string;
  readonly title: I18nLabel;
  readonly description?: I18nLabel;
  readonly category?: I18nLabel;
  readonly icon?: ExtensionIcon;
  readonly shortcut?: readonly string[];
  readonly keywords?: readonly string[];
  readonly enablement?: string;
}

export interface ViewContributionDescriptor {
  readonly id: string;
  readonly title: I18nLabel;
  readonly description?: I18nLabel;
  readonly icon?: ExtensionIcon;
  readonly location: "main" | "panel" | "modal" | "sidebar" | "inspector";
  readonly route?: string;
  readonly canBePinned?: boolean;
  readonly allowMultiple?: boolean;
}

export interface ComponentContributionDescriptor {
  readonly id: string;
  readonly title: I18nLabel;
  readonly description?: I18nLabel;
  readonly slot: string;
  readonly order?: number;
}

export type WorkspaceModuleLayout = "single" | "left" | "right" | "split";

export type WorkspaceModuleCapabilityProfile =
  | "workspace.module.base"
  | "workspace.module.read"
  | "workspace.module.write"
  | "workspace.module.provider"
  | "workspace.module.diagnostics";

export interface WorkspaceModuleActionDescriptor {
  readonly commandId: string;
  readonly role?: "primary" | "secondary" | "toolbar" | "explorer" | "settings";
  readonly order?: number;
}

export interface WorkspaceModuleContributionDescriptor {
  readonly id: string;
  readonly title: I18nLabel;
  readonly description?: I18nLabel;
  readonly icon?: ExtensionIcon;
  readonly primaryViewId: string;
  readonly explorerViewId: string;
  readonly supportedLayouts: readonly WorkspaceModuleLayout[];
  readonly defaultLayout: WorkspaceModuleLayout;
  readonly settingsSectionId: string;
  readonly capabilityProfiles: readonly WorkspaceModuleCapabilityProfile[];
  readonly capabilityPresetIds?: readonly CapabilityPresetId[];
  readonly actions: readonly WorkspaceModuleActionDescriptor[];
}

export type ActionRailTarget =
  | { readonly kind: "view"; readonly viewId: string }
  | { readonly kind: "command"; readonly commandId: string };

export interface ActionRailContributionDescriptor {
  readonly id: string;
  readonly title: I18nLabel;
  readonly icon: ExtensionIcon;
  readonly order?: number;
  readonly group?: ActionRailGroup;
  readonly target: ActionRailTarget;
}

export interface SettingsSectionContributionDescriptor {
  readonly id: string;
  readonly title: I18nLabel;
  readonly description?: I18nLabel;
  readonly order?: number;
  readonly schemaPath?: string;
}

export interface HookContributionDescriptor {
  readonly id: string;
  readonly title: I18nLabel;
  readonly description?: I18nLabel;
  readonly event: string;
  readonly order?: number;
}

export interface ExtensionContributions {
  readonly commands: readonly CommandContributionDescriptor[];
  readonly views: readonly ViewContributionDescriptor[];
  readonly components: readonly ComponentContributionDescriptor[];
  readonly workspaceModules?: readonly WorkspaceModuleContributionDescriptor[];
  readonly actionRail: readonly ActionRailContributionDescriptor[];
  readonly settingsSections: readonly SettingsSectionContributionDescriptor[];
  readonly hooks?: readonly HookContributionDescriptor[];
}
