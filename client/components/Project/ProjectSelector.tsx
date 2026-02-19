import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Project, AppTheme } from '../../types';
import { THEMES } from '../../data/themes';
import { ProjectGrid } from './selector/ProjectGrid';
import { ProjectModals } from './selector/ProjectModals';

interface ProjectSelectorProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (project: Project) => void;
  onCreateProject: (name: string) => void;
  onDeleteProject: (id: string) => void;
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  currentTheme,
  onThemeChange
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const currentThemeIndex = Math.max(THEMES.findIndex((theme) => theme.id === currentTheme), 0);
  const currentThemeDef = THEMES[currentThemeIndex];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onCreateProject(newProjectName.trim());
    setNewProjectName('');
    setIsCreating(false);
  };

  return (
    <main className="project-selector-stage">
      <div className="texture-overlay" aria-hidden="true" />
      <div className="project-selector-chassis">
        <header className="project-selector-top">
          <div className="project-header-info"><p className="project-subtitle">MOUNT_WORKSPACE_OR_INIT_NEW_PLATE</p></div>
          <div className="project-actions flex items-center gap-4">
            <div className="theme-selector-container"><button onClick={() => setShowThemeModal(true)} className="theme-toggle-btn" title="Project Theme">{currentThemeDef.icon && React.cloneElement(currentThemeDef.icon as React.ReactElement<any>, { size: 18 })}</button></div>
            <button onClick={() => setIsCreating(true)} className="project-btn-new"><Plus size={14} /> NEW_VAULT</button>
          </div>
        </header>

        <div className="project-selector-body">
          <ProjectModals
            isCreating={isCreating}
            newProjectName={newProjectName}
            showThemeModal={showThemeModal}
            projectToDelete={projectToDelete}
            currentTheme={currentTheme}
            currentThemeDef={currentThemeDef}
            currentThemeIndex={currentThemeIndex}
            setIsCreating={setIsCreating}
            setShowThemeModal={setShowThemeModal}
            setNewProjectName={setNewProjectName}
            setProjectToDelete={setProjectToDelete}
            onCreate={handleCreate}
            onThemeSelect={(themeId) => { onThemeChange(themeId); setShowThemeModal(false); }}
            onDeleteConfirm={() => { if (projectToDelete) onDeleteProject(projectToDelete.id); setProjectToDelete(null); }}
          />
          <ProjectGrid projects={projects} activeProjectId={activeProjectId} isCreating={isCreating} onSelectProject={onSelectProject} onCreateClick={() => setIsCreating(true)} onDeleteClick={setProjectToDelete} />
        </div>
      </div>
    </main>
  );
};
