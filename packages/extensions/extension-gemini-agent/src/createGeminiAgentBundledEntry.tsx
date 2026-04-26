import React from "react";
import type { MarkdownWorkspaceExtension } from "@mdwrk/extension-host";
import type { BundledExtensionCatalogEntry } from "@mdwrk/extension-runtime";
import {
  GEMINI_AGENT_COMMAND_APPLY_DRAFT_TO_SELECTION_ID,
  GEMINI_AGENT_COMMAND_OPEN_ID,
  GEMINI_AGENT_COMMAND_REPLACE_DOCUMENT_WITH_DRAFT_ID,
  GEMINI_AGENT_COMMAND_REWRITE_SELECTION_ID,
  GEMINI_AGENT_COMMAND_SUMMARIZE_FILE_ID,
  GEMINI_AGENT_RAIL_ID,
  GEMINI_AGENT_SERVICE_TOKEN,
  GEMINI_AGENT_VIEW_ID,
} from "./constants.js";
import { geminiAgentLabels, geminiAgentLocaleLoader } from "./i18n.js";
import { geminiAgentManifest } from "./manifest.js";
import { createGeminiTextProvider } from "./provider.js";
import { createGeminiAgentService } from "./service.js";
import type { GeminiAgentEntryOptions, GeminiAgentViewInput } from "./types.js";
import { GeminiAgentSidebar, GeminiAgentView } from "./components/GeminiAgentView.js";

export function createGeminiAgentBundledEntry(options: GeminiAgentEntryOptions = {}): BundledExtensionCatalogEntry {
  return {
    manifest: geminiAgentManifest,
    activation: "eager",
    async load() {
      const extension: MarkdownWorkspaceExtension = {
        manifest: geminiAgentManifest,
        async activate(context) {
          context.registerLocaleCatalogLoader(geminiAgentLocaleLoader);
          await context.host.i18n.ensureLocale();

          const provider = options.provider ?? createGeminiTextProvider();
          const service = createGeminiAgentService({
            context,
            provider,
            formatLabel: context.host.i18n.format,
          });

          context.registerService(GEMINI_AGENT_SERVICE_TOKEN, service);

          context.registerCommand({
            id: GEMINI_AGENT_COMMAND_OPEN_ID,
            title: geminiAgentLabels.commandOpenTitle,
            description: geminiAgentLabels.commandOpenDescription,
            icon: { kind: "lucide", name: "Bot" },
            keywords: ["gemini", "agent", "assistant"],
            execute: async () => {
              await context.host.views.open(GEMINI_AGENT_VIEW_ID);
            },
          });

          context.registerCommand({
            id: GEMINI_AGENT_COMMAND_SUMMARIZE_FILE_ID,
            title: geminiAgentLabels.commandSummarizeTitle,
            description: geminiAgentLabels.commandSummarizeDescription,
            icon: { kind: "lucide", name: "FileText" },
            keywords: ["gemini", "summary", "document", "markdown"],
            execute: async () => {
              await context.host.views.open(GEMINI_AGENT_VIEW_ID, { intent: "summarize-current-file" } satisfies GeminiAgentViewInput);
            },
          });

          context.registerCommand({
            id: GEMINI_AGENT_COMMAND_REWRITE_SELECTION_ID,
            title: geminiAgentLabels.commandRewriteTitle,
            description: geminiAgentLabels.commandRewriteDescription,
            icon: { kind: "lucide", name: "Pencil" },
            keywords: ["gemini", "rewrite", "selection", "draft"],
            execute: async () => {
              await context.host.views.open(GEMINI_AGENT_VIEW_ID, { intent: "rewrite-selection" } satisfies GeminiAgentViewInput);
            },
          });

          context.registerCommand({
            id: GEMINI_AGENT_COMMAND_APPLY_DRAFT_TO_SELECTION_ID,
            title: geminiAgentLabels.commandApplySelectionTitle,
            description: geminiAgentLabels.commandApplySelectionDescription,
            icon: { kind: "lucide", name: "Save" },
            keywords: ["gemini", "apply", "selection", "draft"],
            execute: async () => {
              await service.applyDraft("selection");
            },
          });

          context.registerCommand({
            id: GEMINI_AGENT_COMMAND_REPLACE_DOCUMENT_WITH_DRAFT_ID,
            title: geminiAgentLabels.commandReplaceDocumentTitle,
            description: geminiAgentLabels.commandReplaceDocumentDescription,
            icon: { kind: "lucide", name: "Save" },
            keywords: ["gemini", "replace", "document", "draft"],
            execute: async () => {
              await service.applyDraft("document");
            },
          });

          context.registerWorkspaceModule({
            ...geminiAgentManifest.contributions.workspaceModules![0],
            render: (props) => (
              <GeminiAgentView
                close={() => (props as { close: () => Promise<void> }).close()}
                formatLabel={context.host.i18n.format}
                service={service}
                input={((props as { input?: unknown }).input ?? null) as GeminiAgentViewInput | null}
                shellSidebarOpen={(props as { workspaceSidebarOpen?: boolean }).workspaceSidebarOpen}
                onShellSidebarToggle={(props as { setWorkspaceSidebarOpen?: (open: boolean) => void }).setWorkspaceSidebarOpen}
                embedBrowserInShellSidebar={Boolean((props as { setWorkspaceSidebarOpen?: (open: boolean) => void }).setWorkspaceSidebarOpen)}
              />
            ),
            renderExplorer: () => (
              <GeminiAgentSidebar
                service={service}
                formatLabel={context.host.i18n.format}
              />
            ),
          });

          context.registerActionRailItem({
            id: GEMINI_AGENT_RAIL_ID,
            title: geminiAgentLabels.railTitle,
            icon: { kind: "lucide", name: "Bot" },
            group: "assistant",
            order: 10,
            target: {
              kind: "view",
              viewId: GEMINI_AGENT_VIEW_ID,
            },
          });

          context.registerSettingsSection(({
            id: `${context.extensionId}.settings`,
            title: geminiAgentLabels.settingsTitle,
            description: geminiAgentLabels.settingsDescription,
            order: 10,
            schemaPath: "manifest.settingsSchema",
            schema: geminiAgentManifest.settingsSchema,
          } as unknown) as never);

          await context.host.diagnostics.publish(context.extensionId, {
            severity: "info",
            code: "EXT_GEMINI_READY",
            message: context.host.i18n.format(geminiAgentLabels.diagnosticsReady),
          });
        },
      };

      return extension;
    },
  };
}
