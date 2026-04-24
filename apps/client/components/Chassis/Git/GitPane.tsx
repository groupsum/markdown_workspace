import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppTheme, FileNode } from '../../../types';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Check,
  Columns,
  Eye,
  FileDiff,
  FileText,
  GitBranch,
  LayoutGrid,
  RefreshCw,
  Sidebar,
  SidebarOpen,
  XCircle,
} from 'lucide-react';
import { useGitOperations } from '../../../hooks/useGitOperations';
import { PreviewPane } from '../WorkPane/Stage/Preview';

interface GitPaneProps {
  files: FileNode[];
  activeFile: FileNode | null;
  theme: AppTheme;
  unsaved: boolean;
  onClose: () => void;
  shellSidebarOpen?: boolean;
  onShellSidebarToggle?: (open: boolean) => void;
}

type GitOperationsState = ReturnType<typeof useGitOperations>;
type DiffMode = 'unified' | 'split' | 'unified-preview' | 'split-preview';

const getSplitBand = (value: number): number => {
  const clamped = Math.min(80, Math.max(20, value));
  return Math.round(clamped / 5) * 5;
};

function useWorkspaceModuleSplit(defaultPosition = 50) {
  const [splitPos, setSplitPos] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      setSplitPos(getSplitBand(((event.clientX - rect.left) / rect.width) * 100));
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.classList.add('is-resizing-sidebar');
    } else {
      document.body.classList.remove('is-resizing-sidebar');
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('is-resizing-sidebar');
    };
  }, [isDragging]);

  return {
    splitBand: getSplitBand(splitPos),
    isDragging,
    splitContainerRef,
    startSplitDrag: () => setIsDragging(true),
  };
}

const diffModes = [
  { id: 'unified', label: 'Unified diff viewer', icon: <FileText size={14} /> },
  { id: 'split', label: 'Split diff viewer', icon: <Columns size={14} /> },
  { id: 'unified-preview', label: 'Unified diff with preview', icon: <Eye size={14} /> },
  { id: 'split-preview', label: 'Split preview diff', icon: <LayoutGrid size={14} /> },
] as const;

