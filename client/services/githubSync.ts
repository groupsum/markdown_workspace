const GITHUB_API_BASE = 'https://api.github.com';

export interface GithubSyncBranch {
  name: string;
  commitSha: string;
}

export interface GithubFetchResult {
  branches: GithubSyncBranch[];
  ahead: number;
  behind: number;
  defaultBranch: string;
}

const ensureResponse = async (response: Response) => {
  if (response.ok) return;

  const body = await response.text();
  let message = `${response.status} ${response.statusText}`;
  if (body) {
    try {
      const parsed = JSON.parse(body) as { message?: string };
      if (parsed.message) {
        message = parsed.message;
      }
    } catch {
      // keep fallback
    }
  }

  throw new Error(message);
};

const parseRepo = (repoUrl: string): { owner: string; repo: string } => {
  const trimmed = repoUrl.trim().replace(/\.git$/, '');
  if (!trimmed) {
    throw new Error('Repository URL is required.');
  }

  if (/^[\w.-]+\/[\w.-]+$/.test(trimmed)) {
    const [owner, repo] = trimmed.split('/');
    return { owner, repo };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname !== 'github.com') {
      throw new Error('GitHub service requires a github.com repository URL.');
    }
    const [owner, repo] = parsed.pathname.split('/').filter(Boolean);
    if (!owner || !repo) {
      throw new Error('Repository URL must include owner and repo.');
    }
    return { owner, repo };
  } catch {
    throw new Error('Invalid repository URL. Use https://github.com/owner/repo or owner/repo.');
  }
};

const githubFetch = async <T>(token: string, path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${GITHUB_API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    }
  });

  await ensureResponse(response);
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
};

interface RepoInfoResponse { default_branch: string }
interface BranchResponse { name: string; commit: { sha: string } }
interface CompareResponse { ahead_by: number; behind_by: number }
interface RefResponse { object: { sha: string } }
interface CommitResponse { tree: { sha: string } }

export const listGithubBranches = async (token: string, repoUrl: string): Promise<GithubSyncBranch[]> => {
  const { owner, repo } = parseRepo(repoUrl);
  const branches = await githubFetch<BranchResponse[]>(token, `/repos/${owner}/${repo}/branches?per_page=100`);
  return branches.map((branch) => ({ name: branch.name, commitSha: branch.commit.sha }));
};

export const fetchGithubRepoState = async (token: string, repoUrl: string, branch: string): Promise<GithubFetchResult> => {
  const { owner, repo } = parseRepo(repoUrl);
  const [repoInfo, branches] = await Promise.all([
    githubFetch<RepoInfoResponse>(token, `/repos/${owner}/${repo}`),
    listGithubBranches(token, repoUrl)
  ]);

  const targetBranch = branch.trim() || repoInfo.default_branch;
  const compare = await githubFetch<CompareResponse>(
    token,
    `/repos/${owner}/${repo}/compare/${encodeURIComponent(repoInfo.default_branch)}...${encodeURIComponent(targetBranch)}`
  );

  return {
    branches,
    ahead: Math.max(0, compare.ahead_by || 0),
    behind: Math.max(0, compare.behind_by || 0),
    defaultBranch: repoInfo.default_branch
  };
};

export const pullGithubBranch = async (token: string, repoUrl: string, branch: string): Promise<void> => {
  const { owner, repo } = parseRepo(repoUrl);
  const repoInfo = await githubFetch<RepoInfoResponse>(token, `/repos/${owner}/${repo}`);
  await githubFetch<{ sha: string }>(token, `/repos/${owner}/${repo}/merges`, {
    method: 'POST',
    body: JSON.stringify({
      base: branch,
      head: repoInfo.default_branch,
      commit_message: `chore(sync): pull ${repoInfo.default_branch} into ${branch}`
    })
  });
};

export const pushGithubBranch = async (token: string, repoUrl: string, branch: string, message: string): Promise<void> => {
  const { owner, repo } = parseRepo(repoUrl);
  const ref = await githubFetch<RefResponse>(token, `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`);
  const headSha = ref.object.sha;
  const headCommit = await githubFetch<CommitResponse>(token, `/repos/${owner}/${repo}/git/commits/${headSha}`);

  const commit = await githubFetch<{ sha: string }>(token, `/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message,
      tree: headCommit.tree.sha,
      parents: [headSha]
    })
  });

  await githubFetch<void>(token, `/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha, force: false })
  });
};
