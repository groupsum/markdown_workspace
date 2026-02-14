import type { GitAdapterService, GitRepo } from './gitAdapter';

interface GiteaRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  private: boolean;
}

const GITEA_API_BASE = 'https://gitea.com/api/v1';

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

const listGiteaRepos = async (accessToken: string): Promise<GiteaRepo[]> => {
  const response = await fetch(`${GITEA_API_BASE}/user/repos?limit=100`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  await ensureResponse(response);
  const repos = await parseJsonResponse<GiteaRepo[]>(response, 'Gitea API');
  return repos.sort((a, b) => a.full_name.localeCompare(b.full_name));
};

const createGiteaRepo = async (accessToken: string, name: string, description = ''): Promise<GiteaRepo> => {
  const response = await fetch(`${GITEA_API_BASE}/user/repos`, {
    method: 'POST',
    headers: {
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
  return parseJsonResponse<GiteaRepo>(response, 'Gitea API');
};

const toGitRepo = (repo: GiteaRepo): GitRepo => ({
  id: repo.id,
  name: repo.name,
  fullName: repo.full_name,
  htmlUrl: repo.html_url,
  isPrivate: repo.private
});

export const createGiteaAdapterService = (): GitAdapterService => ({
  provider: 'gitea',
  repoHost: 'gitea.com',
  listRepos: async (accessToken) => (await listGiteaRepos(accessToken)).map(toGitRepo),
  createRepo: async (accessToken, name, description) => toGitRepo(await createGiteaRepo(accessToken, name, description))
});
