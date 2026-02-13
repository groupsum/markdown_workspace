
import React, { useState } from 'react';
import { Project, AppTheme } from '../../types';
import { THEMES } from '../../data/themes';
import { Box, Plus, GitBranch, Clock, ArrowRight, Trash2, Zap, AlertTriangle } from 'lucide-react';

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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreating(false);
    }
  };

  const currentThemeIndex = Math.max(THEMES.findIndex((theme) => theme.id === currentTheme), 0);
  const currentThemeDef = THEMES[currentThemeIndex];

  const handleThemeSelect = (themeId: AppTheme) => {
    onThemeChange(themeId);
    setShowThemeModal(false);
  };

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete.id);
    }
    setProjectToDelete(null);
  };

  return (
    <main className="project-selector-stage">
      <div className="texture-overlay" aria-hidden="true" />
      <div className="project-selector-chassis">
        <header className="project-selector-top">
          <div className="project-header-info">
            <p className="project-subtitle">MOUNT_WORKSPACE_OR_INIT_NEW_PLATE</p>
          </div>
          
          <div className="project-actions flex items-center gap-4">
            <div className="theme-selector-container">
              <button 
                onClick={() => setShowThemeModal(true)}
                className="theme-toggle-btn"
                title="Project Theme"
              >
                {currentThemeDef.icon && React.cloneElement(currentThemeDef.icon as React.ReactElement<any>, { size: 18 })}
              </button>
            </div>

            <button 
              onClick={() => setIsCreating(true)}
              className="project-btn-new"
            >
              <Plus size={14} /> NEW_VAULT
            </button>
          </div>
        </header>

        <div className="project-selector-body">
          {isCreating && (
            <div
              className="project-create-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-create-title"
              onClick={() => setIsCreating(false)}
            >
              <div
                className="project-create-modal-surface"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="project-create-modal-header">
                  <h2 id="project-create-title" className="project-create-title">
                    Initialize_New_Vault
                  </h2>
                  <button
                    type="button"
                    className="project-create-close"
                    onClick={() => setIsCreating(false)}
                  >
                    CLOSE
                  </button>
                </div>
                <form onSubmit={handleCreate} className="project-create-form">
                  <div className="project-input-group">
                    <label className="project-input-label">Project_Identity_Tag</label>
                    <input
                      autoFocus
                      className="project-input"
                      placeholder="E.G. NEURAL_INTERFACE_V1"
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                    />
                  </div>
                  <div className="project-input-group">
                    <label className="project-input-label">Assigned_Skin</label>
                    <button
                      type="button"
                      onClick={() => setShowThemeModal(true)}
                      className="project-theme-trigger"
                    >
                      <span className="project-theme-trigger-label">{currentThemeDef.name}</span>
                      <span className="project-theme-trigger-meta">OPEN_THEME_MATRIX</span>
                    </button>
                  </div>
                  <div className="project-form-actions">
                    <button type="submit" className="project-btn-submit">INITIALIZE_CORE</button>
                    <button type="button" onClick={() => setIsCreating(false)} className="project-btn-cancel">ABORT_CMD</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showThemeModal && (
            <div
              className="theme-selector-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="theme-selector-title"
              onClick={() => setShowThemeModal(false)}
            >
              <div
                className="theme-selector-modal-surface"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="theme-selector-modal-header">
                  <h2 id="theme-selector-title" className="theme-selector-title">
                    Theme_Matrix
                  </h2>
                  <button
                    type="button"
                    className="theme-selector-close"
                    onClick={() => setShowThemeModal(false)}
                  >
                    CLOSE
                  </button>
                </div>
                <div className="theme-selector-modal-body">
                  <div className="theme-selector-meta">
                    <span className="theme-meta-label">PROJECT_TITLE</span>
                    <span className="theme-meta-value">{newProjectName.trim() || 'UNTITLED_PROJECT'}</span>
                    <span className="theme-meta-count">{currentThemeIndex + 1}/{THEMES.length}</span>
                  </div>
                  <div className="theme-modal-grid">
                    {THEMES.map(theme => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => handleThemeSelect(theme.id)}
                        className={`theme-modal-button ${currentTheme === theme.id ? 'is-active' : ''}`}
                      >
                        <div className="theme-modal-button-top">
                          <span className="theme-name">{theme.name}</span>
                          {theme.icon && React.cloneElement(theme.icon as React.ReactElement<any>, { 
                            size: 18, 
                            className: currentTheme === theme.id ? 'text-[var(--accent)]' : '' 
                          })}
                        </div>
                        <span className="theme-desc">{theme.description}</span>
                        <span className="text-[10px] uppercase text-[var(--fg-muted)]">
                          Code Syntax • {theme.syntaxTheme.name}
                        </span>
                        <span className="text-[11px] text-[var(--fg-muted)]">
                          {theme.syntaxTheme.palette}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {projectToDelete && (
            <div
              className="project-delete-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-delete-title"
              onClick={() => setProjectToDelete(null)}
            >
              <div
                className="project-delete-modal-surface"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="project-delete-modal-header">
                  <h2 id="project-delete-title" className="project-delete-title">
                    Delete Project
                  </h2>
                  <button
                    type="button"
                    className="project-delete-close"
                    onClick={() => setProjectToDelete(null)}
                  >
                    CLOSE
                  </button>
                </div>
                <div className="project-delete-modal-body">
                  <div className="project-delete-icon-wrap" aria-hidden="true">
                    <AlertTriangle size={20} />
                  </div>
                  <p className="project-delete-kicker">DESTRUCTIVE_ACTION</p>
                  <p className="project-delete-message">
                    Delete <span>{projectToDelete.name}</span>?
                  </p>
                  <p className="project-delete-warning">This removes the project entry from the selector view.</p>
                  <p className="project-delete-meta">Local IndexedDB content remains available until manually cleared.</p>
                </div>
                <div className="project-delete-actions">
                  <button
                    type="button"
                    className="project-btn-cancel"
                    onClick={() => setProjectToDelete(null)}
                  >
                    ABORT_CMD
                  </button>
                  <button
                    type="button"
                    className="project-btn-submit project-delete-confirm"
                    onClick={handleDeleteConfirm}
                  >
                    PURGE_RECORD
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="project-grid">
            {projects.map(p => (
              <div 
                key={p.id}
                onClick={() => onSelectProject(p)}
                className={`project-card ${activeProjectId === p.id ? 'is-active' : ''}`}
              >
                <div className="project-card-main">
                  <div className="flex justify-between items-start">
                    <div className="project-card-icon">
                      <Box size={24} strokeWidth={1.5} />
                    </div>
                    {(
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setProjectToDelete(p);
                        }}
                        className="p-1.5 text-[var(--fg-muted)] hover:text-[var(--status-error)] transition-colors hover:bg-[var(--bg-inset)]"
                        title="Eject Project"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  
                  <h3 className="project-card-title mt-4">{p.name}</h3>
                  <div className="project-card-meta mt-2">
                    {p.gitConfig.repoUrl ? (
                      <><GitBranch size={12} /> <span>{p.gitConfig.repoUrl.split('/').pop()}</span></>
                    ) : (
                      <div className="flex items-center gap-1 opacity-60">
                        <Zap size={10} />
                        <span>LOCAL_STATION</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="project-card-footer">
                  <div className="flex items-center gap-2">
                    <Clock size={10} />
                    <span>LAST_MOD: {new Date(p.lastOpened).toLocaleDateString()}</span>
                  </div>
                  <ArrowRight size={14} className="opacity-40" />
                </div>
              </div>
            ))}
            
            {projects.length === 0 && !isCreating && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] opacity-40">
                <Box size={48} className="mb-4" />
                <p className="font-mono text-sm uppercase">No_Active_Vaults_Found</p>
                <button onClick={() => setIsCreating(true)} className="mt-4 underline text-xs font-black">CREATE_FIRST_PLATE</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
