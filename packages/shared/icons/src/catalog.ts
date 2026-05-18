export const WORKSPACE_ICON_IDS = [
  "workspace.project",
  "workspace.project.create",
  "workspace.project.open",
  "workspace.file",
  "workspace.file.create",
  "workspace.file.download",
  "workspace.file.import",
  "workspace.file.open",
  "workspace.folder.create",
  "workspace.git.branch",
  "workspace.git.diff",
  "workspace.sync.refresh",
  "workspace.settings",
  "workspace.settings.gestures",
  "workspace.settings.keyboard",
  "workspace.action.rail",
  "workspace.action.more",
  "workspace.layout.grid",
  "workspace.layout.columns",
  "workspace.layout.single",
  "workspace.layout.split",
  "workspace.sidebar.toggle",
  "workspace.preview.eye",
  "workspace.theme.palette",
  "workspace.theme.sun",
  "workspace.theme.moon",
  "workspace.zoom.in",
  "workspace.zoom.out",
  "workspace.zoom.reset",
  "workspace.status.warning",
  "workspace.status.ok",
  "workspace.status.error",
  "workspace.network.cloud.off",
  "workspace.network.wifi.off",
  "workspace.search",
  "workspace.close",
  "workspace.add",
  "workspace.remove",
  "workspace.download",
  "workspace.upload",
  "workspace.save",
  "workspace.terminal",
  "workspace.code",
  "workspace.book",
  "extension.manager",
  "extension.runtime",
  "extension.gemini-agent",
  "extension.theme-studio",
  "extension.language-pack-studio",
] as const;

export type WorkspaceIconId = typeof WORKSPACE_ICON_IDS[number];

export interface WorkspaceIconDefinition {
  readonly id: WorkspaceIconId;
  readonly lucideName: string;
  readonly category:
    | "workspace"
    | "file"
    | "git"
    | "theme"
    | "status"
    | "network"
    | "extension"
    | "navigation";
  readonly description: string;
}

