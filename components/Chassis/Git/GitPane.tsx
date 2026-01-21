import React from 'react';
import { FileNode } from '../../../types';
import { GitBranch, RefreshCw, Check, ArrowUpCircle, ArrowDownCircle, XCircle, FileDiff } from 'lucide-react';
import { useGitOperations } from '../../../hooks/useGitOperations';

interface GitPaneProps {
  files: FileNode[];
  activeFile: FileNode | null;
  unsaved: boolean;
  onClose: () => void;
}

export const GitPane: React.FC<GitPaneProps> = ({ files, activeFile, unsaved, onClose }) => {
  const {
    commitMsg,
    setCommitMsg,
    stagedFiles,
    changedFiles,
    stageFile,
    commit
  } = useGitOperations(activeFile, unsaved);

  return (
    <div className="git-workspace">
      <div className="git-sidebar">
        <div className="panel-toolbar git-header">
          <span className="git-header-title">
            <GitBranch size={14} className="git-header-icon"/>
            Source Control
          </span>
          <button onClick={onClose} className="git-close-btn" title="Close"><XCircle size={14}/></button>
        </div>

        <div className="git-body">
          <div className="git-branch-info">
             <div className="git-branch-row">
                <GitBranch size={14} />
                <span className="git-branch-name">main</span>
             </div>
             <div className="git-branch-stats">
                <span className="git-stat-item"><ArrowDownCircle size={12}/> 0</span>
                <span className="git-stat-item"><ArrowUpCircle size={12}/> 0</span>
             </div>
          </div>

          <div className="git-section">
            <h3 className="git-section-title">
              Staged Changes <span>{stagedFiles.length}</span>
            </h3>
            {stagedFiles.length === 0 && (
               <div className="git-empty-msg">No staged changes</div>
            )}
          </div>

          <div className="git-section">
            <h3 className="git-section-title">
              Changes <span>{changedFiles.length}</span>
            </h3>
            {changedFiles.length > 0 ? (
               <div className="git-list">
                 {changedFiles.map(f => (
                   <div key={f.id} className="git-item">
                      <FileDiff size={14} className="git-item__icon" />
                      <span className="git-item__name">{f.name}</span>
                      <span className="git-item__status">M</span>
                      <button onClick={() => stageFile(f.id)} className="git-stage-btn" title="Stage File">
                        <Check size={12} />
                      </button>
                   </div>
                 ))}
               </div>
            ) : (
               <div className="git-empty-msg">Working tree clean</div>
            )}
          </div>

          <div className="git-commit-area">
            <textarea 
              className="git-commit-input"
              placeholder="Commit message..."
              value={commitMsg}
              onChange={(e) => setCommitMsg(e.target.value)}
            />
            <button 
              className="git-commit-btn"
              disabled={changedFiles.length === 0 && stagedFiles.length === 0}
              onClick={commit}
            >
              <Check size={14} /> COMMIT
            </button>
          </div>
          
          <div className="git-sync-area">
             <button className="git-sync-btn">
                <RefreshCw size={14} /> SYNC CHANGES
             </button>
          </div>
        </div>
      </div>

      <div className="git-diff-view">
        <div className="panel-toolbar git-diff-header">
           <span className="git-diff-title">
             {activeFile ? `DIFF: ${activeFile.name}` : 'NO SELECTION'}
           </span>
           <div className="git-diff-legend">
              <div className="git-diff-legend-item"><div className="git-legend-icon-del"></div> REMOVED</div>
              <div className="git-diff-legend-item"><div className="git-legend-icon-add"></div> ADDED</div>
           </div>
        </div>

        <div className="git-diff-content">
          {activeFile ? (
            <div className="git-diff-container">
               <div className="git-diff-gutter">
                  <div>1</div><div>2</div><div>3</div>
               </div>
               <div className="git-diff-code">
                  <div className="git-diff-meta"># {activeFile.name}</div>
                  <div className="diff-removed">
                    <span className="git-diff-marker">-</span> Old line content
                  </div>
                  <div className="diff-added">
                     <span className="git-diff-marker">+</span> {activeFile.content?.split('\n')[0] || 'New content...'}
                  </div>
               </div>
            </div>
          ) : (
            <div className="git-diff-placeholder">
               SELECT A FILE TO VIEW DIFF
            </div>
          )}
        </div>
      </div>
    </div>
  );
};