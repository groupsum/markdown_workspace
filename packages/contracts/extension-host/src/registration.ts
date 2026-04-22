import type {
  ActionRailContributionDescriptor,
  CommandContributionDescriptor,
  ComponentContributionDescriptor,
  SettingsSectionContributionDescriptor,
  ViewContributionDescriptor,
  WorkspaceModuleContributionDescriptor,
  ExtensionIcon,
  ExtensionSettingsSchema,
} from "@mdwrk/extension-manifest";

export type ViewRenderer<Props = unknown> = (props: Props) => unknown;
export type ComponentRenderer<Props = unknown> = (props: Props) => unknown;

export interface RegisteredCommand extends CommandContributionDescriptor {
  execute: (...args: unknown[]) => unknown | Promise<unknown>;
}

export interface RegisteredView extends ViewContributionDescriptor {
  render: ViewRenderer;
  renderSidebar?: ViewRenderer;
}

export interface RegisteredComponent extends ComponentContributionDescriptor {
  render: ComponentRenderer;
}

export interface RegisteredWorkspaceModule extends WorkspaceModuleContributionDescriptor {
  render: ViewRenderer;
  renderExplorer: ViewRenderer;
}

export interface RegisteredSettingsSection extends SettingsSectionContributionDescriptor {
  readonly panel?: string;
  readonly icon?: ExtensionIcon;
  readonly schema?: ExtensionSettingsSchema;
  readonly render?: () => unknown;
}

export interface RegisteredActionRailItem extends ActionRailContributionDescriptor {
  readonly tooltip?: string;
  readonly isActive?: () => boolean;
  readonly isDisabled?: () => boolean;
}
