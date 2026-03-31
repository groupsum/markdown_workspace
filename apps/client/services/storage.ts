
import { FileNode, Project } from '../types';
import { getDefaultGitConfig } from './gitConfig';

const DB_NAME = 'LatticeDB';
const DB_VERSION = 3; 
const STORE_FILES = 'files';
const STORE_PROJECTS = 'projects';
const STORE_SETTINGS = 'settings';

class StorageService {
  private dbPromise: Promise<IDBDatabase>;
  private readonly indexedDbAvailable: boolean;
  private readonly memoryProjects = new Map<string, Project>();
  private readonly memoryFiles = new Map<string, FileNode>();
  private readonly memorySettings = new Map<string, unknown>();

  constructor() {
    this.indexedDbAvailable = typeof indexedDB !== 'undefined';
    if (!this.indexedDbAvailable) {
      this.dbPromise = Promise.resolve(null as unknown as IDBDatabase);
      return;
    }
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
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
        }
      };
    });
  }

  async getProjects(): Promise<Project[]> {
    if (!this.indexedDbAvailable) {
      return Array.from(this.memoryProjects.values());
    }
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
    if (!this.indexedDbAvailable) {
      this.memoryProjects.set(project.id, project);
      return;
    }
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
      if (!this.indexedDbAvailable) {
        this.memoryProjects.delete(projectId);
        for (const [id, file] of this.memoryFiles.entries()) {
          if (file.projectId === projectId) {
            this.memoryFiles.delete(id);
          }
        }
        return;
      }
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
    if (!this.indexedDbAvailable) {
      return Array.from(this.memoryFiles.values()).filter((file) => file.projectId === projectId);
    }
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
    if (!this.indexedDbAvailable) {
      this.memoryFiles.set(file.id, file);
      return;
    }
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
    if (!this.indexedDbAvailable) {
      this.memoryFiles.delete(id);
      return;
    }
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_FILES, 'readwrite');
      const store = transaction.objectStore(STORE_FILES);
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getSetting<T>(key: string): Promise<T | null> {
    if (!this.indexedDbAvailable) {
      return (this.memorySettings.get(key) as T | undefined) ?? null;
    }
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_SETTINGS, 'readonly');
      const store = transaction.objectStore(STORE_SETTINGS);
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as { key: string; value: T } | undefined;
        resolve(result ? result.value : null);
      };
    });
  }

  async setSetting<T>(key: string, value: T): Promise<void> {
    if (!this.indexedDbAvailable) {
      this.memorySettings.set(key, value);
      return;
    }
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_SETTINGS, 'readwrite');
      const store = transaction.objectStore(STORE_SETTINGS);
      const request = store.put({ key, value, updatedAt: Date.now() });
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
          gitConfig: getDefaultGitConfig(),
          lastOpened: Date.now(),
          createdAt: Date.now()
      };
      await this.saveProject(defaultProject);
      
      await this.saveFile({
        id: 'welcome-md',
        projectId: defaultProjectId,
        parentId: null,
        name: 'intro.md',
        type: 'file',
        content: `# Welcome to Lattice OS

Start here to explore every Markdown element and get comfortable with the workspace.

---

## Quick Start

1. **Create a file** using the action rail.
2. **Edit Markdown** in the left pane.
3. **Preview instantly** on the right.

> Tip: This file is a living reference. Duplicate it and experiment freely.

---

## Text Formatting

**Bold**, *italic*, ***bold italic***, ~~strikethrough~~, and \`inline code\`.

Superscript-like text can be represented as ^caret^ and subscript as ~tilde~ in plain Markdown.

---

## Links & Images

- Inline link: [Lattice docs](https://example.com)
- Auto link: <https://example.com>

![Placeholder image](https://placehold.co/600x200?text=Markdown+Preview)

---

## Lists

### Unordered

- Chassis
  - Header
  - Action Rail
  - Work Pane

### Ordered

1. Capture
2. Structure
3. Ship

### Task List

- [x] Install the app
- [x] Open intro.md
- [ ] Create your first project

---

## Tables

| Element | Purpose | Example |
| --- | --- | --- |
| Heading | Document structure | \`## Heading\` |
| Code | Technical clarity | \`\`\`js\`\`\` |
| Quote | Emphasis | \`> Insight\` |

---

## Code Blocks

\`\`\`ts
type FileNode = {
  id: string;
  name: string;
  content?: string;
};

const welcome = (name: string) => \`Hello, \${name}!\`;
\`\`\`

---

## Blockquotes

> “Structure is the only truth in a digital layout.”
>
> — Lattice System Notes

---

## Horizontal Rules

---

## Footnotes

Here is a statement with a footnote.[^1]

[^1]: Footnotes keep details accessible but unobtrusive.

---

## Definition Lists (Extended Markdown)

Term
: Definition that expands on the term.

---

## HTML Interop

<details>
  <summary>Expandable details</summary>
  You can embed HTML for special UI patterns.
</details>

---

## Emoji

🚀 ✅ 🔧

---

## Final Notes

Welcome aboard! Use this document as a template to build your own Markdown knowledge base.`,
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
