declare const __APP_VERSION__: string;
declare const __APP_BUILD_ID__: string;
declare const __PACKAGE_NAME__: string;
declare const __APP_STORAGE_SCHEMA__: string;

interface DesktopMarkdownFile {
  path: string;
  name: string;
  content: string;
}

interface DesktopShellApi {
  readonly isDesktop: boolean;
  openMarkdownFiles(): Promise<DesktopMarkdownFile[]>;
  saveMarkdownFile(payload: { path: string; content: string }): Promise<{ path: string }>;
  getLaunchMarkdownFiles(): Promise<DesktopMarkdownFile[]>;
  onOpenMarkdownFiles(listener: (files: DesktopMarkdownFile[]) => void): () => void;
  onSaveActiveMarkdownRequested(listener: () => void): () => void;
}

interface Window {
  desktopShell?: DesktopShellApi;
}
