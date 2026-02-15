import React, { useMemo, useState } from 'react';
import { AppTheme, FileNode } from '../../../types';
import { GitBranch, RefreshCw, Check, ArrowUpCircle, ArrowDownCircle, FileDiff, Columns, Eye, LayoutGrid, FileText, ChevronDown, ChevronRight, Undo2, GitPullRequest, ArrowDownToLine, ArrowUpToLine } from 'lucide-react';
import { useGitOperations } from '../../../hooks/useGitOperations';
import { PreviewPane } from '../WorkPane/Stage/Preview';

interface GitPaneProps {
  files: FileNode[];
  activeFile: FileNode | null;
  theme: AppTheme;
  unsaved: boolean;
}

export const GitPane: React.FC<GitPaneProps> = ({ files, activeFile, theme, unsaved }) => {
  const {
    branchInput,
    branches,
    commitMsg,
    currentBranch,
    changedFiles,
    checkoutBranch,
    commit,
    fetchRemote,
    latestCommit,
    pullRemote,
    pullRequestTitle,
    pullRequests,
    pushRemote,
    setBranchInput,
    setCommitMsg,
    setCurrentBranch,
    setPullRequestTitle,
    stageFile,
    stagedFiles,
    syncCounts,
    undoCommit,
    unstageFile,
    createPullRequest
  } = useGitOperations(activeFile, unsaved);
  const [diffMode, setDiffMode] = useState<'unified' | 'split' | 'unified-preview' | 'split-preview'>('unified');
  const [showSourceControl, setShowSourceControl] = useState(true);
  const [showStaged, setShowStaged] = useState(true);
  const [showChanges, setShowChanges] = useState(true);

  const diffModes = [
    { id: 'unified', label: 'Unified diff viewer', icon: <FileText size={14} /> },
    { id: 'split', label: 'Split diff viewer', icon: <Columns size={14} /> },
    { id: 'unified-preview', label: 'Unified diff with preview', icon: <Eye size={14} /> },
    { id: 'split-preview', label: 'Split preview diff', icon: <LayoutGrid size={14} /> }
  ] as const;

  const diffPreview = useMemo(() => {
    const defaultLines = [
      'const status = "updated";',
      'export const version = "2.0.1";',
      'console.log("Previewing changes");',
      'export default status;'
    ];
    const baseLines = activeFile?.content?.split('\n').filter(Boolean).slice(0, 4);
    const newLines = baseLines && baseLines.length > 0 ? baseLines : defaultLines;
    const oldLines = newLines.map((line) =>
      line
        .replace(/updated/gi, 'legacy')
        .replace(/Previewing/gi, 'Inspecting')
        .replace(/2\.0\.1/gi, '1.9.8')
    );
    return { newLines, oldLines };
  }, [activeFile]);

  const markdownPreview = useMemo(() => {
    const fallback = `# Preview Changes

## Summary
- Updates aligned with the latest revision.
- Review the changes in the diff viewer.

\`\`\`ts
export const status = "updated";
\`\`\`
`;
    const newContent = activeFile?.content?.trim() ? activeFile.content : fallback;
    const oldContent = newContent
      .replace(/updated/gi, 'legacy')
      .replace(/Preview Changes/gi, 'Previous State')
      .replace(/latest revision/gi, 'prior revision')
      .replace(/status/gi, 'state');
    return { newContent, oldContent };
  }, [activeFile]);

  return (
    <div className="git-workspace">
      <div className="git-sidebar">
        <div className="panel-toolbar git-header">
          <span className="git-header-title">
            <GitBranch size={14} className="git-header-icon"/>
            Source Control
          </span>
          <button
            type="button"
            className="git-icon-btn"
            title={showSourceControl ? 'Collapse Source Control' : 'Expand Source Control'}
            aria-label={showSourceControl ? 'Collapse Source Control' : 'Expand Source Control'}
            onClick={() => setShowSourceControl((prev) => !prev)}
          >
            {showSourceControl ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        <div className={`git-body ${showSourceControl ? '' : 'is-collapsed'}`}>
          <div className="git-branch-info">
             <div className="git-branch-row">
                <GitBranch size={14} />
                <span className="git-branch-name">{currentBranch}</span>
             </div>
             <div className="git-branch-stats">
                <span className="git-stat-item"><ArrowDownCircle size={12}/> {syncCounts.behind}</span>
                <span className="git-stat-item"><ArrowUpCircle size={12}/> {syncCounts.ahead}</span>
             </div>
             <div className="git-branch-select-row">
                <select
                  className="git-commit-input"
                  value={currentBranch}
                  aria-label="Current branch"
                  onChange={(event) => setCurrentBranch(event.target.value)}
                >
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
                <input
                  className="git-commit-input"
                  value={branchInput}
                  placeholder="new-branch"
                  onChange={(event) => setBranchInput(event.target.value)}
                />
                <button className="git-stage-btn" onClick={() => checkoutBranch(branchInput || currentBranch)} title="Checkout branch">
                  CHECKOUT
                </button>
              </div>
          </div>

          <div className="git-section">
            <button type="button" className="git-section-title" onClick={() => setShowStaged((prev) => !prev)}>
              <span className="git-section-title-text">
                {showStaged ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                Staged Changes
              </span>
              <span>{stagedFiles.length}</span>
            </button>
            {showStaged && stagedFiles.length === 0 && <div className="git-empty-msg">No staged changes</div>}
            {showStaged && stagedFiles.length > 0 && (
              <div className="git-list">
                {stagedFiles.map((fileId) => {
                  const file = files.find((candidate) => candidate.id === fileId);
                  return (
                    <div key={fileId} className="git-item">
                      <FileDiff size={14} className="git-item__icon" />
                      <span className="git-item__name">{file?.name || fileId}</span>
                      <span className="git-item__status">A</span>
                      <button onClick={() => unstageFile(fileId)} className="git-stage-btn" title="Unstage File">
                        UNSTAGE
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="git-section">
            <button type="button" className="git-section-title" onClick={() => setShowChanges((prev) => !prev)}>
              <span className="git-section-title-text">
                {showChanges ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                Changes
              </span>
              <span>{changedFiles.length}</span>
            </button>
            {showChanges && changedFiles.length > 0 ? (
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
            ) : showChanges ? (
               <div className="git-empty-msg">Working tree clean</div>
            ) : null}
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
            <button
              className="git-commit-btn"
              disabled={!latestCommit}
              onClick={undoCommit}
            >
              <Undo2 size={14} /> UNDO COMMIT
            </button>
          </div>
          
          <div className="git-sync-area">
             <button className="git-sync-btn" onClick={fetchRemote}>
                <ArrowDownToLine size={14} /> FETCH
             </button>
             <button className="git-sync-btn" onClick={pullRemote}>
                <RefreshCw size={14} /> PULL
             </button>
             <button className="git-sync-btn" onClick={pushRemote}>
                <ArrowUpToLine size={14} /> PUSH
             </button>
          </div>

          <div className="git-commit-area">
            <input
              className="git-commit-input"
              placeholder="Pull request title"
              value={pullRequestTitle}
              onChange={(event) => setPullRequestTitle(event.target.value)}
            />
            <button
              className="git-commit-btn"
              onClick={() => createPullRequest('main')}
              disabled={!pullRequestTitle.trim() || currentBranch === 'main'}
            >
              <GitPullRequest size={14} /> OPEN PR
            </button>
            <div className="git-empty-msg">PRs open: {pullRequests.length}</div>
          </div>
        </div>
      </div>

      <div className="git-diff-view">
        <div className="panel-toolbar git-diff-header">
          <span className="git-diff-title">
            {activeFile ? `DIFF: ${activeFile.name}` : 'NO SELECTION'}
          </span>
          <div className="git-diff-actions">
            <div className="git-diff-legend">
              <div className="git-diff-legend-item"><div className="git-legend-icon-del"></div> REMOVED</div>
              <div className="git-diff-legend-item"><div className="git-legend-icon-add"></div> ADDED</div>
            </div>
            <div className="git-diff-toolbar" aria-label="Diff viewer modes">
              {diffModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={`git-icon-btn git-view-toggle ${diffMode === mode.id ? 'is-active' : ''}`}
                  aria-label={mode.label}
                  title={mode.label}
                  onClick={() => setDiffMode(mode.id)}
                >
                  {mode.icon}
                </button>
              ))}
            </div>
            <div className="git-diff-toolbar git-diff-ops" aria-label="Diff operations">
              <button
                type="button"
                className="git-icon-btn"
                aria-label="Stage active file"
                title="Stage active file"
                onClick={() => activeFile && stageFile(activeFile.id)}
              >
                <Check size={14} />
              </button>
              <button
                type="button"
                className="git-icon-btn"
                aria-label="Refresh diff"
                title="Refresh diff"
                onClick={() => undefined}
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="git-diff-content">
          {activeFile ? (
            <div className={`git-diff-stage mode-${diffMode}`}>
              {diffMode === 'unified' && (
                <div className="git-diff-panel">
                  <div className="git-diff-panel__header">UNIFIED VIEW</div>
                  <div className="git-diff-panel__content">
                    <div className="git-diff-meta"># {activeFile.name}</div>
                    <div className="git-diff-row diff-removed">
                      <span className="git-diff-marker">-</span>
                      {diffPreview.oldLines[0] || 'Old line content'}
                    </div>
                    <div className="git-diff-row diff-added">
                      <span className="git-diff-marker">+</span>
                      {diffPreview.newLines[0] || 'New content...'}
                    </div>
                    {(diffPreview.newLines[1] || diffPreview.oldLines[1]) && (
                      <div className="git-diff-row diff-context">
                        {diffPreview.newLines[1] || diffPreview.oldLines[1]}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {diffMode === 'split' && (
                <div className="git-diff-grid">
                  <div className="git-diff-panel">
                    <div className="git-diff-panel__header">OLD FILE</div>
                    <div className="git-diff-panel__content">
                      {diffPreview.oldLines.map((line, index) => (
                        <div key={`old-${index}`} className="git-diff-line git-diff-line--removed">
                          <span className="git-line-num">{index + 1}</span>
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="git-diff-panel">
                    <div className="git-diff-panel__header">NEW FILE</div>
                    <div className="git-diff-panel__content">
                      {diffPreview.newLines.map((line, index) => (
                        <div key={`new-${index}`} className="git-diff-line git-diff-line--added">
                          <span className="git-line-num">{index + 1}</span>
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {diffMode === 'unified-preview' && (
                <div className="git-diff-grid">
                  <div className="git-diff-panel">
                    <div className="git-diff-panel__header">UNIFIED DIFF</div>
                    <div className="git-diff-panel__content">
                      <div className="git-diff-meta"># {activeFile.name}</div>
                      <div className="git-diff-row diff-removed">
                        <span className="git-diff-marker">-</span>
                        {diffPreview.oldLines[0] || 'Old line content'}
                      </div>
                      <div className="git-diff-row diff-added">
                        <span className="git-diff-marker">+</span>
                        {diffPreview.newLines[0] || 'New content...'}
                      </div>
                      {(diffPreview.newLines[1] || diffPreview.oldLines[1]) && (
                        <div className="git-diff-row diff-context">
                          {diffPreview.newLines[1] || diffPreview.oldLines[1]}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="git-diff-panel git-diff-panel--preview">
                    <div className="git-diff-panel__header">UPDATED PREVIEW</div>
                    <div className="git-diff-panel__content git-preview-pane">
                      <PreviewPane content={markdownPreview.newContent} theme={theme} files={files} onNavigate={() => undefined} />
                    </div>
                  </div>
                </div>
              )}

              {diffMode === 'split-preview' && (
                <div className="git-diff-grid">
                  <div className="git-diff-panel git-diff-panel--preview">
                    <div className="git-diff-panel__header">UPDATED (LEFT)</div>
                    <div className="git-diff-panel__content git-preview-pane">
                      <PreviewPane content={markdownPreview.newContent} theme={theme} files={files} onNavigate={() => undefined} />
                    </div>
                  </div>
                  <div className="git-diff-panel git-diff-panel--preview">
                    <div className="git-diff-panel__header">OLD FILE (RIGHT)</div>
                    <div className="git-diff-panel__content git-preview-pane">
                      <PreviewPane content={markdownPreview.oldContent} theme={theme} files={files} onNavigate={() => undefined} />
                    </div>
                  </div>
                </div>
              )}
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
