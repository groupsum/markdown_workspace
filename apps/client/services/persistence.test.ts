import { describe, expect, it } from 'vitest';
import { assertCloudPersistenceOutOfBounds, resolveProjectPersistence } from './persistence';
import type { Project } from '../types';

const baseProject: Project = {
  id: 'proj-1',
  name: 'Project',
  gitConfig: {
    repoUrl: '',
    branch: 'main',
    username: '',
    authMode: 'pat',
    patToken: '',
    oidcProvider: 'github',
    oidcConnected: false,
    oidcSubject: '',
  },
  createdAt: 0,
  lastOpened: 0,
};

describe('persistence diagnostics', () => {
  it('separates IndexedDB projects from filesystem-backed desktop projects', () => {
    expect(resolveProjectPersistence({ ...baseProject, sourceKind: 'indexeddb' })).toMatchObject({
      contentBackend: 'indexeddb',
      settingsBackend: 'indexeddb',
      gitConfigBackend: 'indexeddb',
      sessionBackend: 'localstorage+indexeddb',
      filesystemRootPath: null,
      cloudPersistence: 'out_of_bounds',
    });

    expect(resolveProjectPersistence({ ...baseProject, sourceKind: 'filesystem', rootPath: 'C:\\workspace' })).toMatchObject({
      contentBackend: 'filesystem',
      settingsBackend: 'indexeddb',
      gitConfigBackend: 'indexeddb',
      filesystemRootPath: 'C:\\workspace',
      cloudPersistence: 'out_of_bounds',
    });
  });

  it('keeps cloud persistence explicitly out of bounds', () => {
    expect(() => assertCloudPersistenceOutOfBounds('out_of_bounds')).not.toThrow();
    expect(() => assertCloudPersistenceOutOfBounds('s3')).toThrow('Cloud persistence backend "s3" is out of bounds');
  });
});
