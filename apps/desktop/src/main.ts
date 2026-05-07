import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDesktopAccessPolicy } from './accessPolicy.js';
import {
  DEFAULT_DESKTOP_WINDOW_STATE,
  normalizeDesktopWindowState,
  serializeDesktopWindowState,
  type DesktopWindowState,
} from './windowState.js';

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
const windowStatePath = path.join(app.getPath('userData'), 'desktop-window-state.json');
const accessPolicy = createDesktopAccessPolicy();

function getClientDistDir(): string {
  return app.isPackaged
    ? path.resolve(__dirname, '../client/dist')
    : path.resolve(__dirname, '../../client/dist');
}

async function getClientIndexPath(): Promise<string> {
  const clientDistDir = getClientDistDir();
  const versionManifestPath = path.join(clientDistDir, 'client', 'versions', 'index.json');

  try {
    const manifest = JSON.parse(await fs.readFile(versionManifestPath, 'utf8')) as {
      latest?: string;
      available?: Array<{ version?: string }>;
    };
    const latestVersion = manifest.latest || manifest.available?.[0]?.version;
    if (latestVersion) {
      const versionedIndexPath = path.join(clientDistDir, 'client', 'versions', latestVersion, 'index.html');
      if (await pathExists(versionedIndexPath)) {
        return versionedIndexPath;
      }
    }
  } catch {}

  return path.join(clientDistDir, 'index.html');
}

let mainWindow: any | null = null;
let pendingOpenPaths: string[] = [];
let pendingWindowStateWrite: NodeJS.Timeout | null = null;

function isMarkdownPath(candidate: string): boolean {
  const ext = path.extname(candidate).toLowerCase();
  return ext === '.md' || ext === '.markdown';
}

function stripWrappingQuotes(value: string): string {
  return value.replace(/^"(.*)"$/u, '$1').trim();
}

function normalizeMarkdownPathCandidate(candidate: string): string | null {
  const trimmed = stripWrappingQuotes(candidate);
  if (!trimmed) {
    return null;
  }

  // Ignore known switch-style launch arguments and installer flags.
  if (trimmed.startsWith('--') || (/^\/[A-Za-z]/u.test(trimmed) && !trimmed.includes('\\'))) {
    return null;
  }

  const normalized = path.normalize(trimmed);
  if (!isMarkdownPath(normalized)) {
    return null;
  }

  return path.resolve(normalized);
}

function normalizeMarkdownPaths(candidates: readonly string[]): string[] {
  return Array.from(new Set(
    candidates
      .map((candidate) => normalizeMarkdownPathCandidate(candidate))
      .filter((candidate): candidate is string => Boolean(candidate)),
  ));
}