const GitOperationsExplorerContent: React.FC<GitOperationsState> = ({
  commitMsg,
  setCommitMsg,
  stagedFiles,
  changedFiles,
  stageFile,
  commit,
}) => (
  <>
    <div className="workspace-panel-header git-header">
      <div className="workspace-panel-title">
        <GitBranch size={14} className="git-header-icon shrink-0" />
        <div className="workspace-panel-title-text">
          <span className="workspace-panel-kicker">Repository</span>
          <span className="workspace-panel-name">Source Control</span>
        </div>
      </div>
    </div>

    <div className="workspace-panel-content git-source-control-browser">
      <div className="git-body">
      <div className="git-branch-info">
        <div className="git-branch-row">
          <GitBranch size={14} />
          <span className="git-branch-name">main</span>
        </div>
        <div className="git-branch-stats">
          <span className="git-stat-item"><ArrowDownCircle size={12} /> 0</span>
          <span className="git-stat-item"><ArrowUpCircle size={12} /> 0</span>
        </div>
      </div>

      <div className="git-section">
        <h3 className="git-section-title">
          Staged Changes <span>{stagedFiles.length}</span>
        </h3>
        {stagedFiles.length === 0 && <div className="git-empty-msg">No staged changes</div>}
      </div>

      <div className="git-section">
        <h3 className="git-section-title">
          Changes <span>{changedFiles.length}</span>
        </h3>
        {changedFiles.length > 0 ? (
          <div className="git-list">
            {changedFiles.map((file) => (
              <div key={file.id} className="git-item">
                <FileDiff size={14} className="git-item__icon" />
                <span className="git-item__name">{file.name}</span>
                <span className="git-item__status">M</span>
                <button onClick={() => stageFile(file.id)} className="git-stage-btn" title="Stage File">
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
          onChange={(event) => setCommitMsg(event.target.value)}
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
  </>
);

export const GitOperationsExplorer: React.FC<Pick<GitPaneProps, 'activeFile' | 'unsaved'>> = ({
  activeFile,
  unsaved,
}) => {
  const gitOperations = useGitOperations(activeFile, unsaved);
  return <GitOperationsExplorerContent {...gitOperations} />;
};

export const GitPane: React.FC<GitPaneProps> = ({
  files,
  activeFile,
  theme,
  unsaved,
  onClose,
  shellSidebarOpen,
  onShellSidebarToggle,
}) => {
  const gitOperations = useGitOperations(activeFile, unsaved);
  const { changedFiles, stageFile } = gitOperations;
  const [diffMode, setDiffMode] = useState<DiffMode>('unified');
  const { splitBand, isDragging, splitContainerRef, startSplitDrag } = useWorkspaceModuleSplit();
  const effectiveSidebarOpen = shellSidebarOpen ?? true;

  const diffPreview = useMemo(() => {
    const defaultLines = [
      'const status = "updated";',
      'export const version = "2.0.1";',
      'console.log("Previewing changes");',
      'export default status;',
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

  const renderResizableDiff = (
    left: React.ReactNode,
    right: React.ReactNode,
    ariaLabel: string,
  ) => (
    <div ref={splitContainerRef} className="editor-pane-body is-split" style={{ background: 'transparent' }}>
      <div className={`editor-pane-column editor-pane-column--split-left-${splitBand}`} style={{ display: 'grid', paddingRight: 8 }}>
        {left}
      </div>
      <div onMouseDown={startSplitDrag} className={`editor-splitter ${isDragging ? 'dragging' : ''}`} role="separator" aria-orientation="vertical" aria-label={ariaLabel}>
        <div className="editor-splitter-handle" />
      </div>
      <div className={`editor-pane-column editor-pane-column--split-right-${100 - splitBand}`} style={{ display: 'grid', paddingLeft: 8 }}>
        {right}
      </div>
    </div>
  );

  const oldFilePanel = (
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
  );

  const newFilePanel = (
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
  );

  const unifiedPanel = (
    <div className="git-diff-panel">
      <div className="git-diff-panel__header">UNIFIED DIFF</div>
      <div className="git-diff-panel__content">
        <div className="git-diff-meta"># {activeFile?.name ?? 'No file selected'}</div>
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
  );

  const updatedPreviewPanel = (
    <div className="git-diff-panel git-diff-panel--preview">
      <div className="git-diff-panel__header">UPDATED PREVIEW</div>
      <div className="git-diff-panel__content git-preview-pane">
        <PreviewPane content={markdownPreview.newContent} theme={theme} files={files} onNavigate={() => undefined} />
      </div>
    </div>
  );

  const previousPreviewPanel = (
    <div className="git-diff-panel git-diff-panel--preview">
      <div className="git-diff-panel__header">OLD FILE PREVIEW</div>
      <div className="git-diff-panel__content git-preview-pane">
        <PreviewPane content={markdownPreview.oldContent} theme={theme} files={files} onNavigate={() => undefined} />
      </div>
    </div>
  );

  const renderDiffStage = () => {
    if (!activeFile) {
      return <div className="git-diff-placeholder">SELECT A FILE TO VIEW DIFF</div>;
    }

    if (diffMode === 'unified') {
      return <div className="git-diff-stage mode-unified">{unifiedPanel}</div>;
    }
    if (diffMode === 'split') {
      return <div className="git-diff-stage mode-split">{renderResizableDiff(oldFilePanel, newFilePanel, 'Resize Git diff panes')}</div>;
    }
    if (diffMode === 'unified-preview') {
      return <div className="git-diff-stage mode-unified-preview">{renderResizableDiff(unifiedPanel, updatedPreviewPanel, 'Resize Git preview panes')}</div>;
    }
    return <div className="git-diff-stage mode-split-preview">{renderResizableDiff(updatedPreviewPanel, previousPreviewPanel, 'Resize Git preview panes')}</div>;
  };

  return (
    <div className="git-ops-pane editor-pane-container" role="region" aria-label="Git Operations">
      {isDragging && <div className="editor-splitter-drag-shield" />}
      <div className="view-toolbar" aria-label="Git Operations toolbar">
        <div className="view-toolbar-group">
          <button
            type="button"
            className={`view-toolbar-btn ${effectiveSidebarOpen ? 'active' : ''}`}
            title="Toggle source-control panel"
            onClick={() => onShellSidebarToggle?.(!effectiveSidebarOpen)}
          >
            {effectiveSidebarOpen ? <SidebarOpen size={14} /> : <Sidebar size={14} />}
          </button>
          <span className="view-toolbar-divider" />
          {diffModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`view-toolbar-btn ${diffMode === mode.id ? 'active' : ''}`}
              aria-label={mode.label}
              title={mode.label}
              onClick={() => setDiffMode(mode.id)}
            >
              {mode.icon}
            </button>
          ))}
        </div>
        <div className="view-toolbar-group">
          <span className="view-toolbar-divider" />
          <button
            type="button"
            className="view-toolbar-btn"
            aria-label="Stage active file"
            title="Stage active file"
            onClick={() => activeFile && stageFile(activeFile.id)}
            disabled={!activeFile || changedFiles.length === 0}
          >
            <Check size={14} />
          </button>
          <button type="button" className="view-toolbar-btn" aria-label="Refresh diff" title="Refresh diff">
            <RefreshCw size={14} />
          </button>
        </div>
        <div className="view-toolbar-group" style={{ justifyContent: 'flex-end' }}>
          <span className="view-toolbar-divider" />
          <button type="button" className="view-toolbar-btn" title="Close Git Operations" onClick={onClose}>
            <XCircle size={14} />
          </button>
        </div>
      </div>

      <div className="editor-pane-shell">
        <div className="git-workspace">
          <div className="git-diff-view">
            <div className="panel-toolbar git-diff-header">
              <span className="git-diff-title">
                {activeFile ? `DIFF: ${activeFile.name}` : 'NO SELECTION'}
              </span>
              <div className="git-diff-actions">
                <div className="git-diff-legend">
                  <div className="git-diff-legend-item"><div className="git-legend-icon-del" /> REMOVED</div>
                  <div className="git-diff-legend-item"><div className="git-legend-icon-add" /> ADDED</div>
                </div>
              </div>
            </div>

            <div className="git-diff-content">
              {renderDiffStage()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
