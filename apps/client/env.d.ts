declare const __APP_VERSION__: string;
declare const __APP_BUILD_ID__: string;
declare const __PACKAGE_NAME__: string;
declare const __APP_STORAGE_SCHEMA__: string;

interface DesktopMarkdownFile {
  path: string;
  name: string;
  content: string;
}

interface DesktopWorkspaceEntry {
  path: string;
  relativePath: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
}

interface DesktopWorkspaceSnapshot {
  rootPath: string;
  name: string;
  entries: DesktopWorkspaceEntry[];
}

interface DesktopShellApi {
  readonly isDesktop: boolean;
  openMarkdownFiles(): Promise<DesktopMarkdownFile[]>;
  saveMarkdownFile(payload: { path: string; content: string }): Promise<{ path: string }>;
  getDesktopPath(): Promise<string>;
  openProjectDirectory(): Promise<DesktopWorkspaceSnapshot | null>;
  readProjectDirectory(payload: { rootPath: string }): Promise<DesktopWorkspaceSnapshot>;
  createProjectDirectory(payload: { name: string; parentPath?: string }): Promise<DesktopWorkspaceSnapshot>;
  createDirectory(payload: { path: string }): Promise<{ path: string }>;
  renamePath(payload: { path: string; nextPath: string }): Promise<{ path: string }>;
  deletePath(payload: { path: string }): Promise<{ path: string }>;
  movePath(payload: { path: string; targetFolderPath: string }): Promise<{ path: string }>;
  getLaunchMarkdownFiles(): Promise<DesktopMarkdownFile[]>;
  onOpenMarkdownFiles(listener: (files: DesktopMarkdownFile[]) => void): () => void;
  onSaveActiveMarkdownRequested(listener: () => void): () => void;
}

interface Window {
  desktopShell?: DesktopShellApi;
}
