import React from 'react';
import { ArrowRight, Box, Clock, GitBranch, Trash2, Zap } from 'lucide-react';
import { Project } from '../../../types';

interface ProjectGridProps {
  projects: Project[];
  activeProjectId: string | null;
  isCreating: boolean;
  onSelectProject: (project: Project) => void;
  onCreateClick: () => void;
  onDeleteClick: (project: Project) => void;
}

const EmptyProjects: React.FC<{ onCreateClick: () => void }> = ({ onCreateClick }) => (
  <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] opacity-40">
    <Box size={48} className="mb-4" />
    <p className="font-mono text-sm uppercase">No_Active_Vaults_Found</p>
    <button onClick={onCreateClick} className="mt-4 underline text-xs font-black">
      CREATE_FIRST_PLATE
    </button>
  </div>
);

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  activeProjectId,
  isCreating,
  onSelectProject,
  onCreateClick,
  onDeleteClick
}) => {
  return (
    <div className="project-grid">
      {projects.map((project) => (
        <div
          key={project.id}
          onClick={() => onSelectProject(project)}
          className={`project-card ${activeProjectId === project.id ? 'is-active' : ''}`}
        >
          <div className="project-card-main">
            <div className="flex justify-between items-start">
              <div className="project-card-icon">
                <Box size={24} strokeWidth={1.5} />
              </div>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteClick(project);
                }}
                className="p-1.5 text-[var(--fg-muted)] hover:text-[var(--status-error)] transition-colors hover:bg-[var(--bg-inset)]"
                title="Eject Project"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <h3 className="project-card-title mt-4">{project.name}</h3>
            <div className="project-card-meta mt-2">
              {project.gitConfig.repoUrl ? (
                <>
                  <GitBranch size={12} /> <span>{project.gitConfig.repoUrl.split('/').pop()}</span>
                </>
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
              <span>LAST_MOD: {new Date(project.lastOpened).toLocaleDateString()}</span>
            </div>
            <ArrowRight size={14} className="opacity-40" />
          </div>
        </div>
      ))}

      {projects.length === 0 && !isCreating && <EmptyProjects onCreateClick={onCreateClick} />}
    </div>
  );
};
