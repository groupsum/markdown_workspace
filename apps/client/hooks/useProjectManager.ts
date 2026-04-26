import { useState, useEffect } from 'react';
import { Project, GitConfig, OidcProviderId } from '../types';
import { storage } from '../services/storage';
import { readOidcCredential } from '../services/oidc';
import { DEFAULT_AUTH_MODE, DEFAULT_PROVIDER, getDefaultGitConfig } from '../services/gitConfig';

type CreateProjectOptions = {
  sourceKind?: 'indexeddb' | 'filesystem';
  rootPath?: string;
};

const isOidcProvider = (value: string): value is OidcProviderId => {
  return value === 'github' || value === 'gitlab' || value === 'gitea';
};

export const useProjectManager = (
  addToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void
) => {
  console.log('[useProjectManager] Hook init');

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const boot = async () => {
      console.log('[useProjectManager] Booting Project Management Layer...');
      await storage.seedInitialData();
      const allProjects = await storage.getProjects();
      const normalizedProjects = await Promise.all(allProjects.map(async (project) => {
        const credential = await readOidcCredential(project.id);
        const providerCandidate = credential?.provider || project.gitConfig?.oidcProvider || '';
        const oidcProvider: OidcProviderId = isOidcProvider(providerCandidate) ? providerCandidate : DEFAULT_PROVIDER;
        const authMode = project.gitConfig?.authMode === 'oidc' || project.gitConfig?.authMode === 'pat'
          ? project.gitConfig.authMode
          : credential ? 'oidc' : DEFAULT_AUTH_MODE;
        const gitConfig: GitConfig = {
          repoUrl: project.gitConfig?.repoUrl || '',
          branch: project.gitConfig?.branch || 'main',
          username: credential?.username || project.gitConfig?.username || '',
          authMode,
          patToken: project.gitConfig?.patToken || '',
          oidcProvider,
          oidcConnected: Boolean(credential),
          oidcSubject: credential?.subject || project.gitConfig?.oidcSubject || '',
        };
        return { ...project, gitConfig };
      }));
      console.log(`[useProjectManager] Found ${normalizedProjects.length} projects in IDB`);
      setProjects(normalizedProjects);

      const lastId = localStorage.getItem('lastProjectId');
      if (lastId && normalizedProjects.find((project) => project.id === lastId)) {
        console.log(`[useProjectManager] Restoring active project context -> ${lastId}`);
        setActiveProjectId(lastId);
      }
      setLoading(false);
    };
    void boot();
  }, []);

  const createProject = async (name: string, options?: CreateProjectOptions) => {
    console.log(`[useProjectManager] Action: createProject -> ${name}`);
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      gitConfig: getDefaultGitConfig(),
      sourceKind: options?.sourceKind ?? 'indexeddb',
      rootPath: options?.rootPath,
      createdAt: Date.now(),
      lastOpened: Date.now(),
    };
    await storage.saveProject(newProject);
    setProjects((prev) => [...prev, newProject]);
    addToast('PROJECT CREATED', 'success');
    return newProject;
  };

  const deleteProject = async (id: string) => {
    console.log(`[useProjectManager] Action: deleteProject -> ${id}`);
    await storage.deleteProject(id);
    setProjects((prev) => prev.filter((project) => project.id !== id));
    if (activeProjectId === id) {
      console.log('[useProjectManager] Active project deleted, clearing context');
      setActiveProjectId(null);
      localStorage.removeItem('lastProjectId');
    }
    addToast('PROJECT DELETED', 'info');
  };

  const updateGitConfig = async (config: GitConfig) => {
    console.log(`[useProjectManager] Action: updateGitConfig for ${activeProjectId}`);
    if (!activeProjectId) return;
    const current = projects.find((project) => project.id === activeProjectId);
    if (!current) return;
    const updated = { ...current, gitConfig: config };
    await storage.saveProject(updated);
    setProjects((prev) => prev.map((project) => project.id === activeProjectId ? updated : project));
  };

  const updateLastOpened = async (projectId: string) => {
    console.log(`[useProjectManager] Action: updateLastOpened -> ${projectId}`);
    const current = projects.find((project) => project.id === projectId);
    if (!current) return;
    const updated = { ...current, lastOpened: Date.now() };
    await storage.saveProject(updated);
    setProjects((prev) => prev.map((project) => project.id === projectId ? updated : project));
  };

  const updateProject = async (project: Project) => {
    await storage.saveProject(project);
    setProjects((prev) => prev.map((candidate) => candidate.id === project.id ? project : candidate));
  };

  return {
    projects,
    activeProjectId,
    loading,
    setLoading,
    setActiveProjectId,
    createProject,
    deleteProject,
    updateProject,
    updateGitConfig,
    updateLastOpened,
  };
};
