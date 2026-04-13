import { contextBridge, ipcRenderer } from 'electron';

type ExternalMarkdownFile = {
  path: string;
  name: string;
  content: string;
};

const desktopShell = {
  isDesktop: true,
  openMarkdownFiles: (): Promise<ExternalMarkdownFile[]> => ipcRenderer.invoke('desktop:open-markdown-files'),
  saveMarkdownFile: (payload: { path: string; content: string }): Promise<{ path: string }> =>
    ipcRenderer.invoke('desktop:save-markdown-file', payload),
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
