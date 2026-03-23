import type { I18nLabel } from "./i18n.js";
import type { ExtensionIcon } from "./icon.js";
export type ActionRailGroup = "workspace.primary" | "workspace.secondary" | "assistant" | "appearance" | "extensions" | "system";
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
export type ActionRailTarget = {
    readonly kind: "view";
    readonly viewId: string;
} | {
    readonly kind: "command";
    readonly commandId: string;
};
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
export interface ExtensionContributions {
    readonly commands: readonly CommandContributionDescriptor[];
    readonly views: readonly ViewContributionDescriptor[];
    readonly components: readonly ComponentContributionDescriptor[];
    readonly actionRail: readonly ActionRailContributionDescriptor[];
    readonly settingsSections: readonly SettingsSectionContributionDescriptor[];
}
//# sourceMappingURL=contributions.d.ts.map