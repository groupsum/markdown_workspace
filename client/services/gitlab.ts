import type { GitAdapterService, GitRepo } from './gitAdapter';

interface GitlabProject {
  id: number;
  name: string;
  path_with_namespace: string;
  web_url: string;
  visibility: 'private' | 'internal' | 'public';
}

const GITLAB_API_BASE = 'https://gitlab.com/api/v4';

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
      const payload = JSON.parse(responseText) as { message?: string | Record<string, string[]> };
      if (typeof payload?.message === 'string') {
        message = payload.message;
      }
    } catch {
      // Keep status fallback for non-JSON errors.
    }
  }

  throw new Error(message);
};

const listGitlabProjects = async (accessToken: string): Promise<GitlabProject[]> => {
  const response = await fetch(`${GITLAB_API_BASE}/projects?membership=true&owned=true&per_page=100`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  await ensureResponse(response);
  const projects = await parseJsonResponse<GitlabProject[]>(response, 'GitLab API');
  return projects.sort((a, b) => a.path_with_namespace.localeCompare(b.path_with_namespace));
};

const createGitlabProject = async (accessToken: string, name: string, description = ''): Promise<GitlabProject> => {
  const response = await fetch(`${GITLAB_API_BASE}/projects`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      description,
      visibility: 'private',
      initialize_with_readme: true
    })
  });

  await ensureResponse(response);
  return parseJsonResponse<GitlabProject>(response, 'GitLab API');
};

const toGitRepo = (project: GitlabProject): GitRepo => ({
  id: project.id,
  name: project.name,
  fullName: project.path_with_namespace,
  htmlUrl: project.web_url,
  isPrivate: project.visibility === 'private'
});

export const createGitlabAdapterService = (): GitAdapterService => ({
  provider: 'gitlab',
  repoHost: 'gitlab.com',
  listRepos: async (token) => (await listGitlabProjects(token)).map(toGitRepo),
  createRepo: async (token, name, description) => toGitRepo(await createGitlabProject(token, name, description))
});
