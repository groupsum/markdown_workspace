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

type DesktopShellInfo = {
  productName: string;
  version: string;
  isPackaged: boolean;
  platform: string;
};

const pendingOpenMarkdownFiles: ExternalMarkdownFile[] = [];
const openMarkdownListeners = new Set<(files: ExternalMarkdownFile[]) => void>();

const drainPendingOpenMarkdownFiles = (): ExternalMarkdownFile[] => {
  if (pendingOpenMarkdownFiles.length === 0) {
    return [];
  }
  const drained = [...pendingOpenMarkdownFiles];
  pendingOpenMarkdownFiles.length = 0;
  return drained;
};

const bufferOpenMarkdownFiles = (files: ExternalMarkdownFile[] | null | undefined) => {
  if (!files || files.length === 0) {
    return;
  }

  pendingOpenMarkdownFiles.push(...files);
  const drained = drainPendingOpenMarkdownFiles();
  if (drained.length === 0 || openMarkdownListeners.size === 0) {
    pendingOpenMarkdownFiles.push(...drained);
    return;
  }

  openMarkdownListeners.forEach((listener) => listener(drained));
};

ipcRenderer.on('desktop:open-markdown-files', (_event, files: ExternalMarkdownFile[]) => {
  bufferOpenMarkdownFiles(files);
});

void ipcRenderer.invoke('desktop:get-launch-markdown-files')
  .then((files: ExternalMarkdownFile[]) => {
    bufferOpenMarkdownFiles(files);
  })
  .catch(() => {
    // Ignore early launch-buffer failures; renderer can still request again later.
  });

const desktopShell = {
  isDesktop: true,
  openMarkdownFiles: (): Promise<ExternalMarkdownFile[]> => ipcRenderer.invoke('desktop:open-markdown-files'),
  saveMarkdownFile: (payload: { path: string; content: string }): Promise<{ path: string }> =>
    ipcRenderer.invoke('desktop:save-markdown-file', payload),
  getDesktopPath: (): Promise<string> => ipcRenderer.invoke('desktop:get-desktop-path'),
  getShellInfo: (): Promise<DesktopShellInfo> => ipcRenderer.invoke('desktop:get-shell-info'),
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
  getLaunchMarkdownFiles: async (): Promise<ExternalMarkdownFile[]> => {
    const files = await ipcRenderer.invoke('desktop:get-launch-markdown-files');
    bufferOpenMarkdownFiles(files);
    return drainPendingOpenMarkdownFiles();
  },
  onOpenMarkdownFiles: (listener: (files: ExternalMarkdownFile[]) => void) => {
    openMarkdownListeners.add(listener);
    const pendingFiles = drainPendingOpenMarkdownFiles();
    if (pendingFiles.length > 0) {
      listener(pendingFiles);
    }
    return () => {
      openMarkdownListeners.delete(listener);
    };
  },
  onMountProjectDirectory: (listener: (snapshot: DesktopWorkspaceSnapshot) => void) => {
    const wrapped = (_event: Electron.IpcRendererEvent, snapshot: DesktopWorkspaceSnapshot) => listener(snapshot);
    ipcRenderer.on('desktop:mount-project-directory', wrapped);
    return () => {
      ipcRenderer.removeListener('desktop:mount-project-directory', wrapped);
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
