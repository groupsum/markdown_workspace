import { WORKSPACE_FILES_COMMAND_DELETE_ID, WORKSPACE_FILES_COMMAND_DOWNLOAD_WORKSPACE_ID, WORKSPACE_FILES_COMMAND_EXPORT_HTML_ID, WORKSPACE_FILES_COMMAND_FOCUS_EXPLORER_ID, WORKSPACE_FILES_COMMAND_IMPORT_MARKDOWN_ID, WORKSPACE_FILES_COMMAND_NEW_FILE_ID, WORKSPACE_FILES_COMMAND_NEW_FOLDER_ID, WORKSPACE_FILES_COMMAND_OPEN_HOST_FILE_ID, WORKSPACE_FILES_COMMAND_PRINT_PREVIEW_ID, WORKSPACE_FILES_COMMAND_RENAME_ID, WORKSPACE_FILES_COMMAND_SAVE_FILE_ID, WORKSPACE_FILES_COMMAND_TOGGLE_EXPLORER_ID, WORKSPACE_FILES_COMMAND_VIEW_EDITOR_ID, WORKSPACE_FILES_COMMAND_VIEW_PREVIEW_ID, WORKSPACE_FILES_COMMAND_VIEW_SPLIT_ID, WORKSPACE_FILES_RAIL_DOWNLOAD_ID, WORKSPACE_FILES_RAIL_EXPORT_HTML_ID, WORKSPACE_FILES_RAIL_IMPORT_MARKDOWN_ID, WORKSPACE_FILES_RAIL_NEW_FILE_ID, WORKSPACE_FILES_RAIL_NEW_FOLDER_ID, WORKSPACE_FILES_RAIL_OPEN_HOST_FILE_ID, WORKSPACE_FILES_RAIL_PRINT_PREVIEW_ID, WORKSPACE_FILES_RAIL_TOGGLE_EXPLORER_ID, WORKSPACE_FILES_SETTINGS_SECTION_ID, } from "./constants.js";
import { workspaceFilesManifest } from "./manifest.js";
const label = (defaultMessage, key) => ({ defaultMessage, key });
export function createWorkspaceFilesBundledEntry(options) {
    return {
        manifest: workspaceFilesManifest,
        activation: "eager",
        async load() {
            const extension = {
                manifest: workspaceFilesManifest,
                async activate(context) {
                    const registerCommand = (id, title, execute, iconName) => {
                        context.registerCommand({
                            id,
                            title: label(title),
                            icon: { kind: "lucide", name: iconName },
                            execute,
                        });
                    };
                    registerCommand(WORKSPACE_FILES_COMMAND_TOGGLE_EXPLORER_ID, "Toggle Explorer", options.actions.toggleExplorer, "Folder");
                    registerCommand(WORKSPACE_FILES_COMMAND_NEW_FILE_ID, "Create New File", options.actions.newFile, "FilePlus");
                    registerCommand(WORKSPACE_FILES_COMMAND_NEW_FOLDER_ID, "Create New Folder", options.actions.newFolder, "FolderPlus");
                    registerCommand(WORKSPACE_FILES_COMMAND_SAVE_FILE_ID, "Save Current File", options.actions.saveCurrentFile, "Save");
                    registerCommand(WORKSPACE_FILES_COMMAND_RENAME_ID, "Rename Selected Item", options.actions.renameSelected, "Pencil");
                    registerCommand(WORKSPACE_FILES_COMMAND_DELETE_ID, "Delete Selected Item", options.actions.deleteSelected, "Trash2");
                    registerCommand(WORKSPACE_FILES_COMMAND_IMPORT_MARKDOWN_ID, "Import Markdown", options.actions.importMarkdown, "Upload");
                    registerCommand(WORKSPACE_FILES_COMMAND_OPEN_HOST_FILE_ID, "Open Markdown File", options.actions.openHostFile, "FolderOpen");
                    registerCommand(WORKSPACE_FILES_COMMAND_DOWNLOAD_WORKSPACE_ID, "Download Workspace", options.actions.downloadWorkspace, "Download");
                    registerCommand(WORKSPACE_FILES_COMMAND_EXPORT_HTML_ID, "Export HTML", options.actions.exportHtml, "FileDown");
                    registerCommand(WORKSPACE_FILES_COMMAND_PRINT_PREVIEW_ID, "Print Preview", options.actions.printPreview, "Printer");
                    registerCommand(WORKSPACE_FILES_COMMAND_VIEW_EDITOR_ID, "Editor View", options.actions.viewEditor, "LayoutGrid");
                    registerCommand(WORKSPACE_FILES_COMMAND_VIEW_SPLIT_ID, "Split View", options.actions.viewSplit, "Columns");
                    registerCommand(WORKSPACE_FILES_COMMAND_VIEW_PREVIEW_ID, "Preview View", options.actions.viewPreview, "Eye");
                    registerCommand(WORKSPACE_FILES_COMMAND_FOCUS_EXPLORER_ID, "Focus Explorer", options.actions.focusExplorer, "Folder");
                    context.registerWorkspaceModule({
                        ...workspaceFilesManifest.contributions.workspaceModules[0],
                        render: (props) => options.renderWorkspace(props),
                        renderExplorer: (props) => options.renderExplorer(props),
                    });
                    const registerRail = (id, title, iconName, order, commandId, group) => {
                        context.registerActionRailItem({
                            id,
                            title: label(title),
                            icon: { kind: "lucide", name: iconName },
                            group,
                            order,
                            target: { kind: "command", commandId },
                            isActive: id === WORKSPACE_FILES_RAIL_TOGGLE_EXPLORER_ID ? options.isExplorerActive : undefined,
                        });
                    };
                    registerRail(WORKSPACE_FILES_RAIL_TOGGLE_EXPLORER_ID, "Toggle Explorer", "Folder", 10, WORKSPACE_FILES_COMMAND_TOGGLE_EXPLORER_ID, "workspace.primary");
                    registerRail(WORKSPACE_FILES_RAIL_NEW_FILE_ID, "New File", "FilePlus", 20, WORKSPACE_FILES_COMMAND_NEW_FILE_ID, "workspace.primary");
                    registerRail(WORKSPACE_FILES_RAIL_NEW_FOLDER_ID, "New Folder", "FolderPlus", 30, WORKSPACE_FILES_COMMAND_NEW_FOLDER_ID, "workspace.primary");
                    registerRail(WORKSPACE_FILES_RAIL_DOWNLOAD_ID, "Download Workspace", "Download", 20, WORKSPACE_FILES_COMMAND_DOWNLOAD_WORKSPACE_ID, "workspace.secondary");
                    registerRail(WORKSPACE_FILES_RAIL_EXPORT_HTML_ID, "Export HTML", "FileDown", 30, WORKSPACE_FILES_COMMAND_EXPORT_HTML_ID, "workspace.secondary");
                    registerRail(WORKSPACE_FILES_RAIL_OPEN_HOST_FILE_ID, "Open Markdown File", "FolderOpen", 34, WORKSPACE_FILES_COMMAND_OPEN_HOST_FILE_ID, "workspace.secondary");
                    registerRail(WORKSPACE_FILES_RAIL_IMPORT_MARKDOWN_ID, "Import Markdown", "Upload", 35, WORKSPACE_FILES_COMMAND_IMPORT_MARKDOWN_ID, "workspace.secondary");
                    registerRail(WORKSPACE_FILES_RAIL_PRINT_PREVIEW_ID, "Print Preview", "Printer", 40, WORKSPACE_FILES_COMMAND_PRINT_PREVIEW_ID, "workspace.secondary");
                    context.registerSettingsSection({
                        id: WORKSPACE_FILES_SETTINGS_SECTION_ID,
                        title: label("Workspace Files"),
                        description: label("File explorer, editor, preview, import, and export settings."),
                        order: 12,
                        panel: "session",
                        icon: { kind: "lucide", name: "Folder" },
                        schemaPath: "manifest.settingsSchema",
                        schema: workspaceFilesManifest.settingsSchema,
                        render: options.renderSettings,
                    });
                    await context.host.diagnostics.publish(context.extensionId, {
                        severity: "info",
                        code: "EXT_WORKSPACE_FILES_READY",
                        message: "Workspace Files module registered.",
                    });
                },
            };
            return extension;
        },
    };
}
//# sourceMappingURL=createWorkspaceFilesBundledEntry.js.map