export const WORKSPACE_ICON_CATALOG = [
  { id: "workspace.project", lucideName: "Folder", category: "workspace", description: "Project or folder icon." },
  { id: "workspace.project.create", lucideName: "FolderPlus", category: "workspace", description: "Create-project or create-folder icon." },
  { id: "workspace.project.open", lucideName: "FolderOpen", category: "workspace", description: "Open-project or open-folder icon." },
  { id: "workspace.file", lucideName: "FileText", category: "file", description: "Markdown file icon." },
  { id: "workspace.file.create", lucideName: "FilePlus", category: "file", description: "Create-file icon." },
  { id: "workspace.file.download", lucideName: "FileDown", category: "file", description: "Export or download-file icon." },
  { id: "workspace.file.import", lucideName: "Upload", category: "file", description: "Import-file icon." },
  { id: "workspace.file.open", lucideName: "FolderOpen", category: "file", description: "Open-file icon." },
  { id: "workspace.folder.create", lucideName: "FolderPlus", category: "file", description: "Create-folder icon." },
  { id: "workspace.git.branch", lucideName: "GitBranch", category: "git", description: "Git branch icon." },
  { id: "workspace.git.diff", lucideName: "FileDiff", category: "git", description: "Git diff icon." },
  { id: "workspace.sync.refresh", lucideName: "RefreshCw", category: "workspace", description: "Refresh or sync icon." },
  { id: "workspace.settings", lucideName: "Settings", category: "workspace", description: "Settings icon." },
  { id: "workspace.settings.gestures", lucideName: "Hand", category: "workspace", description: "Touch and gesture settings icon." },
  { id: "workspace.settings.keyboard", lucideName: "Keyboard", category: "workspace", description: "Keyboard settings icon." },
  { id: "workspace.action.rail", lucideName: "PanelLeft", category: "navigation", description: "Action rail icon." },
  { id: "workspace.action.more", lucideName: "MoreHorizontal", category: "navigation", description: "More-actions icon." },
  { id: "workspace.layout.grid", lucideName: "LayoutGrid", category: "workspace", description: "Grid layout icon." },
  { id: "workspace.layout.columns", lucideName: "Columns", category: "workspace", description: "Columns layout icon." },
  { id: "workspace.layout.single", lucideName: "PanelTop", category: "workspace", description: "Single-pane layout icon." },
  { id: "workspace.layout.split", lucideName: "PanelLeftRight", category: "workspace", description: "Split-pane layout icon." },
  { id: "workspace.sidebar.toggle", lucideName: "PanelLeft", category: "navigation", description: "Toggle-sidebar icon." },
  { id: "workspace.preview.eye", lucideName: "Eye", category: "workspace", description: "Preview or visibility icon." },
  { id: "workspace.theme.palette", lucideName: "Palette", category: "theme", description: "Theme or palette icon." },
  { id: "workspace.theme.sun", lucideName: "Sun", category: "theme", description: "Light theme icon." },
  { id: "workspace.theme.moon", lucideName: "Moon", category: "theme", description: "Dark theme icon." },
  { id: "workspace.zoom.in", lucideName: "ZoomIn", category: "navigation", description: "Zoom-in icon." },
  { id: "workspace.zoom.out", lucideName: "ZoomOut", category: "navigation", description: "Zoom-out icon." },
  { id: "workspace.zoom.reset", lucideName: "RotateCcw", category: "navigation", description: "Reset-zoom icon." },
  { id: "workspace.status.warning", lucideName: "AlertTriangle", category: "status", description: "Warning status icon." },
  { id: "workspace.status.ok", lucideName: "CheckCircle", category: "status", description: "Success status icon." },
  { id: "workspace.status.error", lucideName: "XCircle", category: "status", description: "Error status icon." },
  { id: "workspace.network.cloud.off", lucideName: "CloudOff", category: "network", description: "Disconnected cloud icon." },
  { id: "workspace.network.wifi.off", lucideName: "WifiOff", category: "network", description: "Disconnected network icon." },
  { id: "workspace.search", lucideName: "Search", category: "navigation", description: "Search icon." },
  { id: "workspace.close", lucideName: "X", category: "navigation", description: "Close icon." },
  { id: "workspace.add", lucideName: "Plus", category: "navigation", description: "Add icon." },
  { id: "workspace.remove", lucideName: "Minus", category: "navigation", description: "Remove icon." },
  { id: "workspace.download", lucideName: "Download", category: "navigation", description: "Download icon." },
  { id: "workspace.upload", lucideName: "ArrowUpCircle", category: "navigation", description: "Upload icon." },
  { id: "workspace.save", lucideName: "Save", category: "navigation", description: "Save icon." },
  { id: "workspace.terminal", lucideName: "Terminal", category: "workspace", description: "Terminal icon." },
  { id: "workspace.code", lucideName: "Code", category: "workspace", description: "Code icon." },
  { id: "workspace.book", lucideName: "Book", category: "workspace", description: "Documentation icon." },
  { id: "extension.manager", lucideName: "Puzzle", category: "extension", description: "Extension Manager icon." },
  { id: "extension.runtime", lucideName: "Plug", category: "extension", description: "Extension runtime icon." },
  { id: "extension.gemini-agent", lucideName: "Bot", category: "extension", description: "Gemini Agent extension icon." },
  { id: "extension.theme-studio", lucideName: "Brush", category: "extension", description: "Theme Studio extension icon." },
  { id: "extension.language-pack-studio", lucideName: "Languages", category: "extension", description: "Language Pack Studio extension icon." },
] as const satisfies readonly WorkspaceIconDefinition[];

export function getWorkspaceIconDefinition(id: WorkspaceIconId): WorkspaceIconDefinition | undefined {
  return WORKSPACE_ICON_CATALOG.find((definition) => definition.id === id);
}
