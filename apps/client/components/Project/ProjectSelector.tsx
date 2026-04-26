
import React, { useState } from 'react';
import { Project, AppTheme } from '../../types';
import { THEMES } from '../../data/themes';
import { Box, Plus, GitBranch, Clock, ArrowRight, Trash2, Zap, AlertTriangle } from 'lucide-react';
import { LanguageSelector } from '../../src/features/i18n/LanguageSelector';
import { useClientI18n } from '../../src/features/i18n/useClientI18n';

interface ProjectSelectorProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (project: Project) => void;
  onCreateProject: (name: string) => void;
  onCreateDesktopProject?: (name: string) => void;
  onDeleteProject: (id: string) => void;
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  showDesktopOpen?: boolean;
  onOpenDesktopFile?: () => void;
  onOpenDesktopProject?: () => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onCreateDesktopProject,
  onDeleteProject,
  currentTheme,
  onThemeChange,
  showDesktopOpen = false,
  onOpenDesktopFile,
  onOpenDesktopProject
}) => {
  const { t } = useClientI18n();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      if (showDesktopOpen && onCreateDesktopProject) {
        onCreateDesktopProject(newProjectName.trim());
      } else {
        onCreateProject(newProjectName.trim());
      }
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
            <p className="project-subtitle">{t('core.project-selector.subtitle', 'MOUNT_WORKSPACE_OR_INIT_NEW_PLATE')}</p>
          </div>
          
          <div className="project-actions settings-inline-row settings-inline-row--lg">
            <div className="theme-selector-container">
              <button 
                onClick={() => setShowThemeModal(true)}
                className="theme-toggle-btn"
                title={t('core.project-selector.theme.title', 'Project Theme')}
              >
                {currentThemeDef.icon && React.cloneElement(currentThemeDef.icon as React.ReactElement<any>, { size: 18 })}
              </button>
            </div>

            <LanguageSelector compact />

            <button 
              onClick={() => setIsCreating(true)}
              className="project-btn-new"
            >
              <Plus size={14} /> {t('core.project-selector.new-vault', 'NEW_VAULT')}
            </button>
            {showDesktopOpen && onOpenDesktopFile ? (
              <button
                type="button"
                onClick={onOpenDesktopFile}
                className="project-btn-new"
              >
                <ArrowRight size={14} /> {t('core.project-selector.open-markdown', 'OPEN_MARKDOWN')}
              </button>
            ) : null}
            {showDesktopOpen && onOpenDesktopProject ? (
              <button
                type="button"
                onClick={onOpenDesktopProject}
                className="project-btn-new"
              >
                <Box size={14} /> {t('core.project-selector.open-folder', 'OPEN_FOLDER')}
              </button>
            ) : null}
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
                    {t('core.project-selector.create.title', 'Initialize_New_Vault')}
                  </h2>
                  <button
                    type="button"
                    className="project-create-close"
                    onClick={() => setIsCreating(false)}
                  >
                    {t('core.common.close', 'CLOSE')}
                  </button>
                </div>
                <form onSubmit={handleCreate} className="project-create-form">
                  <div className="project-input-group">
                    <label className="project-input-label">{t('core.project-selector.create.identity-tag', 'Project_Identity_Tag')}</label>
                    <input
                      autoFocus
                      className="project-input"
                      placeholder={t('core.project-selector.create.placeholder', 'E.G. NEURAL_INTERFACE_V1')}
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                    />
                  </div>
                  <div className="project-input-group">
                    <label className="project-input-label">{t('core.project-selector.create.assigned-skin', 'Assigned_Skin')}</label>
                    <button
                      type="button"
                      onClick={() => setShowThemeModal(true)}
                      className="project-theme-trigger"
                    >
                      <span className="project-theme-trigger-label">{currentThemeDef.name}</span>
                      <span className="project-theme-trigger-meta">{t('core.project-selector.theme.open-prefix', 'OPEN_')}{t('core.project-selector.theme.matrix', 'THEME_MATRIX')}</span>
                    </button>
                  </div>
                  {showDesktopOpen ? (
                    <p className="project-create-note">
                      {t('core.project-selector.create.desktop-note', 'DESKTOP PROJECTS ARE CREATED AS REAL FOLDERS ON YOUR DESKTOP AND SYNCED INTO THE WORKSPACE.')}
                    </p>
                  ) : null}
                  <div className="project-form-actions">
                    <button type="submit" className="project-btn-submit">
                      {showDesktopOpen ? t('core.project-selector.create.desktop-submit', 'CREATE_DESKTOP_CORE') : t('core.project-selector.create.submit', 'INITIALIZE_CORE')}
                    </button>
                    <button type="button" onClick={() => setIsCreating(false)} className="project-btn-cancel">{t('core.project-selector.abort', 'ABORT_CMD')}</button>
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
                    {t('core.project-selector.theme.matrix-title', 'Theme_Matrix')}
                  </h2>
                  <button
                    type="button"
                    className="theme-selector-close"
                    onClick={() => setShowThemeModal(false)}
                  >
                    {t('core.common.close', 'CLOSE')}
                  </button>
                </div>
                <div className="theme-selector-modal-body">
                  <div className="theme-selector-meta">
                    <span className="theme-meta-label">{t('core.project-selector.theme.project-title', 'PROJECT_TITLE')}</span>
                    <span className="theme-meta-value">{newProjectName.trim() || t('core.project-selector.theme.untitled-project', 'UNTITLED_PROJECT')}</span>
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
                            className: currentTheme === theme.id ? 'settings-accent-text' : '' 
                          })}
                        </div>
                        <span className="theme-desc">{theme.description}</span>
                        <span className="settings-kicker">
                          {t('core.project-selector.theme.code-syntax', 'Code Syntax')} • {theme.syntaxTheme.name}
                        </span>
                        <span className="settings-muted-caption">
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
                    {t('core.project-selector.delete.title', 'Delete Project')}
                  </h2>
                  <button
                    type="button"
                    className="project-delete-close"
                    onClick={() => setProjectToDelete(null)}
                  >
                    {t('core.common.close', 'CLOSE')}
                  </button>
                </div>
                <div className="project-delete-modal-body">
                  <div className="project-delete-icon-wrap" aria-hidden="true">
                    <AlertTriangle size={20} />
                  </div>
                  <p className="project-delete-kicker">{t('core.project-selector.delete.kicker', 'DESTRUCTIVE_ACTION')}</p>
                  <p className="project-delete-message">
                    {t('core.project-selector.delete.prefix', 'Delete')} <span>{projectToDelete.name}</span>{t('core.project-selector.delete.suffix', '?')}
                  </p>
                  <p className="project-delete-warning">{t('core.project-selector.delete.warning', 'This removes the project entry from the selector view.')}</p>
                  <p className="project-delete-meta">{t('core.project-selector.delete.meta', 'Local IndexedDB content remains available until manually cleared.')}</p>
                </div>
                <div className="project-delete-actions">
                  <button
                    type="button"
                    className="project-btn-cancel"
                    onClick={() => setProjectToDelete(null)}
                  >
                    {t('core.project-selector.abort', 'ABORT_CMD')}
                  </button>
                  <button
                    type="button"
                    className="project-btn-submit project-delete-confirm"
                    onClick={handleDeleteConfirm}
                  >
                    {t('core.project-selector.delete.confirm', 'PURGE_RECORD')}
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
                  <div className="settings-row settings-row--top">
                    <div className="project-card-icon">
                      <Box size={24} strokeWidth={1.5} />
                    </div>
                    {(
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setProjectToDelete(p);
                        }}
                        className="project-icon-action project-icon-action--danger"
                        title={t('core.project-selector.eject', 'Eject Project')}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  
                  <h3 className="project-card-title project-card-title--spaced">{p.name}</h3>
                  <div className="project-card-meta project-card-meta--spaced">
                    {p.sourceKind === 'filesystem' && p.rootPath ? (
                      <div className="settings-inline-row settings-inline-row--xs settings-muted-strong">
                        <Box size={10} />
                        <span>{p.rootPath}</span>
                      </div>
                    ) : p.gitConfig.repoUrl ? (
                      <><GitBranch size={12} /> <span>{p.gitConfig.repoUrl.split('/').pop()}</span></>
                    ) : (
                      <div className="settings-inline-row settings-inline-row--xs settings-muted-soft">
                        <Zap size={10} />
                        <span>{t('core.project-selector.local-station', 'LOCAL_STATION')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="project-card-footer">
                  <div className="settings-inline-row settings-inline-row--sm">
                    <Clock size={10} />
                    <span>{t('core.project-selector.last-modified', 'LAST_MOD')}: {new Date(p.lastOpened).toLocaleDateString()}</span>
                  </div>
                  <ArrowRight size={14} className="opacity-40" />
                </div>
              </div>
            ))}
            
            {projects.length === 0 && !isCreating && (
              <div className="project-empty-dropzone">
                <Box size={48} className="mb-4" />
                <p className="settings-mono-kicker">{t('core.project-selector.empty', 'No_Active_Vaults_Found')}</p>
                <button onClick={() => setIsCreating(true)} className="mt-4 underline text-xs font-black">{t('core.project-selector.create-first', 'CREATE_FIRST_PLATE')}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
