import { commonVars } from '../env/common_vars';

const toLink = (value: string | undefined, fallback = '#') => value?.trim() || fallback;

const npmPackageName = import.meta.env.VITE_NPM_PACKAGE_NAME?.trim() || commonVars.npmPackageName;
const npmPackagePath = import.meta.env.VITE_NPM_PACKAGE_PATH?.trim() || commonVars.npmPackagePath;
const githubRepoPath = commonVars.githubRepoPath;

const npmRepoDefault = 'https://www.npmjs.com/org/mdwrk';
const esmCdnDefault = `${commonVars.esmCdnBaseUrl}/${npmPackageName}`;
const githubRepoDefault = `https://github.com/${githubRepoPath}`;

export const links = {
  demo: toLink(import.meta.env.VITE_DEMO_URL),
  github: toLink(import.meta.env.VITE_GITHUB_URL),
  x: toLink(import.meta.env.VITE_X_URL, commonVars.xProfileUrl),
  community: toLink(import.meta.env.VITE_COMMUNITY_URL),
  githubRepo: toLink(import.meta.env.VITE_GITHUB_REPO_URL, githubRepoDefault),
  npmRepo: toLink(import.meta.env.VITE_NPM_REPO_URL, npmRepoDefault),
  esmCdn: toLink(import.meta.env.VITE_NPM_ESM_CDN_URL, esmCdnDefault),
  npmPackageName,
  npmPackagePath
};
