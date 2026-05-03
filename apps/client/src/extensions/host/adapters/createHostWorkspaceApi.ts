import type { HostWorkspaceApi, WorkspaceFileSummary } from '@mdwrk/extension-host';
import type { FileNode } from '../../../../types';
import type { ClientRuntimeBridge } from '../../../app/runtime/clientRuntimeTypes';

function buildNodePath(node: FileNode, nodes: readonly FileNode[]): string {
  const segments = [node.name];
  let cursor = node.parentId;
  while (cursor) {
    const parent = nodes.find((candidate) => candidate.id === cursor);
    if (!parent) break;
    segments.unshift(parent.name);
    cursor = parent.parentId;
  }
  return segments.join('/');
}

function fileSummary(node: FileNode, nodes: readonly FileNode[]): WorkspaceFileSummary {
  return {
    id: node.id,
    name: node.name,
    path: buildNodePath(node, nodes),
    kind: node.type,
  };
}

export function createHostWorkspaceApi(runtime: ClientRuntimeBridge): HostWorkspaceApi {
  return {
    async listProjects() {
      return runtime.getSnapshot().app.state.projects.map((project) => ({
        id: project.id,
        name: project.name,
      }));
    },
    async listFiles() {
      const snapshot = runtime.getSnapshot();
      return snapshot.app.state.files
        .filter((node) => node.type === 'file')
        .map((node) => fileSummary(node, snapshot.app.state.files));
    },
    async getActiveProject() {
      const project = runtime.getSnapshot().app.state.currentProject;
      if (!project) return null;
      return {
        id: project.id,
        name: project.name,
      };
    },
    async getActiveFile() {
      const snapshot = runtime.getSnapshot();
      const file = snapshot.app.state.activeFile;
      if (!file) return null;
      return fileSummary(file, snapshot.app.state.files);
    },
    async readFile(path: string): Promise<string> {
      const snapshot = runtime.getSnapshot();
      const file = snapshot.app.state.files.find((candidate) => buildNodePath(candidate, snapshot.app.state.files) === path && candidate.type === 'file');
      if (!file) {
        throw new Error(`File not found: ${path}`);
      }
      return file.content ?? '';
    },
    async writeFile(path: string, content: string): Promise<void> {
      const snapshot = runtime.getSnapshot();
      const file = snapshot.app.state.files.find((candidate) => buildNodePath(candidate, snapshot.app.state.files) === path && candidate.type === 'file');
      if (!file) {
        throw new Error(`File not found: ${path}`);
      }
      if (snapshot.app.state.activeFile?.id === file.id) {
        snapshot.app.actions.handleContentChange(content);
        return;
      }
      snapshot.app.actions.handleExplorerSelect(file.id);
      snapshot.app.actions.handleContentChange(content);
    },
  };
}
