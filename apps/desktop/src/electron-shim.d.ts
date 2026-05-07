declare namespace Electron {
  interface IpcRendererEvent {}
}

declare module 'electron' {
  export const app: any;
  export const BrowserWindow: any;
  export const Menu: any;
  export const dialog: any;
  export const ipcMain: any;
  export const contextBridge: any;
  export const ipcRenderer: any;
}
