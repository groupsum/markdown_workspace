
import { useState, useEffect } from 'react';
import { Project, GitConfig, OidcProviderId } from '../types';
import { storage } from '../services/storage';
import { readOidcCredential } from '../services/oidc';


const isOidcProvider = (value: string): value is OidcProviderId => {
  return value === 'github' || value === 'gitlab' || value === 'gitea';
};

const getDefaultAuthMode = (): 'oidc' | 'pat' => {
  const mode = import.meta.env.VITE_AUTH_MODE?.toLowerCase();
  return mode === 'oidc' ? 'oidc' : 'pat';
};

const getDefaultPatToken = (): string => import.meta.env.VITE_PAT_TOKEN?.trim() || '';

export const useProjectManager = (
  addToast: (msg: string, type?: 'info' | 'success' | 'warning') => void
) => {
  console.log("[useProjectManager] Hook init");

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const boot = async () => {
      console.log("[useProjectManager] Booting Project Management Layer...");
      await storage.seedInitialData();
      const allProjects = await storage.getProjects();
      const normalizedProjects = await Promise.all(allProjects.map(async (project) => {
        const credential = await readOidcCredential(project.id);
        const providerCandidate = credential?.provider || project.gitConfig?.oidcProvider || '';
        const oidcProvider: OidcProviderId = isOidcProvider(providerCandidate) ? providerCandidate : 'github';
        const defaultAuthMode = getDefaultAuthMode();
        const gitConfig: GitConfig = {
          repoUrl: project.gitConfig?.repoUrl || '',
          branch: project.gitConfig?.branch || 'main',
          username: credential?.username || project.gitConfig?.username || '',
          authMode: project.gitConfig?.authMode === 'oidc' || project.gitConfig?.authMode === 'pat'
            ? project.gitConfig.authMode
            : defaultAuthMode,
          patToken: project.gitConfig?.patToken || getDefaultPatToken(),
          oidcProvider,
          oidcConnected: Boolean(credential),
          oidcSubject: credential?.subject || project.gitConfig?.oidcSubject || ''
        };
        return { ...project, gitConfig };
      }));
      console.log(`[useProjectManager] Found ${normalizedProjects.length} projects in IDB`);
      setProjects(normalizedProjects);
      
      const lastId = localStorage.getItem('lastProjectId');
      if (lastId && normalizedProjects.find(p => p.id === lastId)) {
         console.log(`[useProjectManager] Restoring active project context -> ${lastId}`);
         setActiveProjectId(lastId);
      }
      setLoading(false);
    };
    boot();
  }, []);

  const createProject = async (name: string) => {
     console.log(`[useProjectManager] Action: createProject -> ${name}`);
     const newProject: Project = {
         id: `proj-${Date.now()}`,
         name,
         gitConfig: { repoUrl: '', branch: 'main', username: '', authMode: getDefaultAuthMode(), patToken: getDefaultPatToken(), oidcProvider: 'github', oidcConnected: false, oidcSubject: '' },
         createdAt: Date.now(),
         lastOpened: Date.now()
     };
     await storage.saveProject(newProject);
     setProjects(prev => [...prev, newProject]);
     addToast('PROJECT CREATED', 'success');
     return newProject;
  };

  const deleteProject = async (id: string) => {
     console.log(`[useProjectManager] Action: deleteProject -> ${id}`);
     await storage.deleteProject(id);
     setProjects(prev => prev.filter(p => p.id !== id));
     if (activeProjectId === id) {
         console.log("[useProjectManager] Active project deleted, clearing context");
         setActiveProjectId(null);
         localStorage.removeItem('lastProjectId');
     }
     addToast('PROJECT DELETED', 'info');
  };

  const updateGitConfig = async (config: GitConfig) => {
      console.log(`[useProjectManager] Action: updateGitConfig for ${activeProjectId}`);
      if (!activeProjectId) return;
      const current = projects.find(p => p.id === activeProjectId);
      if (current) {
          const updated = { ...current, gitConfig: config };
          await storage.saveProject(updated);
          setProjects(prev => prev.map(p => p.id === activeProjectId ? updated : p));
      }
  };

  const updateLastOpened = async (projectId: string) => {
      console.log(`[useProjectManager] Action: updateLastOpened -> ${projectId}`);
      const current = projects.find(p => p.id === projectId);
      if (current) {
          const updated = { ...current, lastOpened: Date.now() };
          await storage.saveProject(updated);
          setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
      }
  };

  return {
    projects,
    activeProjectId,
    loading,
    setLoading,
    setActiveProjectId,
    createProject,
    deleteProject,
    updateGitConfig,
    updateLastOpened
  };
};
