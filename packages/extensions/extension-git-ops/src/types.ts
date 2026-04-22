import type { ReactNode } from "react";

export interface GitOpsRenderProps {
  readonly viewId: string;
  readonly input: unknown;
  readonly isOpen: boolean;
  readonly workspaceSidebarOpen?: boolean;
  setWorkspaceSidebarOpen?(open: boolean): void;
  close(): Promise<void>;
  focus(): Promise<void>;
}

export interface GitOpsBundledEntryOptions {
  toggleGitOps(): void | Promise<void>;
  refreshGitOps?(): void | Promise<void>;
  renderWorkspace(props: GitOpsRenderProps): ReactNode;
  renderExplorer(props: GitOpsRenderProps): ReactNode;
  renderSettings(): ReactNode;
  isActive?: () => boolean;
}
