import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileNode, GitConfig } from '../types';
import { readOidcCredential } from '../services/oidc';
import { fetchGithubRepoState, pullGithubBranch, pushGithubBranch } from '../services/githubSync';

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

interface GitOperationState {
  fetching: boolean;
  pulling: boolean;
  pushing: boolean;
  repoRefreshing: boolean;
  lastSyncedAt: number | null;
  lastError: string;
}

const REPO_REFRESH_INTERVAL_MS = 60_000;

const getAuthToken = async (projectId: string | null, gitConfig: GitConfig): Promise<string> => {
  if (gitConfig.authMode === 'pat') {
    const token = gitConfig.patToken.trim();
    if (!token) throw new Error('PAT token is required for GitHub sync.');
    return token;
  }

  if (!projectId) {
    throw new Error('Project ID is required for OIDC token lookup.');
  }

  const credential = await readOidcCredential(projectId);
  if (!credential?.accessToken) {
    throw new Error('Connect OIDC before syncing with GitHub.');
  }
  return credential.accessToken;
};

export const useGitOperations = (
  activeFile: FileNode | null,
  unsaved: boolean,
  projectId: string | null,
  gitConfig: GitConfig,
  onStatus: (message: string, level: 'success' | 'warning' | 'info') => void,
  cloudSyncTick: number
) => {
  const [commitMsg, setCommitMsg] = useState('');
  const [stagedFiles, setStagedFiles] = useState<string[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [currentBranch, setCurrentBranch] = useState(gitConfig.branch?.trim() || 'main');
  const [branchInput, setBranchInput] = useState('');
  const [pullRequestTitle, setPullRequestTitle] = useState('');
  const [syncCounts, setSyncCounts] = useState({ ahead: 0, behind: 0 });
  const [commitHistory, setCommitHistory] = useState<CommitRecord[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequestRecord[]>([]);
  const [opState, setOpState] = useState<GitOperationState>({
    fetching: false,
    pulling: false,
    pushing: false,
    repoRefreshing: false,
    lastSyncedAt: null,
    lastError: ''
  });

  const changedFiles = useMemo(() => {
    return activeFile && unsaved ? [activeFile] : [];
  }, [activeFile, unsaved]);

  const canUseGithubSync = Boolean(projectId && gitConfig.repoUrl.trim());

  const refreshRepoState = useCallback(async (reason: 'manual' | 'timer' | 'cloud') => {
    if (!canUseGithubSync) {
      return;
    }

    setOpState((prev) => ({ ...prev, repoRefreshing: true, lastError: '' }));
    try {
      const token = await getAuthToken(projectId, gitConfig);
      const status = await fetchGithubRepoState(token, gitConfig.repoUrl, currentBranch);
      const branchNames = status.branches.map((entry) => entry.name);
      setBranches(branchNames);
      if (!branchNames.includes(currentBranch)) {
        setCurrentBranch(status.defaultBranch);
      }
      setSyncCounts({ ahead: status.ahead, behind: status.behind });
      setOpState((prev) => ({ ...prev, lastSyncedAt: Date.now(), lastError: '' }));
      if (reason !== 'timer') {
        onStatus(`GITHUB ${reason === 'cloud' ? 'CLOUD ' : ''}SYNC COMPLETE`, 'success');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'GitHub sync failed.';
      setOpState((prev) => ({ ...prev, lastError: message }));
      onStatus(`GITHUB SYNC FAILED: ${message}`.toUpperCase(), 'warning');
    } finally {
      setOpState((prev) => ({ ...prev, repoRefreshing: false }));
    }
  }, [canUseGithubSync, currentBranch, gitConfig, onStatus, projectId]);

  useEffect(() => {
    if (!canUseGithubSync) {
      setBranches([]);
      setSyncCounts({ ahead: 0, behind: 0 });
      return;
    }

    void refreshRepoState('manual');
    const intervalId = window.setInterval(() => {
      void refreshRepoState('timer');
    }, REPO_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [canUseGithubSync, refreshRepoState]);

  useEffect(() => {
    if (cloudSyncTick > 0) {
      void refreshRepoState('cloud');
    }
  }, [cloudSyncTick, refreshRepoState]);

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
    if (!normalized || !branches.includes(normalized)) {
      onStatus('SELECT AN EXISTING REMOTE BRANCH.', 'warning');
      return;
    }

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
    onStatus('LOCAL COMMIT RECORDED', 'info');
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

  const fetchRemote = async () => {
    setOpState((prev) => ({ ...prev, fetching: true }));
    await refreshRepoState('manual');
    setOpState((prev) => ({ ...prev, fetching: false }));
  };

  const pullRemote = async () => {
    if (!canUseGithubSync) return;
    setOpState((prev) => ({ ...prev, pulling: true, lastError: '' }));
    try {
      const token = await getAuthToken(projectId, gitConfig);
      await pullGithubBranch(token, gitConfig.repoUrl, currentBranch);
      onStatus('PULL COMPLETE', 'success');
      await refreshRepoState('manual');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Pull failed.';
      setOpState((prev) => ({ ...prev, lastError: message }));
      onStatus(`PULL FAILED: ${message}`.toUpperCase(), 'warning');
    } finally {
      setOpState((prev) => ({ ...prev, pulling: false }));
    }
  };

  const pushRemote = async () => {
    if (!canUseGithubSync) return;
    setOpState((prev) => ({ ...prev, pushing: true, lastError: '' }));
    const message = (commitHistory[commitHistory.length - 1]?.message || commitMsg || 'chore(sync): push workspace state').trim();

    try {
      const token = await getAuthToken(projectId, gitConfig);
      await pushGithubBranch(token, gitConfig.repoUrl, currentBranch, message);
      onStatus('PUSH COMPLETE', 'success');
      await refreshRepoState('manual');
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Push failed.';
      setOpState((prev) => ({ ...prev, lastError: errMsg }));
      onStatus(`PUSH FAILED: ${errMsg}`.toUpperCase(), 'warning');
    } finally {
      setOpState((prev) => ({ ...prev, pushing: false }));
    }
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
    unstageFile,
    opState,
    refreshRepoState
  };
};
