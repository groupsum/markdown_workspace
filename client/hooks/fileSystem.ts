import JSZip from 'jszip';
import { FileNode } from '../types';

export const triggerDownload = (data: Blob | string, filename: string, mimeType: string = 'text/plain') => {
  const blob = typeof data === 'string' ? new Blob([data], { type: mimeType }) : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const compressFolder = async (folderNode: FileNode, allFiles: FileNode[]): Promise<Blob | null> => {
  const zip = new JSZip();

  const addFilesToZip = (folderId: string, currentFolder: JSZip) => {
    const children = allFiles.filter(f => f.parentId === folderId);
    children.forEach(child => {
      if (child.type === 'file') {
        currentFolder.file(child.name, child.content || '');
      } else {
        const newFolder = currentFolder.folder(child.name);
        if (newFolder) {
          addFilesToZip(child.id, newFolder);
        }
      }
    });
  };

  const rootFolder = zip.folder(folderNode.name);
  if (rootFolder) {
    addFilesToZip(folderNode.id, rootFolder);
    return await zip.generateAsync({ type: "blob" });
  }
  return null;
};