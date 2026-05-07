import type { Project } from '../types';

export type PersistenceContentBackend = 'indexeddb' | 'filesystem';
export type PersistenceSettingsBackend = 'indexeddb';
export type CloudPersistenceBoundary = 'out_of_bounds';

export interface PersistenceDiagnosticsSnapshot {
  projectId: string | null;
  projectName: string | null;
  contentBackend: PersistenceContentBackend;
  settingsBackend: PersistenceSettingsBackend;
  gitConfigBackend: PersistenceSettingsBackend;
  sessionBackend: 'localstorage+indexeddb';
  filesystemRootPath: string | null;
  cloudPersistence: CloudPersistenceBoundary;
}

export const CLOUD_PERSISTENCE_BOUNDARY: CloudPersistenceBoundary = 'out_of_bounds';

export const assertCloudPersistenceOutOfBounds = (backend: string | null | undefined): void => {
  if (!backend || backend === CLOUD_PERSISTENCE_BOUNDARY) {
    return;
  }
  throw new Error(`Cloud persistence backend "${backend}" is out of bounds for MdWrk local-first storage.`);
};

export const resolveProjectPersistence = (project: Project | null): PersistenceDiagnosticsSnapshot => {
  const isFilesystemProject = project?.sourceKind === 'filesystem' && Boolean(project.rootPath);
  return {
    projectId: project?.id ?? null,
    projectName: project?.name ?? null,
    contentBackend: isFilesystemProject ? 'filesystem' : 'indexeddb',
    settingsBackend: 'indexeddb',
    gitConfigBackend: 'indexeddb',
    sessionBackend: 'localstorage+indexeddb',
    filesystemRootPath: isFilesystemProject ? project?.rootPath ?? null : null,
    cloudPersistence: CLOUD_PERSISTENCE_BOUNDARY,
  };
};
