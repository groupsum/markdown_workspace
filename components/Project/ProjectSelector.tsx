
import React, { useState } from 'react';
import { Project, AppTheme } from '../../types';
import { THEMES } from '../../data/themes';
import { Box, Plus, GitBranch, Clock, ArrowRight, Trash2, Search, Zap } from 'lucide-react';

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
  const [showThemeMatrix, setShowThemeMatrix] = useState(false);
  const [themeSearch, setThemeSearch] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreating(false);
    }
  };

  const filteredThemes = THEMES.filter(t => 
    t.name.toLowerCase().includes(themeSearch.toLowerCase()) || 
    t.description.toLowerCase().includes(themeSearch.toLowerCase())
  );

  const currentThemeDef = THEMES.find(t => t.id === currentTheme) || THEMES[0];

  return (
    <main className="project-selector-stage">
      <div className="texture-overlay" aria-hidden="true" />
      <div className="project-selector-chassis">
        <header className="project-selector-top">
          <div className="project-header-info">
            <h1 className="project-title">Lattice_Vault_Registry</h1>
            <p className="project-subtitle">MOUNT_WORKSPACE_OR_INIT_NEW_PLATE</p>
          </div>
          
          <div className="project-actions flex items-center gap-4">
            <div className="theme-selector-container">
              <button 
                onClick={() => setShowThemeMatrix(!showThemeMatrix)}
                className={`theme-toggle-btn ${showThemeMatrix ? 'is-active' : ''}`}
                title={`Current Theme: ${currentThemeDef.name}`}
              >
                {currentThemeDef.icon && React.cloneElement(currentThemeDef.icon as React.ReactElement<any>, { size: 18 })}
              </button>

              {showThemeMatrix && (
                <div className="theme-popover">
                  <div className="theme-popover-header">
                    <Search size={14} className="text-[var(--fg-muted)]"/>
                    <input 
                      autoFocus
                      className="theme-search-input"
                      placeholder="FILTER_THEMES..."
                      value={themeSearch}
                      onChange={(e) => setThemeSearch(e.target.value)}
                    />
                  </div>
                  <div className="theme-grid">
                    {filteredThemes.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => { onThemeChange(theme.id); setShowThemeMatrix(false); }}
                        className={`theme-item ${currentTheme === theme.id ? 'is-active' : ''}`}
                      >
                        <div className="theme-item-top">
                          <span className="theme-name">{theme.name}</span>
                          {theme.icon && React.cloneElement(theme.icon as React.ReactElement<any>, { 
                            size: 14, 
                            className: currentTheme === theme.id ? 'text-[var(--accent)]' : '' 
                          })}
                        </div>
                        <span className="theme-desc">{theme.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
            <div className="p-4 bg-[var(--bg-app)]">
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
                <div className="project-form-actions">
                  <button type="submit" className="project-btn-submit">INITIALIZE_CORE</button>
                  <button type="button" onClick={() => setIsCreating(false)} className="project-btn-cancel">ABORT_CMD</button>
                </div>
              </form>
            </div>
          )}

          <div className="project-grid p-4">
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
                    {projects.length > 1 && (
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if(confirm('CONFIRM_EJECTION: Data remains in IDB but project record will be purged.')) {
                            onDeleteProject(p.id);
                          }
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
