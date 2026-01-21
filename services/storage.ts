
import { FileNode, Project } from '../types';

const DB_NAME = 'LatticeDB';
const DB_VERSION = 2; 
const STORE_FILES = 'files';
const STORE_PROJECTS = 'projects';

class StorageService {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_FILES)) {
          const fileStore = db.createObjectStore(STORE_FILES, { keyPath: 'id' });
          fileStore.createIndex('projectId', 'projectId', { unique: false });
        } else {
           const fileStore = (event.target as IDBOpenDBRequest).transaction!.objectStore(STORE_FILES);
           if (!fileStore.indexNames.contains('projectId')) {
              fileStore.createIndex('projectId', 'projectId', { unique: false });
           }
        }
        if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
          db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
        }
      };
    });
  }

  async getProjects(): Promise<Project[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PROJECTS, 'readonly');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async saveProject(project: Project): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.put(project);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async deleteProject(projectId: string): Promise<void> {
      const db = await this.dbPromise;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_PROJECTS, STORE_FILES], 'readwrite');
        const projStore = transaction.objectStore(STORE_PROJECTS);
        projStore.delete(projectId);
        const fileStore = transaction.objectStore(STORE_FILES);
        const index = fileStore.index('projectId');
        const range = IDBKeyRange.only(projectId);
        const cursorRequest = index.openCursor(range);
        cursorRequest.onsuccess = (e) => {
           const cursor = (e.target as IDBRequest).result as IDBCursor;
           if (cursor) {
              cursor.delete();
              cursor.continue();
           }
        };
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
  }

  async getAllFiles(projectId: string): Promise<FileNode[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_FILES, 'readonly');
      const store = transaction.objectStore(STORE_FILES);
      const index = store.index('projectId');
      const request = index.getAll(IDBKeyRange.only(projectId));
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async saveFile(file: FileNode): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_FILES, 'readwrite');
      const store = transaction.objectStore(STORE_FILES);
      const request = store.put(file);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async deleteFile(id: string): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_FILES, 'readwrite');
      const store = transaction.objectStore(STORE_FILES);
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async seedInitialData(): Promise<Project | null> {
    const projects = await this.getProjects();
    if (projects.length === 0) {
      const defaultProjectId = 'proj-default';
      const defaultProject: Project = {
          id: defaultProjectId,
          name: 'Core System',
          gitConfig: { repoUrl: '', branch: 'main', username: '', pat: '' },
          lastOpened: Date.now(),
          createdAt: Date.now()
      };
      await this.saveProject(defaultProject);
      
      await this.saveFile({
        id: 'welcome-md',
        projectId: defaultProjectId,
        parentId: null,
        name: 'welcome.md',
        type: 'file',
        content: `# Lattice Architect v2

## Structural Mental Model

The application follows a **"Metallic Chassis Rack System"** architecture. Components are slotted into the chassis as deterministic functional plates.

\`\`\`text
_______________________________________________________________________
| [H] APP_HEADER (Tabs, System Status, Controls)                     |
|_____________________________________________________________________|
| [A] | [W] WORK_PANE (The Manifold)                                  |
|     |_______________________________________________________________|
| ACT | [E] EXPLORER    | [S] SPLIT_EDITOR / PREVIEW                  |
| ION |                 |                                             |
|     | (File Tree)     | (Markdown Input)    | (Rendered Output)     |
| RAI |                 |                     |                       |
| L   |                 |                     |                       |
|_____|_________________|_____________________|_______________________|
| [F] STATUS_BAR (Telemetry, Environment Meta, Scale)                 |
|_____________________________________________________________________|
\`\`\`

## Component Definitions

### 1. [H] App Header
The **Control Deck**. Manages context switching via the Tab Bar, global UI scaling, and access to systemic settings.

### 2. [A] Action Rail
The **Primary Vertical Action Strip**. Contains high-frequency "Atomic Actions" (Toggle Explorer, New File, Git Mode, Download).

### 3. [W] Work Pane
The **Main Manifold**. Orchestrates the relationship between the File System and the Execution Stage.

### 4. [E] Explorer
A **Hierarchical File Browser**. Optimized for high-density scanning and drag-and-drop structural reorganization.

### 5. [S] Editor / Preview
The **Execution Core**. Supports a zero-navigation workflow with real-time GFM rendering and code-editor behaviors (shortcuts, undo/redo).

### 6. [F] Status Bar
The **Telemetry Surface**. Surfacing LN/COL coordinates, IndexedDB persistence health, and PWA version awareness.

---

> "Structure is the only truth in a digital layout."`,
        lastModified: Date.now()
      });

      await this.saveFile({
        id: 'system-notes',
        projectId: defaultProjectId,
        parentId: null,
        name: 'system',
        type: 'folder',
        lastModified: Date.now()
      });

      await this.saveFile({
        id: 'system-ops-md',
        projectId: defaultProjectId,
        parentId: 'system-notes',
        name: 'operations.md',
        type: 'file',
        content: `# Operations Log

- Folder scaffolding now supports collapsible nodes.
- Use the header controls to create new files or open the config panel.`,
        lastModified: Date.now()
      });

      return defaultProject;
    }
    return null;
  }
}

export const storage = new StorageService();
