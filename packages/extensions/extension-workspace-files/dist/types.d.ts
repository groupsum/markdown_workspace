import type { ReactNode } from "react";
export interface WorkspaceFilesRenderProps {
    readonly viewId: string;
    readonly input: unknown;
    readonly isOpen: boolean;
    readonly workspaceSidebarOpen?: boolean;
    setWorkspaceSidebarOpen?(open: boolean): void;
    close(): Promise<void>;
    focus(): Promise<void>;
}
export interface WorkspaceFilesActions {
    toggleExplorer(): void | Promise<void>;
    newFile(): void | Promise<void>;
    newFolder(): void | Promise<void>;
    saveCurrentFile(): void | Promise<void>;
    renameSelected(): void | Promise<void>;
    deleteSelected(): void | Promise<void>;
    importMarkdown(): void | Promise<void>;
    openHostFile(): void | Promise<void>;
    downloadWorkspace(): void | Promise<void>;
    exportHtml(): void | Promise<void>;
    printPreview(): void | Promise<void>;
    viewEditor(): void | Promise<void>;
    viewSplit(): void | Promise<void>;
    viewPreview(): void | Promise<void>;
    focusExplorer(): void | Promise<void>;
}
export interface WorkspaceFilesBundledEntryOptions {
    readonly actions: WorkspaceFilesActions;
    readonly renderWorkspace: (props: WorkspaceFilesRenderProps) => ReactNode;
    readonly renderExplorer: (props: WorkspaceFilesRenderProps) => ReactNode;
    readonly renderSettings: () => ReactNode;
    readonly isExplorerActive?: () => boolean;
}
//# sourceMappingURL=types.d.ts.map