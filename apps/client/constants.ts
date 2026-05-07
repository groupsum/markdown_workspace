
export const APP_VERSION = typeof __APP_VERSION__ === 'undefined' ? '0.0.0-test' : __APP_VERSION__;
export const APP_BUILD_ID = typeof __APP_BUILD_ID__ === 'undefined' ? 'local-test-build' : __APP_BUILD_ID__;
export const APP_PACKAGE_NAME = typeof __PACKAGE_NAME__ === 'undefined' ? '@mdwrk/mdwrkspace' : __PACKAGE_NAME__;
export const APP_STORAGE_SCHEMA = typeof __APP_STORAGE_SCHEMA__ === 'undefined' ? 'lattice-idb-test' : __APP_STORAGE_SCHEMA__;
export const CLIENT_VERSION_INDEX_PATH = '/client/versions/index.json';
export const SELECTED_VERSION_STORAGE_KEY = 'lattice-selected-client-version';
export const ACTIVE_STORAGE_SCHEMA_STORAGE_KEY = 'lattice-active-storage-schema';
export const MARKDOWN_IMPORT_REQUEST_EVENT = 'mdwrk:import-markdown-requested';
export const GIT_REPO_REFRESH_REQUEST_EVENT = 'lattice:gh:refresh-repos';

// Theme System Constants
export const THEME_STORAGE_KEY = 'lattice-theme';
export const DEFAULT_THEME_ID = 'anodized-billet';
export const THEME_STYLE_ELEMENT_ID = 'lattice-theme';
