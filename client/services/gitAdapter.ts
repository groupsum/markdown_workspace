import type { OidcProviderId } from '../types';
import { createGithubAdapterService } from './github';
import { createGitlabAdapterService } from './gitlab';
import { createGiteaAdapterService } from './gitea';

export interface GitRepo {
  id: string | number;
  name: string;
  fullName: string;
  htmlUrl: string;
  isPrivate: boolean;
}

export interface GitAdapterService {
  readonly provider: OidcProviderId;
  readonly repoHost: string;
  listRepos: (token: string) => Promise<GitRepo[]>;
  createRepo: (token: string, name: string, description?: string) => Promise<GitRepo>;
}

const adapters: Record<OidcProviderId, GitAdapterService> = {
  github: createGithubAdapterService(),
  gitlab: createGitlabAdapterService(),
  gitea: createGiteaAdapterService()
};

export const getGitAdapterService = (provider: OidcProviderId): GitAdapterService => adapters[provider];

