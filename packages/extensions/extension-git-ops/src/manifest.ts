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
  description: label("Git tools for repos and settings."),
  kind: "bundled",
  icon: { kind: "lucide", name: "GitBranch" },
  enabledByDefault: true,
  capabilities: ["view.register", "actionRail.register", "settings.read", "settings.write", "notification.publish", "workspace.read", "network.fetch"],
  capabilityPresetIds: ["workspace.module.provider", "workspace.module.diagnostics"],
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
  i18n: {
    defaultLocale: "en",
    supportedLocales: ["en"],
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
        description: label("Branches and file changes."),
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
        description: label("Git view, diffs, and repo actions."),
        icon: { kind: "lucide", name: "GitBranch" },
        primaryViewId: GIT_OPS_PRIMARY_VIEW_ID,
        explorerViewId: GIT_OPS_EXPLORER_VIEW_ID,
        supportedLayouts: ["single", "left", "right", "split"],
        defaultLayout: "split",
        settingsSectionId: GIT_OPS_SETTINGS_SECTION_ID,
        capabilityProfiles: ["workspace.module.base", "workspace.module.read", "workspace.module.provider", "workspace.module.diagnostics"],
        capabilityPresetIds: ["workspace.module.provider", "workspace.module.diagnostics"],
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
    sections: [
      {
        id: "persistence",
        title: label("Persistence"),
        description: label("Workspace-scoped repository settings and token state."),
        order: 10,
      },
      {
        id: "oidc",
        title: label("OIDC"),
        description: label("Provider-bound Git authorization settings."),
        order: 20,
      },
    ],
    fields: [
      {
        key: "persistRepositoryState",
        kind: "boolean",
        sectionId: "persistence",
        scope: "workspace",
        label: label("Persist repository state"),
        description: label("Remember the last normalized repository URL and branch for the active workspace."),
        defaultValue: true,
      },
      {
        key: "lastRepositoryUrl",
        kind: "string",
        sectionId: "persistence",
        scope: "workspace",
        label: label("Last repository URL"),
        description: label("The last normalized repository URL captured by Git Operations."),
        defaultValue: "",
      },
      {
        key: "oidcTokenBoundary",
        kind: "string",
        sectionId: "oidc",
        scope: "workspace",
        label: label("OIDC token boundary"),
        description: label("Git Operations only accepts OIDC credentials tagged for the git-ops boundary."),
        defaultValue: "git-ops",
      },
    ],
  },
};
