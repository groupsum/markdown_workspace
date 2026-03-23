export declare const WORKSPACE_ICON_IDS: readonly ["workspace.project", "workspace.project.create", "workspace.file", "workspace.file.create", "workspace.file.download", "workspace.git.branch", "workspace.git.diff", "workspace.sync.refresh", "workspace.settings", "workspace.layout.grid", "workspace.layout.columns", "workspace.preview.eye", "workspace.theme.palette", "workspace.theme.sun", "workspace.theme.moon", "workspace.status.warning", "workspace.status.ok", "workspace.status.error", "workspace.network.cloud.off", "workspace.network.wifi.off", "workspace.search", "workspace.close", "workspace.add", "workspace.remove", "workspace.download", "workspace.upload", "workspace.save", "workspace.terminal", "workspace.code", "workspace.book", "extension.manager", "extension.runtime", "extension.gemini-agent", "extension.theme-studio"];
export type WorkspaceIconId = typeof WORKSPACE_ICON_IDS[number];
export interface WorkspaceIconDefinition {
    readonly id: WorkspaceIconId;
    readonly lucideName: string;
    readonly category: "workspace" | "file" | "git" | "theme" | "status" | "network" | "extension" | "navigation";
    readonly description: string;
}
export declare const WORKSPACE_ICON_CATALOG: readonly [{
    readonly id: "workspace.project";
    readonly lucideName: "Folder";
    readonly category: "workspace";
    readonly description: "Project or folder icon.";
}, {
    readonly id: "workspace.project.create";
    readonly lucideName: "FolderPlus";
    readonly category: "workspace";
    readonly description: "Create-project or create-folder icon.";
}, {
    readonly id: "workspace.file";
    readonly lucideName: "FileText";
    readonly category: "file";
    readonly description: "Markdown file icon.";
}, {
    readonly id: "workspace.file.create";
    readonly lucideName: "FilePlus";
    readonly category: "file";
    readonly description: "Create-file icon.";
}, {
    readonly id: "workspace.file.download";
    readonly lucideName: "FileDown";
    readonly category: "file";
    readonly description: "Export or download-file icon.";
}, {
    readonly id: "workspace.git.branch";
    readonly lucideName: "GitBranch";
    readonly category: "git";
    readonly description: "Git branch icon.";
}, {
    readonly id: "workspace.git.diff";
    readonly lucideName: "FileDiff";
    readonly category: "git";
    readonly description: "Git diff icon.";
}, {
    readonly id: "workspace.sync.refresh";
    readonly lucideName: "RefreshCw";
    readonly category: "workspace";
    readonly description: "Refresh or sync icon.";
}, {
    readonly id: "workspace.settings";
    readonly lucideName: "Settings";
    readonly category: "workspace";
    readonly description: "Settings icon.";
}, {
    readonly id: "workspace.layout.grid";
    readonly lucideName: "LayoutGrid";
    readonly category: "workspace";
    readonly description: "Grid layout icon.";
}, {
    readonly id: "workspace.layout.columns";
    readonly lucideName: "Columns";
    readonly category: "workspace";
    readonly description: "Columns layout icon.";
}, {
    readonly id: "workspace.preview.eye";
    readonly lucideName: "Eye";
    readonly category: "workspace";
    readonly description: "Preview or visibility icon.";
}, {
    readonly id: "workspace.theme.palette";
    readonly lucideName: "Palette";
    readonly category: "theme";
    readonly description: "Theme or palette icon.";
}, {
    readonly id: "workspace.theme.sun";
    readonly lucideName: "Sun";
    readonly category: "theme";
    readonly description: "Light theme icon.";
}, {
    readonly id: "workspace.theme.moon";
    readonly lucideName: "Moon";
    readonly category: "theme";
    readonly description: "Dark theme icon.";
}, {
    readonly id: "workspace.status.warning";
    readonly lucideName: "AlertTriangle";
    readonly category: "status";
    readonly description: "Warning status icon.";
}, {
    readonly id: "workspace.status.ok";
    readonly lucideName: "CheckCircle";
    readonly category: "status";
    readonly description: "Success status icon.";
}, {
    readonly id: "workspace.status.error";
    readonly lucideName: "XCircle";
    readonly category: "status";
    readonly description: "Error status icon.";
}, {
    readonly id: "workspace.network.cloud.off";
    readonly lucideName: "CloudOff";
    readonly category: "network";
    readonly description: "Disconnected cloud icon.";
}, {
    readonly id: "workspace.network.wifi.off";
    readonly lucideName: "WifiOff";
    readonly category: "network";
    readonly description: "Disconnected network icon.";
}, {
    readonly id: "workspace.search";
    readonly lucideName: "Search";
    readonly category: "navigation";
    readonly description: "Search icon.";
}, {
    readonly id: "workspace.close";
    readonly lucideName: "X";
    readonly category: "navigation";
    readonly description: "Close icon.";
}, {
    readonly id: "workspace.add";
    readonly lucideName: "Plus";
    readonly category: "navigation";
    readonly description: "Add icon.";
}, {
    readonly id: "workspace.remove";
    readonly lucideName: "Minus";
    readonly category: "navigation";
    readonly description: "Remove icon.";
}, {
    readonly id: "workspace.download";
    readonly lucideName: "Download";
    readonly category: "navigation";
    readonly description: "Download icon.";
}, {
    readonly id: "workspace.upload";
    readonly lucideName: "ArrowUpCircle";
    readonly category: "navigation";
    readonly description: "Upload icon.";
}, {
    readonly id: "workspace.save";
    readonly lucideName: "Save";
    readonly category: "navigation";
    readonly description: "Save icon.";
}, {
    readonly id: "workspace.terminal";
    readonly lucideName: "Terminal";
    readonly category: "workspace";
    readonly description: "Terminal icon.";
}, {
    readonly id: "workspace.code";
    readonly lucideName: "Code";
    readonly category: "workspace";
    readonly description: "Code icon.";
}, {
    readonly id: "workspace.book";
    readonly lucideName: "Book";
    readonly category: "workspace";
    readonly description: "Documentation icon.";
}, {
    readonly id: "extension.manager";
    readonly lucideName: "Puzzle";
    readonly category: "extension";
    readonly description: "Extension Manager icon.";
}, {
    readonly id: "extension.runtime";
    readonly lucideName: "Plug";
    readonly category: "extension";
    readonly description: "Extension runtime icon.";
}, {
    readonly id: "extension.gemini-agent";
    readonly lucideName: "Bot";
    readonly category: "extension";
    readonly description: "Gemini Agent extension icon.";
}, {
    readonly id: "extension.theme-studio";
    readonly lucideName: "Brush";
    readonly category: "extension";
    readonly description: "Theme Studio extension icon.";
}];
export declare function getWorkspaceIconDefinition(id: WorkspaceIconId): WorkspaceIconDefinition | undefined;
//# sourceMappingURL=catalog.d.ts.map