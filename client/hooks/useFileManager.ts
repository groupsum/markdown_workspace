
import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { AppTheme, FileNode } from '../types';
import { storage } from '../services/storage';
import { triggerDownload, compressFolder } from './fileSystem';
import { createHtmlExport, getExportStyles, toHtmlFileName } from '../services/htmlExport';

export const useFileManager = (
  activeProjectId: string | null,
  autoSaveEnabled: boolean,
  addToast: (msg: string, type?: 'info' | 'success' | 'warning') => void
) => {
  console.log(`[useFileManager] Hook init. Active Project: ${activeProjectId}`);

  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedExplorerId, setSelectedExplorerId] = useState<string | null>(null);
  const [unsaved, setUnsaved] = useState(false);
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);

  const loadFiles = async (projectId: string) => {
    console.log(`[useFileManager] Action: loadFiles for project -> ${projectId}`);
    const projectFiles = await storage.getAllFiles(projectId);
    console.log(`[useFileManager] Loaded ${projectFiles.length} files from IDB`);
    setFiles(projectFiles);
    setLoadedProjectId(projectId);
    return projectFiles;
  };

  const createNewFile = async (name: string) => {
    console.log(`[useFileManager] Action: createNewFile -> ${name}`);
    if (!activeProjectId) return null;
    
    const finalName = name.endsWith('.md') ? name : `${name}.md`;
    let parentId: string | null = null;
    const selectedNode = files.find(f => f.id === selectedExplorerId);
    if (selectedNode) {
      if (selectedNode.type === 'folder') {
        parentId = selectedNode.id;
      } else {
        parentId = selectedNode.parentId;
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

    const newFile: FileNode = {
      id: `file-${Date.now()}`,
      projectId: activeProjectId,
      parentId: parentId,
      name: finalName,
      type: 'file',
      content: `# ${name}\n\n`,
      lastModified: Date.now()
    };

    console.log(`[useFileManager] Saving new file to IDB: ${newFile.id}`);
    await storage.saveFile(newFile);
    setFiles(prev => [...prev, newFile]);
    addToast('NEW FILE CREATED', 'info');
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
    const selectedNode = files.find(f => f.id === selectedExplorerId);
    if (selectedNode) {
      if (selectedNode.type === 'folder') {
        parentId = selectedNode.id;
      } else {
        parentId = selectedNode.parentId;
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

    const newFolder: FileNode = {
      id: `folder-${Date.now()}`,
      projectId: activeProjectId,
      parentId: parentId,
      name: trimmedName,
      type: 'folder',
      lastModified: Date.now()
    };

    console.log(`[useFileManager] Saving new folder to IDB: ${newFolder.id}`);
    await storage.saveFile(newFolder);
    setFiles(prev => [...prev, newFolder]);
    addToast('NEW FOLDER CREATED', 'info');
    return newFolder;
  };

  const saveFile = async (file: FileNode) => {
    console.log(`[useFileManager] Action: saveFile -> ${file.id}`);
    await storage.saveFile({ ...file, lastModified: Date.now() });
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
        storage.saveFile(updatedFile).then(() => {
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
          console.warn("[useFileManager] Circular folder move detected");
          addToast('CANNOT MOVE FOLDER INTO ITSELF', 'warning');
          return;
        }
        const parent: FileNode | undefined = files.find(f => f.id === currentId);
        currentId = parent ? parent.parentId : null;
      }
    }

    const updatedFile = { ...file, parentId: targetFolderId };
    await storage.saveFile(updatedFile);
    setFiles(prev => prev.map(f => f.id === fileId ? updatedFile : f));
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
    const json = JSON.stringify(files, null, 2);
    const name = `${projectName}-backup.json`;
    triggerDownload(json, name, 'application/json');
    addToast('EXPORT COMPLETE', 'success');
  };

  const exportHtmlNode = async (theme: AppTheme) => {
    console.log(`[useFileManager] Action: exportHtmlNode -> selected -> ${selectedExplorerId}`);
    if (!selectedExplorerId) {
      addToast('SELECT FILE OR FOLDER TO EXPORT', 'warning');
      return;
    }

    const selectedNode = files.find(f => f.id === selectedExplorerId);
    if (!selectedNode) return;

    const { coreCss, themeCss } = await getExportStyles();
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
    saveFile,
    updateFileContent,
    moveFile,
    downloadNode,
    exportProjectData,
    exportHtmlNode
  };
};
