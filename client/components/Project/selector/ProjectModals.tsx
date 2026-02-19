import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { THEMES } from '../../../data/themes';
import { AppTheme, Project } from '../../../types';

interface ProjectModalsProps {
  isCreating: boolean;
  newProjectName: string;
  showThemeModal: boolean;
  projectToDelete: Project | null;
  currentTheme: AppTheme;
  currentThemeDef: (typeof THEMES)[number];
  currentThemeIndex: number;
  setIsCreating: (open: boolean) => void;
  setShowThemeModal: (open: boolean) => void;
  setNewProjectName: (name: string) => void;
  setProjectToDelete: (project: Project | null) => void;
  onCreate: (event: React.FormEvent) => void;
  onThemeSelect: (themeId: AppTheme) => void;
  onDeleteConfirm: () => void;
}

export const ProjectModals: React.FC<ProjectModalsProps> = ({
  isCreating,
  newProjectName,
  showThemeModal,
  projectToDelete,
  currentTheme,
  currentThemeDef,
  currentThemeIndex,
  setIsCreating,
  setShowThemeModal,
  setNewProjectName,
  setProjectToDelete,
  onCreate,
  onThemeSelect,
  onDeleteConfirm
}) => {
  return (
    <>
      {isCreating && (
        <div
          className="project-create-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-create-title"
          onClick={() => setIsCreating(false)}
        >
          <div className="project-create-modal-surface" onClick={(event) => event.stopPropagation()}>
            <div className="project-create-modal-header">
              <h2 id="project-create-title" className="project-create-title">
                Initialize_New_Vault
              </h2>
              <button type="button" className="project-create-close" onClick={() => setIsCreating(false)}>
                CLOSE
              </button>
            </div>

            <form onSubmit={onCreate} className="project-create-form">
              <div className="project-input-group">
                <label className="project-input-label">Project_Identity_Tag</label>
                <input
                  autoFocus
                  className="project-input"
                  placeholder="E.G. NEURAL_INTERFACE_V1"
                  value={newProjectName}
                  onChange={(event) => setNewProjectName(event.target.value)}
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
                <button type="submit" className="project-btn-submit">
                  INITIALIZE_CORE
                </button>
                <button type="button" onClick={() => setIsCreating(false)} className="project-btn-cancel">
                  ABORT_CMD
                </button>
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
          <div className="theme-selector-modal-surface" onClick={(event) => event.stopPropagation()}>
            <div className="theme-selector-modal-header">
              <h2 id="theme-selector-title" className="theme-selector-title">
                Theme_Matrix
              </h2>
              <button type="button" className="theme-selector-close" onClick={() => setShowThemeModal(false)}>
                CLOSE
              </button>
            </div>

            <div className="theme-selector-modal-body">
              <div className="theme-selector-meta">
                <span className="theme-meta-label">PROJECT_TITLE</span>
                <span className="theme-meta-value">{newProjectName.trim() || 'UNTITLED_PROJECT'}</span>
                <span className="theme-meta-count">
                  {currentThemeIndex + 1}/{THEMES.length}
                </span>
              </div>

              <div className="theme-modal-grid">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => onThemeSelect(theme.id)}
                    className={`theme-modal-button ${currentTheme === theme.id ? 'is-active' : ''}`}
                  >
                    <div className="theme-modal-button-top">
                      <span className="theme-name">{theme.name}</span>
                      {theme.icon &&
                        React.cloneElement(theme.icon as React.ReactElement<any>, {
                          size: 18,
                          className: currentTheme === theme.id ? 'text-[var(--accent)]' : ''
                        })}
                    </div>

                    <span className="theme-desc">{theme.description}</span>
                    <span className="text-[10px] uppercase text-[var(--fg-muted)]">
                      Code Syntax • {theme.syntaxTheme.name}
                    </span>
                    <span className="text-[11px] text-[var(--fg-muted)]">{theme.syntaxTheme.palette}</span>
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
          <div className="project-delete-modal-surface" onClick={(event) => event.stopPropagation()}>
            <div className="project-delete-modal-header">
              <h2 id="project-delete-title" className="project-delete-title">
                Delete Project
              </h2>
              <button type="button" className="project-delete-close" onClick={() => setProjectToDelete(null)}>
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
              <p className="project-delete-warning">
                This removes the project entry from the selector view.
              </p>
              <p className="project-delete-meta">
                Local IndexedDB content remains available until manually cleared.
              </p>
            </div>

            <div className="project-delete-actions">
              <button type="button" className="project-btn-cancel" onClick={() => setProjectToDelete(null)}>
                ABORT_CMD
              </button>
              <button type="button" className="project-btn-submit project-delete-confirm" onClick={onDeleteConfirm}>
                PURGE_RECORD
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
