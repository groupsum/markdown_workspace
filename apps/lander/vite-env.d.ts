/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_URL: string;
  readonly VITE_GITHUB_URL: string;
  readonly VITE_X_URL: string;
  readonly VITE_COMMUNITY_URL: string;
  readonly VITE_GITHUB_REPO_URL: string;
  readonly VITE_NPM_REPO_URL: string;
  readonly VITE_NPM_PACKAGE_NAME: string;
  readonly VITE_NPM_PACKAGE_PATH: string;
  readonly VITE_NPM_ESM_CDN_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.yaml?raw' {
  const content: string;
  export default content;
}
