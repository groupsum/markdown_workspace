export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  private: boolean;
}

const GITHUB_API_BASE = 'https://api.github.com';

const ensureResponse = async (response: Response) => {
  if (response.ok) {
    return;
  }

  let message = `${response.status} ${response.statusText}`;
  try {
    const payload = (await response.json()) as { message?: string };
    if (payload?.message) {
      message = payload.message;
    }
  } catch {
    // no-op: keep fallback message
  }

  throw new Error(message);
};

export const listGithubRepos = async (accessToken: string): Promise<GithubRepo[]> => {
  const response = await fetch(`${GITHUB_API_BASE}/user/repos?per_page=100&affiliation=owner`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${accessToken}`
    }
  });

  await ensureResponse(response);
  const repos = (await response.json()) as GithubRepo[];
  return repos.sort((a, b) => a.full_name.localeCompare(b.full_name));
};

export const createGithubRepo = async (accessToken: string, name: string, description = ''): Promise<GithubRepo> => {
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
  return (await response.json()) as GithubRepo;
};
