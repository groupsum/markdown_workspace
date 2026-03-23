import type { GitAdapterService, GitRepo } from './gitAdapter';

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  private: boolean;
}

const GITHUB_API_BASE = 'https://api.github.com';

const parseJsonResponse = async <T>(response: Response, providerName: string): Promise<T> => {
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error(`${providerName} returned a non-JSON response. Reconnect OIDC and verify provider settings.`);
  }
};

const ensureResponse = async (response: Response) => {
  if (response.ok) {
    return;
  }

  let message = `${response.status} ${response.statusText}`;
  const responseText = await response.text();

  if (responseText) {
    try {
      const payload = JSON.parse(responseText) as { message?: string };
      if (payload?.message) {
        message = payload.message;
      }
    } catch {
      // Keep status fallback for non-JSON errors.
    }
  }

  throw new Error(message);
};

const listGithubRepos = async (accessToken: string): Promise<GithubRepo[]> => {
  const response = await fetch(`${GITHUB_API_BASE}/user/repos?per_page=100&affiliation=owner`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`
    }
  });

  await ensureResponse(response);
  const repos = await parseJsonResponse<GithubRepo[]>(response, 'GitHub API');
  return repos.sort((a, b) => a.full_name.localeCompare(b.full_name));
};

const createGithubRepo = async (accessToken: string, name: string, description = ''): Promise<GithubRepo> => {
  const response = await fetch(`${GITHUB_API_BASE}/user/repos`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      description,
      private: true,
      auto_init: true
    })
  });

  await ensureResponse(response);
  return parseJsonResponse<GithubRepo>(response, 'GitHub API');
};

const toGitRepo = (repo: GithubRepo): GitRepo => ({
  id: repo.id,
  name: repo.name,
  fullName: repo.full_name,
  htmlUrl: repo.html_url,
  isPrivate: repo.private
});

export const createGithubAdapterService = (): GitAdapterService => ({
  provider: 'github',
  repoHost: 'github.com',
  listRepos: async (accessToken) => (await listGithubRepos(accessToken)).map(toGitRepo),
  createRepo: async (accessToken, name, description) => toGitRepo(await createGithubRepo(accessToken, name, description))
});
