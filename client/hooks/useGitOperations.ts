import { useMemo, useState } from 'react';
import { FileNode } from '../types';

interface CommitRecord {
  id: string;
  message: string;
  files: string[];
  branch: string;
  createdAt: number;
}

interface PullRequestRecord {
  id: string;
  title: string;
  body: string;
  sourceBranch: string;
  targetBranch: string;
  createdAt: number;
}

const DEFAULT_BRANCHES = ['main', 'develop', 'release'];

export const useGitOperations = (activeFile: FileNode | null, unsaved: boolean, initialBranch = 'main') => {
  const [commitMsg, setCommitMsg] = useState('');
  const [stagedFiles, setStagedFiles] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>(() => {
    const seeded = initialBranch.trim() || 'main';
    return Array.from(new Set([seeded, ...DEFAULT_BRANCHES]));
  });
  const [currentBranch, setCurrentBranch] = useState(initialBranch || 'main');
  const [branchInput, setBranchInput] = useState('');
  const [pullRequestTitle, setPullRequestTitle] = useState('');
  const [syncCounts, setSyncCounts] = useState({ ahead: 0, behind: 0 });
  const [commitHistory, setCommitHistory] = useState<CommitRecord[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequestRecord[]>([]);

  const changedFiles = useMemo(() => {
    return activeFile && unsaved ? [activeFile] : [];
  }, [activeFile, unsaved]);

  const stageFile = (fileId: string) => {
    if (!stagedFiles.includes(fileId)) {
      setStagedFiles((prev) => [...prev, fileId]);
    }
  };

  const unstageFile = (fileId: string) => {
    setStagedFiles((prev) => prev.filter((id) => id !== fileId));
  };

  const checkoutBranch = (branchName: string) => {
    const normalized = branchName.trim();
    if (!normalized) {
      return;
    }
    setBranches((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
    setCurrentBranch(normalized);
    setBranchInput('');
    setStagedFiles([]);
  };

  const commit = () => {
    const filesToCommit = stagedFiles.length > 0 ? stagedFiles : changedFiles.map((file) => file.id);
    if (filesToCommit.length === 0) {
      return;
    }

    const record: CommitRecord = {
      id: `c-${Date.now()}`,
      message: commitMsg.trim() || 'chore: update files',
      files: filesToCommit,
      branch: currentBranch,
      createdAt: Date.now()
    };

    setCommitHistory((prev) => [...prev, record]);
    setCommitMsg('');
    setStagedFiles([]);
    setSyncCounts((prev) => ({ ...prev, ahead: prev.ahead + 1 }));
  };

  const undoCommit = () => {
    setCommitHistory((prev) => {
      const next = [...prev];
      const index = [...next].reverse().findIndex((commitItem) => commitItem.branch === currentBranch);
      if (index === -1) {
        return prev;
      }

      const target = next.length - 1 - index;
      next.splice(target, 1);
      setSyncCounts((counts) => ({ ...counts, ahead: Math.max(0, counts.ahead - 1) }));
      return next;
    });
  };

  const fetchRemote = () => {
    setSyncCounts((prev) => ({ ...prev, behind: prev.behind + 1 }));
  };

  const pullRemote = () => {
    setSyncCounts((prev) => ({ ahead: prev.ahead, behind: Math.max(0, prev.behind - 1) }));
  };

  const pushRemote = () => {
    setSyncCounts((prev) => ({ behind: prev.behind, ahead: Math.max(0, prev.ahead - 1) }));
  };

  const createPullRequest = (targetBranch = 'main', title = pullRequestTitle, body = '') => {
    if (!title.trim() || currentBranch === targetBranch) {
      return;
    }

    const record: PullRequestRecord = {
      id: `pr-${Date.now()}`,
      title: title.trim(),
      body: body.trim(),
      sourceBranch: currentBranch,
      targetBranch,
      createdAt: Date.now()
    };
    setPullRequests((prev) => [record, ...prev]);
    setPullRequestTitle('');
  };

  const latestCommit = [...commitHistory].reverse().find((item) => item.branch === currentBranch) || null;

  return {
    branchInput,
    branches,
    changedFiles,
    commit,
    commitHistory,
    commitMsg,
    createPullRequest,
    currentBranch,
    checkoutBranch,
    fetchRemote,
    latestCommit,
    pullRemote,
    pullRequestTitle,
    pullRequests,
    pushRemote,
    setBranchInput,
    setCommitMsg,
    setCurrentBranch,
    setPullRequestTitle,
    stageFile,
    stagedFiles,
    syncCounts,
    undoCommit,
    unstageFile
  };
};
