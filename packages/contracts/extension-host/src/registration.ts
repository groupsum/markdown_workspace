import type {
  ActionRailContributionDescriptor,
  CommandContributionDescriptor,
  ComponentContributionDescriptor,
  SettingsSectionContributionDescriptor,
  ViewContributionDescriptor,
} from "@mdwrk/extension-manifest";

export type ViewRenderer<Props = unknown> = (props: Props) => unknown;
export type ComponentRenderer<Props = unknown> = (props: Props) => unknown;

export interface RegisteredCommand extends CommandContributionDescriptor {
  execute: (...args: unknown[]) => unknown | Promise<unknown>;
}

export interface RegisteredView extends ViewContributionDescriptor {
  render: ViewRenderer;
}

export interface RegisteredComponent extends ComponentContributionDescriptor {
  render: ComponentRenderer;
}

export interface RegisteredSettingsSection extends SettingsSectionContributionDescriptor {}

export interface RegisteredActionRailItem extends ActionRailContributionDescriptor {}