async function resolveMarkdownPaths(candidates: readonly string[]): Promise<string[]> {
  const normalizedPaths = normalizeMarkdownPaths(candidates);
  const existing = await Promise.all(normalizedPaths.map(async (candidate) => (
    await pathExists(candidate) ? candidate : null
  )));
  return existing.filter((candidate): candidate is string => Boolean(candidate));
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
  const uniquePaths = await resolveMarkdownPaths(pathsToRead);
  uniquePaths.forEach((filePath) => accessPolicy.registerFilePath(filePath));
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
  accessPolicy.registerProjectRoot(normalizedRootPath);
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

async function readStoredWindowState(): Promise<DesktopWindowState> {
  try {
    const raw = await fs.readFile(windowStatePath, 'utf8');
    return normalizeDesktopWindowState(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return DEFAULT_DESKTOP_WINDOW_STATE;
  }
}

async function writeWindowState(nextState: DesktopWindowState): Promise<void> {
  await fs.mkdir(path.dirname(windowStatePath), { recursive: true });
  await fs.writeFile(windowStatePath, serializeDesktopWindowState(nextState), 'utf8');
}

function scheduleWindowStatePersist(window: any): void {
  if (pendingWindowStateWrite) {
    clearTimeout(pendingWindowStateWrite);
  }
  pendingWindowStateWrite = setTimeout(() => {
    const bounds = window.getBounds();
    const state = normalizeDesktopWindowState({
      ...bounds,
      isMaximized: window.isMaximized(),
    });
    void writeWindowState(state);
  }, 150);
}

function registerProjectRoot(rootPath: string): string {
  const normalizedRootPath = path.resolve(rootPath);
  accessPolicy.registerProjectRoot(normalizedRootPath);
  return normalizedRootPath;
}

function assertFilesystemPathAllowed(candidatePath: string, operation: string): string {
  return accessPolicy.assertAllowed(candidatePath, operation);
}

function assertFilesystemMoveAllowed(sourcePath: string, targetFolderPath: string): { sourcePath: string; targetFolderPath: string } {
  return {
    sourcePath: assertFilesystemPathAllowed(sourcePath, 'move source'),
    targetFolderPath: assertFilesystemPathAllowed(targetFolderPath, 'move target'),
  };
}

function getDesktopShellInfo() {
  return {
    productName: app.getName(),
    version: app.getVersion(),
    isPackaged: app.isPackaged,
    platform: process.platform,
  };
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
          label: 'Mount Workspace Folder...',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: async () => {
            const snapshot = await pickProjectDirectory();
            if (snapshot) {
              mainWindow?.webContents.send('desktop:mount-project-directory', snapshot);
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
  const storedWindowState = await readStoredWindowState();
  mainWindow = new BrowserWindow({
    width: storedWindowState.width,
    height: storedWindowState.height,
    ...(storedWindowState.x !== undefined ? { x: storedWindowState.x } : {}),
    ...(storedWindowState.y !== undefined ? { y: storedWindowState.y } : {}),
    minWidth: 1100,
    minHeight: 760,
    autoHideMenuBar: false,
    backgroundColor: '#0e1318',
    title: 'MdWrk Desktop',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    await mainWindow.loadURL(process.env.MDWRK_CLIENT_DEV_URL as string);
  } else {
    await mainWindow.loadFile(await getClientIndexPath());
  }

  if (storedWindowState.isMaximized) {
    mainWindow.maximize();
  }

  mainWindow.on('resize', () => {
    if (mainWindow) {
      scheduleWindowStatePersist(mainWindow);
    }
  });

  mainWindow.on('move', () => {
    if (mainWindow) {
      scheduleWindowStatePersist(mainWindow);
    }
  });

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

  const allowedPath = assertFilesystemPathAllowed(payload.path, 'save markdown file');
  accessPolicy.registerFilePath(allowedPath);
  await fs.writeFile(allowedPath, payload.content, 'utf8');
  return { path: allowedPath };
});

ipcMain.handle('desktop:get-desktop-path', async () => app.getPath('desktop'));
ipcMain.handle('desktop:get-shell-info', async () => getDesktopShellInfo());

ipcMain.handle('desktop:open-project-directory', async () => pickProjectDirectory());

ipcMain.handle('desktop:read-project-directory', async (_event, payload: { rootPath: string }) => {
  if (!payload?.rootPath) {
    throw new Error('A rootPath is required to read a desktop workspace.');
  }

  return readMarkdownWorkspace(registerProjectRoot(payload.rootPath));
});

ipcMain.handle('desktop:create-project-directory', async (_event, payload: { name: string; parentPath?: string }) => {
  const rawName = payload?.name?.trim();
  if (!rawName) {
    throw new Error('A project name is required to create a desktop workspace.');
  }

  const parentPath = path.resolve(payload.parentPath?.trim() || app.getPath('desktop'));
  accessPolicy.registerProjectRoot(parentPath);
  const rootPath = path.join(parentPath, rawName);
  if (await pathExists(rootPath)) {
    throw new Error(`The folder "${rawName}" already exists.`);
  }

  await fs.mkdir(rootPath, { recursive: true });
  return readMarkdownWorkspace(registerProjectRoot(rootPath));
});

ipcMain.handle('desktop:create-directory', async (_event, payload: { path: string }) => {
  if (!payload?.path) {
    throw new Error('A path is required to create a directory.');
  }

  const allowedPath = assertFilesystemPathAllowed(payload.path, 'create directory');
  await fs.mkdir(allowedPath, { recursive: true });
  return { path: allowedPath };
});

ipcMain.handle('desktop:rename-path', async (_event, payload: { path: string; nextPath: string }) => {
  if (!payload?.path || !payload?.nextPath) {
    throw new Error('Both source and destination paths are required to rename a filesystem node.');
  }

  const sourcePath = assertFilesystemPathAllowed(payload.path, 'rename source');
  const nextPath = assertFilesystemPathAllowed(payload.nextPath, 'rename target');
  await fs.rename(sourcePath, nextPath);
  return { path: nextPath };
});

ipcMain.handle('desktop:delete-path', async (_event, payload: { path: string }) => {
  if (!payload?.path) {
    throw new Error('A path is required to delete a filesystem node.');
  }

  const allowedPath = assertFilesystemPathAllowed(payload.path, 'delete path');
  await fs.rm(allowedPath, { recursive: true, force: false });
  return { path: allowedPath };
});

ipcMain.handle('desktop:move-path', async (_event, payload: { path: string; targetFolderPath: string }) => {
  if (!payload?.path || !payload?.targetFolderPath) {
    throw new Error('Both a source path and target folder path are required to move a filesystem node.');
  }

  const { sourcePath, targetFolderPath } = assertFilesystemMoveAllowed(payload.path, payload.targetFolderPath);
  const nextPath = path.join(targetFolderPath, path.basename(sourcePath));
  await fs.rename(sourcePath, nextPath);
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
