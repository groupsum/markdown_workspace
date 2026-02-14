
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
  oidcProvider: OidcProviderId | '';
  oidcConnected: boolean;
  oidcSubject: string;
}

export type OidcProviderId = 'github' | 'gitlab' | 'gitea';

export interface OidcCredential {
  provider: OidcProviderId;
  subject: string;
  username: string;
  accessToken: string;
  idToken?: string;
  expiresAt?: number;
  issuedAt: number;
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
