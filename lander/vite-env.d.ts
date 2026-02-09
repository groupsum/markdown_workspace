interface ImportMetaEnv {
  readonly VITE_DEMO_URL: string;
  readonly VITE_GITHUB_URL: string;
  readonly VITE_X_URL: string;
  readonly VITE_COMMUNITY_URL: string;
  readonly VITE_GITHUB_REPO_URL: string;
  readonly VITE_NPM_REPO_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
