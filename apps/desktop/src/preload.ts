import { contextBridge, ipcRenderer } from 'electron';

type ExternalMarkdownFile = {
  path: string;
  name: string;
  content: string;
};

type DesktopWorkspaceEntry = {
  path: string;
  relativePath: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
};

type DesktopWorkspaceSnapshot = {
  rootPath: string;
  name: string;
  entries: DesktopWorkspaceEntry[];
};

const desktopShell = {
  isDesktop: true,
  openMarkdownFiles: (): Promise<ExternalMarkdownFile[]> => ipcRenderer.invoke('desktop:open-markdown-files'),
  saveMarkdownFile: (payload: { path: string; content: string }): Promise<{ path: string }> =>
    ipcRenderer.invoke('desktop:save-markdown-file', payload),
  getDesktopPath: (): Promise<string> => ipcRenderer.invoke('desktop:get-desktop-path'),
  openProjectDirectory: (): Promise<DesktopWorkspaceSnapshot | null> => ipcRenderer.invoke('desktop:open-project-directory'),
  readProjectDirectory: (payload: { rootPath: string }): Promise<DesktopWorkspaceSnapshot> =>
    ipcRenderer.invoke('desktop:read-project-directory', payload),
  createProjectDirectory: (payload: { name: string; parentPath?: string }): Promise<DesktopWorkspaceSnapshot> =>
    ipcRenderer.invoke('desktop:create-project-directory', payload),
  createDirectory: (payload: { path: string }): Promise<{ path: string }> =>
    ipcRenderer.invoke('desktop:create-directory', payload),
  renamePath: (payload: { path: string; nextPath: string }): Promise<{ path: string }> =>
    ipcRenderer.invoke('desktop:rename-path', payload),
  deletePath: (payload: { path: string }): Promise<{ path: string }> =>
    ipcRenderer.invoke('desktop:delete-path', payload),
  movePath: (payload: { path: string; targetFolderPath: string }): Promise<{ path: string }> =>
    ipcRenderer.invoke('desktop:move-path', payload),
  getLaunchMarkdownFiles: (): Promise<ExternalMarkdownFile[]> => ipcRenderer.invoke('desktop:get-launch-markdown-files'),
  onOpenMarkdownFiles: (listener: (files: ExternalMarkdownFile[]) => void) => {
    const wrapped = (_event: Electron.IpcRendererEvent, files: ExternalMarkdownFile[]) => listener(files);
    ipcRenderer.on('desktop:open-markdown-files', wrapped);
    return () => {
      ipcRenderer.removeListener('desktop:open-markdown-files', wrapped);
    };
  },
  onSaveActiveMarkdownRequested: (listener: () => void) => {
    const wrapped = () => listener();
    ipcRenderer.on('desktop:save-active-markdown', wrapped);
    return () => {
      ipcRenderer.removeListener('desktop:save-active-markdown', wrapped);
    };
  },
};

contextBridge.exposeInMainWorld('desktopShell', desktopShell);
