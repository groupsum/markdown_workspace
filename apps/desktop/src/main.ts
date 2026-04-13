import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type ExternalMarkdownFile = {
  path: string;
  name: string;
  content: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistDir = path.resolve(__dirname, '../../client/dist');
const clientIndexPath = path.join(clientDistDir, 'index.html');
const preloadPath = path.join(__dirname, 'preload.js');
const isDev = Boolean(process.env.MDWRK_CLIENT_DEV_URL);

let mainWindow: BrowserWindow | null = null;
let pendingOpenPaths: string[] = [];

function isMarkdownPath(candidate: string): boolean {
  const ext = path.extname(candidate).toLowerCase();
  return ext === '.md' || ext === '.markdown';
}

function normalizeMarkdownPaths(candidates: readonly string[]): string[] {
  return candidates
    .filter((candidate) => Boolean(candidate) && isMarkdownPath(candidate))
    .map((candidate) => path.resolve(candidate));
}

async function readMarkdownFiles(pathsToRead: readonly string[]): Promise<ExternalMarkdownFile[]> {
  const uniquePaths = Array.from(new Set(normalizeMarkdownPaths(pathsToRead)));
  return Promise.all(uniquePaths.map(async (filePath) => ({
    path: filePath,
    name: path.basename(filePath),
    content: await fs.readFile(filePath, 'utf8'),
  })));
}

function queueOpenPaths(pathsToQueue: readonly string[]): void {
  if (pathsToQueue.length === 0) return;
  pendingOpenPaths = Array.from(new Set([...pendingOpenPaths, ...normalizeMarkdownPaths(pathsToQueue)]));
}

async function deliverOpenPaths(pathsToOpen: readonly string[]): Promise<void> {
  if (!mainWindow) {
    queueOpenPaths(pathsToOpen);
    return;
  }

  const files = await readMarkdownFiles(pathsToOpen);
  if (files.length === 0) return;

  if (mainWindow.webContents.isLoading()) {
    queueOpenPaths(pathsToOpen);
    return;
  }

  mainWindow.webContents.send('desktop:open-markdown-files', files);
}

async function flushPendingOpenPaths(): Promise<void> {
  if (pendingOpenPaths.length === 0) return;
  const nextPaths = pendingOpenPaths;
  pendingOpenPaths = [];
  await deliverOpenPaths(nextPaths);
}

async function pickMarkdownFiles(): Promise<ExternalMarkdownFile[]> {
  if (!mainWindow) return [];
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Markdown Files',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return [];
  }

  return readMarkdownFiles(result.filePaths);
}

function buildMenu(): void {
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Markdown…',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const files = await pickMarkdownFiles();
            if (files.length > 0) {
              mainWindow?.webContents.send('desktop:open-markdown-files', files);
            }
          },
        },
        {
          label: 'Save Active Markdown',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow?.webContents.send('desktop:save-active-markdown');
          },
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);
}

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1024,
    minWidth: 1100,
    minHeight: 760,
    autoHideMenuBar: false,
    backgroundColor: '#0e1318',
    title: 'MdWork Desktop',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.on('did-finish-load', () => {
    void flushPendingOpenPaths();
  });

  if (isDev) {
    await mainWindow.loadURL(process.env.MDWRK_CLIENT_DEV_URL as string);
  } else {
    await mainWindow.loadFile(clientIndexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }

    const pathsFromCommandLine = normalizeMarkdownPaths(commandLine.slice(1));
    if (pathsFromCommandLine.length > 0) {
      void deliverOpenPaths(pathsFromCommandLine);
    }
  });
}

app.on('open-file', (event, filePath) => {
  event.preventDefault();
  queueOpenPaths([filePath]);
  if (mainWindow) {
    void flushPendingOpenPaths();
  }
});

ipcMain.handle('desktop:get-launch-markdown-files', async () => {
  const nextPaths = pendingOpenPaths;
  pendingOpenPaths = [];
  return readMarkdownFiles(nextPaths);
});

ipcMain.handle('desktop:open-markdown-files', async () => pickMarkdownFiles());

ipcMain.handle('desktop:save-markdown-file', async (_event, payload: { path: string; content: string }) => {
  if (!payload?.path) {
    throw new Error('A target path is required to save Markdown content.');
  }

  await fs.writeFile(payload.path, payload.content, 'utf8');
  return { path: payload.path };
});

app.whenReady().then(async () => {
  buildMenu();

  const initialPaths = normalizeMarkdownPaths(process.argv.slice(1));
  queueOpenPaths(initialPaths);

  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
