import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const preloadPath = path.join(__dirname, 'preload.js');
const isDev = Boolean(process.env.MDWRK_CLIENT_DEV_URL);

function getClientIndexPath(): string {
  const clientDistDir = app.isPackaged
    ? path.resolve(__dirname, '../client/dist')
    : path.resolve(__dirname, '../../client/dist');
  return path.join(clientDistDir, 'index.html');
}

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

async function pathExists(candidate: string): Promise<boolean> {
  try {
    await fs.access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function readMarkdownFiles(pathsToRead: readonly string[]): Promise<ExternalMarkdownFile[]> {
  const uniquePaths = Array.from(new Set(normalizeMarkdownPaths(pathsToRead)));
  return Promise.all(uniquePaths.map(async (filePath) => ({
    path: filePath,
    name: path.basename(filePath),
    content: await fs.readFile(filePath, 'utf8'),
  })));
}

async function collectWorkspaceEntries(rootPath: string): Promise<DesktopWorkspaceEntry[]> {
  const normalizedRootPath = path.resolve(rootPath);
  const entries: DesktopWorkspaceEntry[] = [];

  const visitDirectory = async (directoryPath: string): Promise<boolean> => {
    const dirents = await fs.readdir(directoryPath, { withFileTypes: true });
    let hasMarkdownDescendant = false;

    for (const dirent of dirents) {
      const absolutePath = path.join(directoryPath, dirent.name);
      const relativePath = path.relative(normalizedRootPath, absolutePath);

      if (dirent.isDirectory()) {
        const childHasMarkdown = await visitDirectory(absolutePath);
        if (childHasMarkdown) {
          entries.push({
            path: absolutePath,
            relativePath,
            name: dirent.name,
            type: 'folder',
          });
          hasMarkdownDescendant = true;
        }
        continue;
      }

      if (!dirent.isFile() || !isMarkdownPath(dirent.name)) {
        continue;
      }

      entries.push({
        path: absolutePath,
        relativePath,
        name: dirent.name,
        type: 'file',
        content: await fs.readFile(absolutePath, 'utf8'),
      });
      hasMarkdownDescendant = true;
    }

    return hasMarkdownDescendant;
  };

  await visitDirectory(normalizedRootPath);

  return entries.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

async function readMarkdownWorkspace(rootPath: string): Promise<DesktopWorkspaceSnapshot> {
  const normalizedRootPath = path.resolve(rootPath);
  return {
    rootPath: normalizedRootPath,
    name: path.basename(normalizedRootPath),
    entries: await collectWorkspaceEntries(normalizedRootPath),
  };
}

function queueOpenPaths(pathsToQueue: readonly string[]): void {
  if (pathsToQueue.length === 0) {
    return;
  }

  pendingOpenPaths = Array.from(new Set([...pendingOpenPaths, ...normalizeMarkdownPaths(pathsToQueue)]));
}

async function deliverOpenPaths(pathsToOpen: readonly string[]): Promise<void> {
  if (!mainWindow) {
    queueOpenPaths(pathsToOpen);
    return;
  }

  const files = await readMarkdownFiles(pathsToOpen);
  if (files.length === 0) {
    return;
  }

  if (mainWindow.webContents.isLoading()) {
    queueOpenPaths(pathsToOpen);
    return;
  }

  mainWindow.webContents.send('desktop:open-markdown-files', files);
}

async function flushPendingOpenPaths(): Promise<void> {
  if (pendingOpenPaths.length === 0) {
    return;
  }

  const nextPaths = pendingOpenPaths;
  pendingOpenPaths = [];
  await deliverOpenPaths(nextPaths);
}

async function pickMarkdownFiles(): Promise<ExternalMarkdownFile[]> {
  if (!mainWindow) {
    return [];
  }

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

async function pickProjectDirectory(): Promise<DesktopWorkspaceSnapshot | null> {
  if (!mainWindow) {
    return null;
  }

  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Markdown Workspace Folder',
    defaultPath: app.getPath('desktop'),
    properties: ['openDirectory'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return readMarkdownWorkspace(result.filePaths[0]);
}

function buildMenu(): void {
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Markdown...',
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
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
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
    await mainWindow.loadFile(getClientIndexPath());
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

ipcMain.handle('desktop:get-desktop-path', async () => app.getPath('desktop'));

ipcMain.handle('desktop:open-project-directory', async () => pickProjectDirectory());

ipcMain.handle('desktop:read-project-directory', async (_event, payload: { rootPath: string }) => {
  if (!payload?.rootPath) {
    throw new Error('A rootPath is required to read a desktop workspace.');
  }

  return readMarkdownWorkspace(payload.rootPath);
});

ipcMain.handle('desktop:create-project-directory', async (_event, payload: { name: string; parentPath?: string }) => {
  const rawName = payload?.name?.trim();
  if (!rawName) {
    throw new Error('A project name is required to create a desktop workspace.');
  }

  const parentPath = path.resolve(payload.parentPath?.trim() || app.getPath('desktop'));
  const rootPath = path.join(parentPath, rawName);
  if (await pathExists(rootPath)) {
    throw new Error(`The folder "${rawName}" already exists.`);
  }

  await fs.mkdir(rootPath, { recursive: true });
  return readMarkdownWorkspace(rootPath);
});

ipcMain.handle('desktop:create-directory', async (_event, payload: { path: string }) => {
  if (!payload?.path) {
    throw new Error('A path is required to create a directory.');
  }

  await fs.mkdir(payload.path, { recursive: true });
  return { path: payload.path };
});

ipcMain.handle('desktop:rename-path', async (_event, payload: { path: string; nextPath: string }) => {
  if (!payload?.path || !payload?.nextPath) {
    throw new Error('Both source and destination paths are required to rename a filesystem node.');
  }

  await fs.rename(payload.path, payload.nextPath);
  return { path: payload.nextPath };
});

ipcMain.handle('desktop:delete-path', async (_event, payload: { path: string }) => {
  if (!payload?.path) {
    throw new Error('A path is required to delete a filesystem node.');
  }

  await fs.rm(payload.path, { recursive: true, force: false });
  return { path: payload.path };
});

ipcMain.handle('desktop:move-path', async (_event, payload: { path: string; targetFolderPath: string }) => {
  if (!payload?.path || !payload?.targetFolderPath) {
    throw new Error('Both a source path and target folder path are required to move a filesystem node.');
  }

  const nextPath = path.join(payload.targetFolderPath, path.basename(payload.path));
  await fs.rename(payload.path, nextPath);
  return { path: nextPath };
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
