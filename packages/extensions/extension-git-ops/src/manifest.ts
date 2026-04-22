import type { ExtensionManifest } from "@mdwrk/extension-manifest";
import {
  GIT_OPS_COMMAND_REFRESH_ID,
  GIT_OPS_COMMAND_TOGGLE_ID,
  GIT_OPS_EXPLORER_VIEW_ID,
  GIT_OPS_EXTENSION_ID,
  GIT_OPS_MODULE_ID,
  GIT_OPS_PRIMARY_VIEW_ID,
  GIT_OPS_RAIL_ID,
  GIT_OPS_SETTINGS_SECTION_ID,
} from "./constants.js";
import { GIT_OPS_VERSION } from "./version.js";

const label = (defaultMessage: string, key?: string) => ({ defaultMessage, key });

export const gitOpsManifest: ExtensionManifest = {
  manifestVersion: 1,
  id: GIT_OPS_EXTENSION_ID,
  packageName: "@mdwrk/extension-git-ops",
  version: GIT_OPS_VERSION,
  displayName: label("Git Operations"),
  description: label("First-party source-control workspace module for repository operations and Git settings."),
  kind: "bundled",
  icon: { kind: "lucide", name: "GitBranch" },
  enabledByDefault: true,
  capabilities: ["view.register", "actionRail.register", "settings.read", "settings.write", "notification.publish", "workspace.read"],
  compatibility: {
    manifestVersion: 1,
    hostApi: "^1.0.0",
    runtime: "^1.0.0",
    app: ">=1.4.21",
    themeContract: "^1.0.0",
  },
  entry: {
    module: "./index.js",
    export: "createGitOpsBundledEntry",
  },
  contributions: {
    commands: [
      { id: GIT_OPS_COMMAND_TOGGLE_ID, title: label("Toggle Git Operations", "core.commands.toggle-git-pane"), icon: { kind: "lucide", name: "GitBranch" } },
      { id: GIT_OPS_COMMAND_REFRESH_ID, title: label("Refresh Git Operations"), icon: { kind: "lucide", name: "RefreshCw" } },
    ],
    views: [
      {
        id: GIT_OPS_PRIMARY_VIEW_ID,
        title: label("Git Operations", "core.views.git.title"),
        description: label("Source control workspace.", "core.views.git.description"),
        icon: { kind: "lucide", name: "GitBranch" },
        location: "main",
        allowMultiple: false,
        canBePinned: true,
      },
      {
        id: GIT_OPS_EXPLORER_VIEW_ID,
        title: label("Git Explorer"),
        description: label("Source-control branch and change explorer."),
        icon: { kind: "lucide", name: "GitBranch" },
        location: "sidebar",
        allowMultiple: false,
        canBePinned: true,
      },
    ],
    components: [],
    workspaceModules: [
      {
        id: GIT_OPS_MODULE_ID,
        title: label("Git Operations"),
        description: label("Source-control explorer, diff workspace, provider settings, and repository actions."),
        icon: { kind: "lucide", name: "GitBranch" },
        primaryViewId: GIT_OPS_PRIMARY_VIEW_ID,
        explorerViewId: GIT_OPS_EXPLORER_VIEW_ID,
        supportedLayouts: ["single", "left", "right", "split"],
        defaultLayout: "split",
        settingsSectionId: GIT_OPS_SETTINGS_SECTION_ID,
        capabilityProfiles: ["workspace.module.base", "workspace.module.read", "workspace.module.provider", "workspace.module.diagnostics"],
        actions: [
          { commandId: GIT_OPS_COMMAND_TOGGLE_ID, role: "primary", order: 10 },
          { commandId: GIT_OPS_COMMAND_REFRESH_ID, role: "toolbar", order: 20 },
        ],
      },
    ],
    actionRail: [
      {
        id: GIT_OPS_RAIL_ID,
        title: label("Git Operations"),
        icon: { kind: "lucide", name: "GitBranch" },
        group: "workspace.primary",
        order: 40,
        target: { kind: "command", commandId: GIT_OPS_COMMAND_TOGGLE_ID },
      },
    ],
    settingsSections: [
      {
        id: GIT_OPS_SETTINGS_SECTION_ID,
        title: label("Source Control", "core.settings.sections.git.title"),
        description: label("Repository and identity settings.", "core.settings.sections.git.description"),
        order: 20,
        schemaPath: "manifest.settingsSchema",
      },
    ],
  },
  settingsSchema: {
    version: 1,
    title: label("Source Control", "core.settings.sections.git.title"),
    description: label("Repository and identity settings.", "core.settings.sections.git.description"),
    sections: [],
    fields: [],
  },
};
