
import { useState, useMemo } from 'react';
import { FileNode } from '../types';

export const useGitOperations = (activeFile: FileNode | null, unsaved: boolean) => {
  console.log(`[useGitOperations] Hook init. Active: ${activeFile?.id}, Unsaved: ${unsaved}`);
  
  const [commitMsg, setCommitMsg] = useState('');
  const [stagedFiles, setStagedFiles] = useState<string[]>([]);

  // Mock changes derived from unsaved state
  // In a real app, this would check against a git index
  const changedFiles = useMemo(() => {
    return activeFile && unsaved ? [activeFile] : [];
  }, [activeFile, unsaved]);

  const stageFile = (fileId: string) => {
    console.log(`[useGitOperations] Action: stageFile -> ${fileId}`);
    if (!stagedFiles.includes(fileId)) {
      setStagedFiles(prev => [...prev, fileId]);
    }
  };

  // Mock commit function
  const commit = () => {
    console.log(`[useGitOperations] Action: commit! Message: "${commitMsg}", Files:`, stagedFiles);
    // Reset state
    setCommitMsg('');
    setStagedFiles([]);
  };

  return {
    commitMsg,
    setCommitMsg,
    stagedFiles,
    changedFiles,
    stageFile,
    commit
  };
};
