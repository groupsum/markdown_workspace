
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
        name: 'intro.md',
        type: 'file',
        content: `# Welcome to Lattice Architect

Start here, new operators. This intro is a **living demo** of every Markdown element the editor supports.

---

## Headings (H2)

### Heading Level 3
#### Heading Level 4
##### Heading Level 5
###### Heading Level 6

## Emphasis & Inline Elements

Mix **bold**, *italic*, ***bold italic***, ~~strikethrough~~, and <u>underline</u> in one sentence. Inline code looks like \`npm run dev\`.

## Links & Images

- Link: [Lattice Architect Docs](https://example.com)
- Image:
  ![Sample schematic](https://placehold.co/600x200?text=Markdown+Preview)

## Lists

Unordered list:
- Fast file creation
- Split editor + preview
  - Nested bullet

Ordered list:
1. Create a file
2. Write Markdown
3. Export HTML

Task list:
- [x] Install the app
- [x] Open this intro
- [ ] Create your first project

## Blockquotes

> "Structure is the only truth in a digital layout."\
> — Lattice Architect Manual

## Code Blocks

\`\`\`ts
type FileNode = {
  id: string;
  name: string;
  content?: string;
};
\`\`\`

## Tables

| Feature | Description | Shortcut |
| --- | --- | --- |
| New File | Create a markdown file | \`Ctrl/Cmd + N\` |
| Search | Find text across files | \`Ctrl/Cmd + F\` |
| Export | Download HTML | \`Ctrl/Cmd + E\` |

## Horizontal Rule

---

## Footnotes

You can add citations like this.[^1]

[^1]: Footnotes help keep long explanations tidy.

## Escaped Characters

Use backslashes to escape symbols: \\*not italic\\* and \\# not a heading.

---

Happy building!`,
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
