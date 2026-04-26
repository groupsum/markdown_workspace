import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { AppTheme, FileNode, Project } from '../types';
import { storage } from '../services/storage';
import { triggerDownload, compressFolder } from './fileSystem';
import { createHtmlExport, getExportStyles, toHtmlFileName } from '../services/htmlExport';

type ImportedMarkdownRecord = {
  name: string;
  content: string;
  sourcePath?: string;
  sourceKind?: 'filesystem';
};

type ProjectFileOptions = {
  rootPath?: string;
  sourceKind?: 'indexeddb' | 'filesystem';
};

type FilesystemWorkspaceSnapshot = DesktopWorkspaceSnapshot;

const normalizeFileName = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return '';
  if (trimmed.toLowerCase().endsWith('.md')) return trimmed;
  return `${trimmed}.md`;
};

const normalizeRelativePath = (value: string) => value.replace(/\\/g, '/');

const joinPathSegments = (...parts: string[]) => normalizeRelativePath(
  parts
    .filter(Boolean)
    .join('/')
    .replace(/\/+/g, '/')
    .replace(/\/\.\//g, '/')
);

const getParentPath = (value: string) => {
  const normalized = normalizeRelativePath(value);
  const index = normalized.lastIndexOf('/');
  if (index <= 0) {
    return '';
  }
  return normalized.slice(0, index);
};

const joinDesktopPath = (...parts: string[]) => joinPathSegments(...parts);

const getNodeRelativePath = (node: FileNode, allFiles: FileNode[]): string => {
  const parts: string[] = [node.name];
  let cursor = node.parentId ? allFiles.find((candidate) => candidate.id === node.parentId) ?? null : null;

  while (cursor) {
    parts.unshift(cursor.name);
    cursor = cursor.parentId ? allFiles.find((candidate) => candidate.id === cursor.parentId) ?? null : null;
  }

  return normalizeRelativePath(parts.join('/'));
};

const buildPathByNodeIdMap = (allFiles: FileNode[]) => {
  const map = new Map<string, string>();
  const folders = [...allFiles]
    .filter((file) => file.type === 'folder')
    .sort((left, right) => getNodeRelativePath(left, allFiles).localeCompare(getNodeRelativePath(right, allFiles)));

  folders.forEach((folder) => {
    map.set(getNodeRelativePath(folder, allFiles), folder.id);
  });

  return map;
};

export const useFileManager = (
  activeProjectId: string | null,
  activeProject: Project | null,
  autoSaveEnabled: boolean,
  addToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void
) => {
  console.log(`[useFileManager] Hook init. Active Project: ${activeProjectId}`);

  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedExplorerId, setSelectedExplorerId] = useState<string | null>(null);
  const [unsaved, setUnsaved] = useState(false);
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);

  const projectSourceKind = activeProject?.sourceKind ?? 'indexeddb';
  const projectRootPath = activeProject?.rootPath;
  const isFilesystemProject = projectSourceKind === 'filesystem' && Boolean(projectRootPath) && Boolean(window.desktopShell);

  const loadFiles = useCallback(async (projectId: string) => {
    console.log(`[useFileManager] Action: loadFiles for project -> ${projectId}`);
    const projectFiles = await storage.getAllFiles(projectId);
    console.log(`[useFileManager] Loaded ${projectFiles.length} files from IDB`);
    setFiles(projectFiles);
    setLoadedProjectId(projectId);
    return projectFiles;
  }, []);

  const replacePathPrefix = (candidate: string | undefined, currentPrefix: string, nextPrefix: string): string | undefined => {
    if (!candidate) {
      return candidate;
    }
    const normalizedCandidate = normalizeRelativePath(candidate);
    const normalizedCurrentPrefix = normalizeRelativePath(currentPrefix);
    if (normalizedCandidate === normalizedCurrentPrefix) {
      return normalizeRelativePath(nextPrefix);
    }
    if (!normalizedCandidate.startsWith(`${normalizedCurrentPrefix}/`)) {
      return candidate;
    }
    return normalizeRelativePath(`${nextPrefix}${normalizedCandidate.slice(normalizedCurrentPrefix.length)}`);
  };

  const renameNode = async (nodeId: string, nextName: string) => {
    if (!activeProjectId) return null;
    const node = files.find(f => f.id === nodeId);
    if (!node) return null;
    const trimmed = nextName.trim();
    if (!trimmed) {
      addToast('NAME REQUIRED', 'warning');
      return null;
    }
    const finalName = node.type === 'file' ? normalizeFileName(trimmed) : trimmed;
    if (finalName === node.name) {
      addToast('NAME UNCHANGED', 'info');
      return node;
    }
    const duplicate = files.find(f =>
      f.projectId === activeProjectId &&
      f.parentId === node.parentId &&
      f.id !== nodeId &&
      f.name.toLowerCase() === finalName.toLowerCase()
    );
    if (duplicate) {
      addToast(`ERROR: '${finalName}' ALREADY EXISTS`, 'warning');
      return null;
    }

    const currentRelativePath = getNodeRelativePath(node, files);
    const nextRelativePath = joinPathSegments(getParentPath(currentRelativePath), finalName);
    const currentPath = node.sourcePath;
    const nextPath = currentPath ? joinDesktopPath(getParentPath(currentPath), finalName) : undefined;

    if (isFilesystemProject && currentPath && nextPath) {
      await window.desktopShell!.renamePath({ path: currentPath, nextPath });
    }

    const updatedNode = {
      ...node,
      name: finalName,
      lastModified: Date.now(),
      sourceKind: node.sourceKind ?? (isFilesystemProject ? 'filesystem' : 'indexeddb'),
      sourcePath: nextPath ?? node.sourcePath,
    };

    const descendantUpdates = node.type === 'folder'
      ? files
          .filter((file) => file.id !== node.id)
          .filter((file) => {
            const relativePath = getNodeRelativePath(file, files);
            return relativePath.startsWith(`${currentRelativePath}/`);
          })
          .map((file) => ({
            ...file,
            sourcePath: replacePathPrefix(file.sourcePath, currentPath ?? currentRelativePath, nextPath ?? nextRelativePath),
          }))
      : [];

    await storage.saveFile(updatedNode);
    await Promise.all(descendantUpdates.map((file) => storage.saveFile(file)));
    const descendantMap = new Map(descendantUpdates.map((file) => [file.id, file]));
    setFiles(prev => prev.map(f => {
      if (f.id === nodeId) {
        return updatedNode;
      }
      return descendantMap.get(f.id) ?? f;
    }));
    addToast('ITEM RENAMED', 'success');
    return updatedNode;
  };

  const deleteNode = async (nodeId: string) => {
    const node = files.find(f => f.id === nodeId);
    if (!node) return [];

    const childrenMap = new Map<string | null, FileNode[]>();
    files.forEach(file => {
      const list = childrenMap.get(file.parentId) || [];
      list.push(file);
      childrenMap.set(file.parentId, list);
    });

    const idsToDelete: string[] = [nodeId];
    const stack = [nodeId];
    while (stack.length > 0) {
      const currentId = stack.pop();
      if (!currentId) continue;
      const children = childrenMap.get(currentId) || [];
      children.forEach(child => {
        idsToDelete.push(child.id);
        if (child.type === 'folder') {
          stack.push(child.id);
        }
      });
    }

    if (isFilesystemProject && node.sourcePath) {
      await window.desktopShell!.deletePath({ path: node.sourcePath });
    }

    await Promise.all(idsToDelete.map(id => storage.deleteFile(id)));
    const deleteSet = new Set(idsToDelete);
    const deletedFileIds = files.filter(f => deleteSet.has(f.id) && f.type === 'file').map(f => f.id);
    setFiles(prev => prev.filter(f => !deleteSet.has(f.id)));
    if (selectedExplorerId && deleteSet.has(selectedExplorerId)) {
      setSelectedExplorerId(null);
    }
    if (idsToDelete.length > 1) {
      addToast(`DELETED ${idsToDelete.length} ITEMS`, 'success');
    } else {
      addToast('ITEM DELETED', 'success');
    }
    return deletedFileIds;
  };

  const createNewFile = async (name: string) => {
    console.log(`[useFileManager] Action: createNewFile -> ${name}`);
    if (!activeProjectId) return null;

    const finalName = normalizeFileName(name);
    if (!finalName) {
      addToast('FILE NAME REQUIRED', 'warning');
      return null;
    }

    let parentId: string | null = null;
    let parentPath: string | undefined = projectRootPath;
    const selectedNode = files.find(f => f.id === selectedExplorerId);
    if (selectedNode) {
      if (selectedNode.type === 'folder') {
        parentId = selectedNode.id;
        parentPath = selectedNode.sourcePath ?? parentPath;
      } else {
        parentId = selectedNode.parentId;
        const parentNode = selectedNode.parentId ? files.find((file) => file.id === selectedNode.parentId) : null;
        parentPath = parentNode?.sourcePath ?? parentPath;
      }
    }

    const duplicate = files.find(f =>
      f.projectId === activeProjectId &&
      f.parentId === parentId &&
      f.name.toLowerCase() === finalName.toLowerCase()
    );

    if (duplicate) {
      console.error(`[useFileManager] Duplicate found: ${finalName}`);
      addToast(`ERROR: '${finalName}' ALREADY EXISTS`, 'warning');
      return null;
    }

    const fileContent = `# ${finalName.replace(/\.md$/i, '')}\n\n`;
    const sourcePath = isFilesystemProject && parentPath
      ? joinDesktopPath(parentPath, finalName)
      : undefined;

    if (isFilesystemProject && sourcePath) {
      await window.desktopShell!.saveMarkdownFile({
        path: sourcePath,
        content: fileContent,
      });
    }

    const newFile: FileNode = {
      id: `file-${Date.now()}`,
      projectId: activeProjectId,
      parentId,
      name: finalName,
      type: 'file',
      content: fileContent,
      lastModified: Date.now(),
      sourceKind: isFilesystemProject ? 'filesystem' : 'indexeddb',
      sourcePath,
    };

    console.log(`[useFileManager] Saving new file to IDB: ${newFile.id}`);
    await storage.saveFile(newFile);
    setFiles(prev => [...prev, newFile]);
    addToast(isFilesystemProject ? 'NEW FILE CREATED ON DISK' : 'NEW FILE CREATED', 'info');
    return newFile;
  };

  const createNewFolder = async (name: string) => {
    console.log(`[useFileManager] Action: createNewFolder -> ${name}`);
    if (!activeProjectId) return null;

    const trimmedName = name.trim();
    if (!trimmedName) {
      addToast('FOLDER NAME REQUIRED', 'warning');
      return null;
    }

    let parentId: string | null = null;
    let parentPath: string | undefined = projectRootPath;
    const selectedNode = files.find(f => f.id === selectedExplorerId);
    if (selectedNode) {
      if (selectedNode.type === 'folder') {
        parentId = selectedNode.id;
        parentPath = selectedNode.sourcePath ?? parentPath;
      } else {
        parentId = selectedNode.parentId;
        const parentNode = selectedNode.parentId ? files.find((file) => file.id === selectedNode.parentId) : null;
        parentPath = parentNode?.sourcePath ?? parentPath;
      }
    }

    const duplicate = files.find(f =>
      f.projectId === activeProjectId &&
      f.parentId === parentId &&
      f.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicate) {
      console.error(`[useFileManager] Duplicate folder found: ${trimmedName}`);
      addToast(`ERROR: '${trimmedName}' ALREADY EXISTS`, 'warning');
      return null;
    }

    const sourcePath = isFilesystemProject && parentPath
      ? joinDesktopPath(parentPath, trimmedName)
      : undefined;

    if (isFilesystemProject && sourcePath) {
      await window.desktopShell!.createDirectory({ path: sourcePath });
    }

    const newFolder: FileNode = {
      id: `folder-${Date.now()}`,
      projectId: activeProjectId,
      parentId,
      name: trimmedName,
      type: 'folder',
      lastModified: Date.now(),
      sourceKind: isFilesystemProject ? 'filesystem' : 'indexeddb',
      sourcePath,
    };

    console.log(`[useFileManager] Saving new folder to IDB: ${newFolder.id}`);
    await storage.saveFile(newFolder);
    setFiles(prev => [...prev, newFolder]);
    addToast(isFilesystemProject ? 'NEW FOLDER CREATED ON DISK' : 'NEW FOLDER CREATED', 'info');
    return newFolder;
  };

  const saveFile = async (file: FileNode) => {
    console.log(`[useFileManager] Action: saveFile -> ${file.id}`);
    const updatedFile = { ...file, lastModified: Date.now() };
    await storage.saveFile(updatedFile);
    if (updatedFile.type === 'file' && updatedFile.sourceKind === 'filesystem' && updatedFile.sourcePath && window.desktopShell) {
      await window.desktopShell.saveMarkdownFile({
        path: updatedFile.sourcePath,
        content: updatedFile.content ?? '',
      });
      setFiles(prev => prev.map(candidate => candidate.id === updatedFile.id ? updatedFile : candidate));
      addToast('FILE SAVED TO DISK + IDB', 'success');
      setUnsaved(false);
      return;
    }
    setFiles(prev => prev.map(candidate => candidate.id === updatedFile.id ? updatedFile : candidate));
    setUnsaved(false);
    addToast('FILE SAVED TO IDB', 'success');
  };

  const updateFileContent = useCallback((fileId: string, content: string) => {
    console.log(`[useFileManager] Action: updateFileContent (in memory) -> ${fileId}`);
    setUnsaved(true);
    const updatedAt = Date.now();
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, content, lastModified: updatedAt } : f
    ));
    if (autoSaveEnabled) {
      const existing = files.find(f => f.id === fileId);
      if (existing) {
        const updatedFile = { ...existing, content, lastModified: updatedAt };
        storage.saveFile(updatedFile).then(async () => {
          if (updatedFile.type === 'file' && updatedFile.sourceKind === 'filesystem' && updatedFile.sourcePath && window.desktopShell) {
            await window.desktopShell.saveMarkdownFile({
              path: updatedFile.sourcePath,
              content: updatedFile.content ?? '',
            });
          }
          setUnsaved(false);
        });
      }
    }
  }, [autoSaveEnabled, files]);

  const moveFile = async (fileId: string, targetFolderId: string | null) => {
    console.log(`[useFileManager] Action: moveFile -> ${fileId} to folder -> ${targetFolderId}`);
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    if (file.type === 'folder' && targetFolderId) {
      let currentId: string | null = targetFolderId;
      while (currentId) {
        if (currentId === fileId) {
          console.warn('[useFileManager] Circular folder move detected');
          addToast('CANNOT MOVE FOLDER INTO ITSELF', 'warning');
          return;
        }
        const parent: FileNode | undefined = files.find(f => f.id === currentId);
        currentId = parent ? parent.parentId : null;
      }
    }

    const targetFolder = targetFolderId ? files.find(candidate => candidate.id === targetFolderId) ?? null : null;
    const targetFolderPath = targetFolder?.sourcePath ?? projectRootPath;
    const currentPath = file.sourcePath;
    let nextPath = currentPath;

    if (isFilesystemProject && currentPath && targetFolderPath) {
      const result = await window.desktopShell!.movePath({
        path: currentPath,
        targetFolderPath,
      });
      nextPath = result.path;
    }

    const updatedFile = { ...file, parentId: targetFolderId, sourcePath: nextPath };
    const currentRelativePath = getNodeRelativePath(file, files);
    const nextRelativePath = getNodeRelativePath(updatedFile, files.map(candidate => candidate.id === file.id ? updatedFile : candidate));

    const descendantUpdates = file.type === 'folder'
      ? files
          .filter(candidate => candidate.id !== file.id)
          .filter(candidate => getNodeRelativePath(candidate, files).startsWith(`${currentRelativePath}/`))
          .map(candidate => ({
            ...candidate,
            sourcePath: replacePathPrefix(candidate.sourcePath, currentPath ?? currentRelativePath, nextPath ?? nextRelativePath),
          }))
      : [];

    await storage.saveFile(updatedFile);
    await Promise.all(descendantUpdates.map(candidate => storage.saveFile(candidate)));
    const descendantMap = new Map(descendantUpdates.map(candidate => [candidate.id, candidate]));
    setFiles(prev => prev.map(candidate => {
      if (candidate.id === fileId) {
        return updatedFile;
      }
      return descendantMap.get(candidate.id) ?? candidate;
    }));
    addToast('MOVED ITEM', 'info');
  };

  const downloadNode = async () => {
    console.log(`[useFileManager] Action: downloadNode -> selected -> ${selectedExplorerId}`);
    if (!selectedExplorerId) {
       addToast('SELECT FILE OR FOLDER TO DOWNLOAD', 'warning');
       return;
    }

    const selectedNode = files.find(f => f.id === selectedExplorerId);
    if (!selectedNode) return;

    if (selectedNode.type === 'file') {
       triggerDownload(selectedNode.content || '', selectedNode.name, 'text/markdown');
       addToast('DOWNLOAD STARTED', 'success');
    } else {
       console.log(`[useFileManager] Compressing folder -> ${selectedNode.name}`);
       addToast('COMPRESSING FOLDER...', 'info');
       const blob = await compressFolder(selectedNode, files);
       if (blob) {
         triggerDownload(blob, `${selectedNode.name}.zip`, 'application/zip');
         addToast('ARCHIVE DOWNLOADED', 'success');
       }
    }
  };

  const exportProjectData = async (projectName: string) => {
    console.log(`[useFileManager] Action: exportProjectData for project -> ${projectName}`);
    const payload = {
      format: 'mdwrk/project-backup',
      version: 2,
      exportedAt: Date.now(),
      project: {
        id: activeProjectId,
        name: projectName,
      },
      files,
    };
    const json = JSON.stringify(payload, null, 2);
    const name = `${projectName}-backup.json`;
    triggerDownload(json, name, 'application/json');
    addToast('EXPORT COMPLETE', 'success');
  };

  const restoreProjectData = async (payload: string) => {
    if (!activeProjectId) {
      addToast('NO ACTIVE PROJECT', 'warning');
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(payload);
    } catch {
      addToast('INVALID JSON IMAGE', 'warning');
      return null;
    }

    const rawFiles = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object' && Array.isArray((parsed as { files?: unknown[] }).files)
        ? (parsed as { files: unknown[] }).files
        : null;

    if (!rawFiles) {
      addToast('UNSUPPORTED BACKUP FORMAT', 'warning');
      return null;
    }

    const now = Date.now();
    const restoredFiles: FileNode[] = [];
    for (const item of rawFiles) {
      if (!item || typeof item !== 'object') {
        addToast('UNSUPPORTED BACKUP FORMAT', 'warning');
        return null;
      }
      const node = item as Partial<FileNode>;
      if (!node.id || !node.name || !node.type) {
        addToast('BACKUP IMAGE MISSING REQUIRED FIELDS', 'warning');
        return null;
      }
      if (node.type !== 'file' && node.type !== 'folder') {
        addToast('BACKUP IMAGE CONTAINS INVALID NODE TYPE', 'warning');
        return null;
      }

      restoredFiles.push({
        id: String(node.id),
        projectId: activeProjectId,
        parentId: typeof node.parentId === 'string' ? node.parentId : null,
        name: String(node.name),
        type: node.type,
        content: typeof node.content === 'string' ? node.content : undefined,
        lastModified: typeof node.lastModified === 'number' ? node.lastModified : now,
        sourceKind: node.sourceKind,
        sourcePath: node.sourcePath,
      });
    }

    const existingFiles = await storage.getAllFiles(activeProjectId);
    await Promise.all(existingFiles.map((file) => storage.deleteFile(file.id)));
    await Promise.all(restoredFiles.map((file) => storage.saveFile(file)));
    setFiles(restoredFiles);
    setSelectedExplorerId(null);
    setUnsaved(false);
    addToast(`RESTORE COMPLETE (${restoredFiles.length} ITEMS)`, 'success');
    return restoredFiles;
  };

  const exportHtmlNode = async (theme: AppTheme) => {
    console.log(`[useFileManager] Action: exportHtmlNode -> selected -> ${selectedExplorerId}`);
    if (!selectedExplorerId) {
      addToast('SELECT FILE OR FOLDER TO EXPORT', 'warning');
      return;
    }

    const selectedNode = files.find(f => f.id === selectedExplorerId);
    if (!selectedNode) return;

    const { coreCss, themeCss } = await getExportStyles(theme);
    const buildHtml = (node: FileNode) => createHtmlExport({
      title: node.name,
      content: node.content || '',
      theme,
      coreCss,
      themeCss
    });

    if (selectedNode.type === 'file') {
      const html = buildHtml(selectedNode);
      triggerDownload(html, toHtmlFileName(selectedNode.name), 'text/html');
      addToast('HTML EXPORT COMPLETE', 'success');
      return;
    }

    console.log(`[useFileManager] Exporting HTML folder -> ${selectedNode.name}`);
    addToast('EXPORTING HTML ARCHIVE...', 'info');
    const zip = new JSZip();
    const rootFolder = zip.folder(`${selectedNode.name}-html`);
    const addFolderToZip = (folderId: string, currentFolder: JSZip) => {
      const children = files.filter(f => f.parentId === folderId);
      children.forEach(child => {
        if (child.type === 'file') {
          const html = buildHtml(child);
          currentFolder.file(toHtmlFileName(child.name), html);
        } else {
          const nextFolder = currentFolder.folder(child.name);
          if (nextFolder) {
            addFolderToZip(child.id, nextFolder);
          }
        }
      });
    };

    if (rootFolder) {
      addFolderToZip(selectedNode.id, rootFolder);
      const blob = await zip.generateAsync({ type: 'blob' });
      triggerDownload(blob, `${selectedNode.name}-html.zip`, 'application/zip');
      addToast('HTML ARCHIVE DOWNLOADED', 'success');
    }
  };

  const importMarkdownRecords = async (projectId: string, items: ImportedMarkdownRecord[]) => {
    if (items.length === 0) return [];

    let parentId: string | null = null;
    if (projectId === activeProjectId) {
      const selectedNode = files.find((file) => file.id === selectedExplorerId);
      if (selectedNode) {
        parentId = selectedNode.type === 'folder' ? selectedNode.id : selectedNode.parentId;
      }
    }

    const nextFiles = projectId === loadedProjectId ? [...files] : await storage.getAllFiles(projectId);
    const imported: FileNode[] = [];

    for (const item of items) {
      const lowerName = item.name.toLowerCase();
      const baseName = lowerName.endsWith('.md') || lowerName.endsWith('.markdown')
        ? item.name
        : `${item.name}.md`;

      const bySourcePathIndex = item.sourcePath
        ? nextFiles.findIndex((file) => file.projectId === projectId && file.sourcePath === item.sourcePath)
        : -1;

      if (bySourcePathIndex >= 0) {
        const current = nextFiles[bySourcePathIndex];
        const updated: FileNode = {
          ...current,
          name: baseName,
          content: item.content,
          lastModified: Date.now(),
          sourceKind: item.sourceKind ?? current.sourceKind ?? 'indexeddb',
          sourcePath: item.sourcePath ?? current.sourcePath,
        };
        await storage.saveFile(updated);
        nextFiles[bySourcePathIndex] = updated;
        imported.push(updated);
        continue;
      }

      const existing = nextFiles.find((file) =>
        file.projectId === projectId &&
        file.parentId === parentId &&
        file.name.toLowerCase() === baseName.toLowerCase()
      );
      if (existing) {
        continue;
      }

      const newFile: FileNode = {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        projectId,
        parentId,
        name: baseName,
        type: 'file',
        content: item.content,
        lastModified: Date.now(),
        sourceKind: item.sourceKind ?? 'indexeddb',
        sourcePath: item.sourcePath,
      };
      await storage.saveFile(newFile);
      nextFiles.push(newFile);
      imported.push(newFile);
    }

    if (projectId === loadedProjectId) {
      setFiles(nextFiles);
    }

    if (imported.length > 0) {
      addToast(`IMPORTED ${imported.length} MARKDOWN FILE${imported.length > 1 ? 'S' : ''}`, 'success');
    } else {
      addToast('NO NEW MARKDOWN FILES IMPORTED', 'warning');
    }

    return imported;
  };

  const importFilesystemWorkspace = async (
    projectId: string,
    snapshot: FilesystemWorkspaceSnapshot,
    options?: ProjectFileOptions
  ) => {
    const existingFiles = await storage.getAllFiles(projectId);
    if (existingFiles.length > 0) {
      await Promise.all(existingFiles.map((file) => storage.deleteFile(file.id)));
    }

    const folderEntries = snapshot.entries
      .filter((entry) => entry.type === 'folder')
      .sort((left, right) => left.relativePath.localeCompare(right.relativePath));
    const fileEntries = snapshot.entries
      .filter((entry) => entry.type === 'file')
      .sort((left, right) => left.relativePath.localeCompare(right.relativePath));

    const nextFiles: FileNode[] = [];
    const pathByNodeId = new Map<string, string>();
    const folderIdByRelativePath = new Map<string, string>();

    folderEntries.forEach((entry) => {
      const normalizedRelativePath = normalizeRelativePath(entry.relativePath);
      const parentRelativePath = getParentPath(normalizedRelativePath) || '.';
      const parentId = parentRelativePath === '.' ? null : folderIdByRelativePath.get(parentRelativePath) ?? null;
      const node: FileNode = {
        id: `folder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        projectId,
        parentId,
        name: entry.name,
        type: 'folder',
        lastModified: Date.now(),
        sourceKind: options?.sourceKind ?? 'filesystem',
        sourcePath: entry.path,
      };
      folderIdByRelativePath.set(normalizedRelativePath, node.id);
      pathByNodeId.set(node.id, normalizedRelativePath);
      nextFiles.push(node);
    });

    fileEntries.forEach((entry) => {
      const normalizedRelativePath = normalizeRelativePath(entry.relativePath);
      const parentRelativePath = getParentPath(normalizedRelativePath) || '.';
      const parentId = parentRelativePath === '.' ? null : folderIdByRelativePath.get(parentRelativePath) ?? null;
      const node: FileNode = {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        projectId,
        parentId,
        name: entry.name,
        type: 'file',
        content: entry.content ?? '',
        lastModified: Date.now(),
        sourceKind: options?.sourceKind ?? 'filesystem',
        sourcePath: entry.path,
      };
      pathByNodeId.set(node.id, normalizedRelativePath);
      nextFiles.push(node);
    });

    await Promise.all(nextFiles.map((file) => storage.saveFile(file)));
    if (projectId === loadedProjectId || projectId === activeProjectId) {
      setFiles(nextFiles);
      setLoadedProjectId(projectId);
    }
    addToast(`SYNCED ${nextFiles.filter((file) => file.type === 'file').length} WORKSPACE FILES`, 'success');
    return nextFiles;
  };

  const importMarkdownFiles = async (inputFiles: FileList | File[]) => {
    if (!activeProjectId) return [];
    const items = await Promise.all(Array.from(inputFiles).map(async (inputFile) => ({
      name: inputFile.name,
      content: await inputFile.text(),
    })));

    return importMarkdownRecords(activeProjectId, items);
  };

  const importExternalMarkdownFiles = async (projectId: string, inputFiles: readonly ImportedMarkdownRecord[]) => {
    return importMarkdownRecords(projectId, [...inputFiles]);
  };

  const getFilesystemRootForSelection = useCallback(() => {
    if (!isFilesystemProject || !projectRootPath) {
      return null;
    }

    const selectedNode = selectedExplorerId ? files.find((file) => file.id === selectedExplorerId) ?? null : null;
    if (!selectedNode) {
      return {
        projectRootPath,
        parentId: null as string | null,
      };
    }

    if (selectedNode.type === 'folder') {
      return {
        projectRootPath: selectedNode.sourcePath ?? projectRootPath,
        parentId: selectedNode.id,
      };
    }

    const parentNode = selectedNode.parentId ? files.find((file) => file.id === selectedNode.parentId) ?? null : null;
    return {
      projectRootPath: parentNode?.sourcePath ?? projectRootPath,
      parentId: selectedNode.parentId,
    };
  }, [files, isFilesystemProject, projectRootPath, selectedExplorerId]);

  return {
    files,
    setFiles,
    selectedExplorerId,
    setSelectedExplorerId,
    unsaved,
    setUnsaved,
    loadedProjectId,
    loadFiles,
    createNewFile,
    createNewFolder,
    renameNode,
    deleteNode,
    saveFile,
    updateFileContent,
    moveFile,
    downloadNode,
    exportProjectData,
    exportHtmlNode,
    importMarkdownFiles,
    importExternalMarkdownFiles,
    importFilesystemWorkspace,
    restoreProjectData,
    getFilesystemRootForSelection,
  };
};
