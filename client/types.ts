
export interface FileNode {
  id: string;
  projectId: string; // Linked to Project
  parentId: string | null;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  lastModified: number;
}

export interface Project {
  id: string;
  name: string;
  gitConfig: GitConfig;
  lastOpened: number;
  createdAt: number;
}

export interface FileSystemState {
  files: Record<string, FileNode>;
  rootIds: string[];
}

export type ViewMode = 'editor' | 'preview' | 'split';
export type AppMode = 'work' | 'git';

export type AppTheme = string;

export interface Tab {
  id: string; // Unique tab ID
  fileId: string;
}

export interface GitConfig {
  repoUrl: string;
  branch: string;
  username: string;
  pat: string;
}

export interface KeyMap {
  save: string;
  toggleSidebar: string;
  search: string;
  commandPalette: string;
}

export interface AppState {
  activeFileId: string | null;
  viewMode: ViewMode;
  sidebarOpen: boolean;
  unsavedChanges: boolean;
  uiDensity: number;
  theme: AppTheme;
}
