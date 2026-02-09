const toLink = (value: string | undefined) => value?.trim() || '#';

export const links = {
  demo: toLink(import.meta.env.VITE_DEMO_URL),
  github: toLink(import.meta.env.VITE_GITHUB_URL),
  x: toLink(import.meta.env.VITE_X_URL),
  community: toLink(import.meta.env.VITE_COMMUNITY_URL),
  githubRepo: toLink(import.meta.env.VITE_GITHUB_REPO_URL),
  npmRepo: toLink(import.meta.env.VITE_NPM_REPO_URL),
};
