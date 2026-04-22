import type { MarkdownWorkspaceExtension } from "@mdwrk/extension-host";
import type { BundledExtensionCatalogEntry } from "@mdwrk/extension-runtime";
import {
  GIT_OPS_COMMAND_REFRESH_ID,
  GIT_OPS_COMMAND_TOGGLE_ID,
  GIT_OPS_RAIL_ID,
  GIT_OPS_SETTINGS_SECTION_ID,
} from "./constants.js";
import { gitOpsManifest } from "./manifest.js";
import type { GitOpsBundledEntryOptions } from "./types.js";

const label = (defaultMessage: string, key?: string) => ({ defaultMessage, key });

export function createGitOpsBundledEntry(options: GitOpsBundledEntryOptions): BundledExtensionCatalogEntry {
  return {
    manifest: gitOpsManifest,
    activation: "eager",
    async load() {
      const extension: MarkdownWorkspaceExtension = {
        manifest: gitOpsManifest,
        async activate(context) {
          context.registerCommand({
            id: GIT_OPS_COMMAND_TOGGLE_ID,
            title: label("Toggle Git Operations", "core.commands.toggle-git-pane"),
            icon: { kind: "lucide", name: "GitBranch" },
            execute: options.toggleGitOps,
          });
          context.registerCommand({
            id: GIT_OPS_COMMAND_REFRESH_ID,
            title: label("Refresh Git Operations"),
            icon: { kind: "lucide", name: "RefreshCw" },
            execute: options.refreshGitOps ?? (async () => {}),
          });

          context.registerWorkspaceModule({
            ...gitOpsManifest.contributions.workspaceModules![0],
            render: (props) => options.renderWorkspace(props as never),
            renderExplorer: (props) => options.renderExplorer(props as never),
          });

          context.registerActionRailItem({
            id: GIT_OPS_RAIL_ID,
            title: label("Git Operations"),
            icon: { kind: "lucide", name: "GitBranch" },
            group: "workspace.primary",
            order: 40,
            target: { kind: "command", commandId: GIT_OPS_COMMAND_TOGGLE_ID },
            isActive: options.isActive,
          });

          context.registerSettingsSection({
            id: GIT_OPS_SETTINGS_SECTION_ID,
            title: label("Source Control", "core.settings.sections.git.title"),
            description: label("Repository and identity settings.", "core.settings.sections.git.description"),
            order: 20,
            panel: "git",
            icon: { kind: "lucide", name: "GitBranch" },
            schemaPath: "manifest.settingsSchema",
            schema: gitOpsManifest.settingsSchema,
            render: options.renderSettings,
          });

          await context.host.diagnostics.publish(context.extensionId, {
            severity: "info",
            code: "EXT_GIT_OPS_READY",
            message: "Git Operations module registered.",
          });
        },
      };

      return extension;
    },
  };
}
