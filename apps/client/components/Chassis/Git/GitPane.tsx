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
  formatLabel?: GitLabelFormatter;
}

type GitOperationsState = ReturnType<typeof useGitOperations>;
type GitLabelFormatter = (key: string, defaultMessage: string) => string;
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
      document.body.classList.add('is-resizing-pane');
    } else {
      document.body.classList.remove('is-resizing-pane');
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('is-resizing-pane');
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
  { id: 'unified', labelKey: 'core.git.diff-mode.unified', defaultLabel: 'Unified diff viewer', icon: <FileText size={14} /> },
  { id: 'split', labelKey: 'core.git.diff-mode.split', defaultLabel: 'Split diff viewer', icon: <Columns size={14} /> },
  { id: 'unified-preview', labelKey: 'core.git.diff-mode.unified-preview', defaultLabel: 'Unified diff with preview', icon: <Eye size={14} /> },
  { id: 'split-preview', labelKey: 'core.git.diff-mode.split-preview', defaultLabel: 'Split preview diff', icon: <LayoutGrid size={14} /> },
] as const;

const fallbackGitLabelFormatter: GitLabelFormatter = (_key, defaultMessage) => defaultMessage;

const GitOperationsExplorerContent: React.FC<GitOperationsState & { formatLabel?: GitLabelFormatter }> = ({
  commitMsg,
  setCommitMsg,
  stagedFiles,
  changedFiles,
  stageFile,
  commit,
  formatLabel,
}) => {
  const t = formatLabel ?? fallbackGitLabelFormatter;
  return <>
    <div className="workspace-panel-header git-header">
      <div className="workspace-panel-title">
        <GitBranch size={14} className="git-header-icon shrink-0" />
        <div className="workspace-panel-title-text">
          <span className="workspace-panel-kicker">{t('core.git.repository', 'Repository')}</span>
          <span className="workspace-panel-name">{t('core.git.source-control', 'Source Control')}</span>
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
          {t('core.git.staged-changes', 'Staged Changes')} <span>{stagedFiles.length}</span>
        </h3>
        {stagedFiles.length === 0 && <div className="git-empty-msg">{t('core.git.no-staged-changes', 'No staged changes')}</div>}
      </div>

      <div className="git-section">
        <h3 className="git-section-title">
          {t('core.git.changes', 'Changes')} <span>{changedFiles.length}</span>
        </h3>
        {changedFiles.length > 0 ? (
          <div className="git-list">
            {changedFiles.map((file) => (
              <div key={file.id} className="git-item">
                <FileDiff size={14} className="git-item__icon" />
                <span className="git-item__name">{file.name}</span>
                <span className="git-item__status">M</span>
                <button onClick={() => stageFile(file.id)} className="git-stage-btn" title={t('core.git.stage-file', 'Stage File')}>
                  <Check size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="git-empty-msg">{t('core.git.working-tree-clean', 'Working tree clean')}</div>
        )}
      </div>

      <div className="git-commit-area">
        <textarea
          className="git-commit-input"
          placeholder={t('core.git.commit-placeholder', 'Commit message...')}
          value={commitMsg}
          onChange={(event) => setCommitMsg(event.target.value)}
        />
        <button
          className="git-commit-btn"
          disabled={changedFiles.length === 0 && stagedFiles.length === 0}
          onClick={commit}
        >
          <Check size={14} /> {t('core.git.commit', 'COMMIT')}
        </button>
      </div>

      <div className="git-sync-area">
        <button className="git-sync-btn">
          <RefreshCw size={14} /> {t('core.git.sync-changes', 'SYNC CHANGES')}
        </button>
      </div>
      </div>
    </div>
  </>;
};

export const GitOperationsExplorer: React.FC<Pick<GitPaneProps, 'activeFile' | 'unsaved'> & { formatLabel?: GitLabelFormatter }> = ({
  activeFile,
  unsaved,
  formatLabel,
}) => {
  const gitOperations = useGitOperations(activeFile, unsaved);
  return <GitOperationsExplorerContent {...gitOperations} formatLabel={formatLabel} />;
};

export const GitPane: React.FC<GitPaneProps> = ({
  files,
  activeFile,
  theme,
  unsaved,
  onClose,
  shellSidebarOpen,
  onShellSidebarToggle,
  formatLabel,
}) => {
  const t = formatLabel ?? fallbackGitLabelFormatter;
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
    <div ref={splitContainerRef} className="editor-pane-body editor-pane-body--transparent is-split">
      <div className={`editor-pane-column editor-pane-column--split-grid editor-pane-column--split-start editor-pane-column--split-left-${splitBand}`}>
        {left}
      </div>
      <div onMouseDown={startSplitDrag} className={`editor-splitter ${isDragging ? 'dragging' : ''}`} role="separator" aria-orientation="vertical" aria-label={ariaLabel}>
        <div className="editor-splitter-handle" />
      </div>
      <div className={`editor-pane-column editor-pane-column--split-grid editor-pane-column--split-end editor-pane-column--split-right-${100 - splitBand}`}>
        {right}
      </div>
    </div>
  );

  const oldFilePanel = (
    <div className="git-diff-panel">
      <div className="git-diff-panel__header">{t('core.git.old-file', 'OLD FILE')}</div>
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
      <div className="git-diff-panel__header">{t('core.git.new-file', 'NEW FILE')}</div>
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
      <div className="git-diff-panel__header">{t('core.git.unified-diff', 'UNIFIED DIFF')}</div>
      <div className="git-diff-panel__content">
        <div className="git-diff-meta"># {activeFile?.name ?? t('core.git.no-file-selected', 'No file selected')}</div>
        <div className="git-diff-row diff-removed">
          <span className="git-diff-marker">-</span>
          {diffPreview.oldLines[0] || t('core.git.old-line-content', 'Old line content')}
        </div>
        <div className="git-diff-row diff-added">
          <span className="git-diff-marker">+</span>
          {diffPreview.newLines[0] || t('core.git.new-content', 'New content...')}
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
      <div className="git-diff-panel__header">{t('core.git.updated-preview', 'UPDATED PREVIEW')}</div>
      <div className="git-diff-panel__content git-preview-pane">
        <PreviewPane content={markdownPreview.newContent} theme={theme} files={files} onNavigate={() => undefined} />
      </div>
    </div>
  );

  const previousPreviewPanel = (
    <div className="git-diff-panel git-diff-panel--preview">
      <div className="git-diff-panel__header">{t('core.git.old-file-preview', 'OLD FILE PREVIEW')}</div>
      <div className="git-diff-panel__content git-preview-pane">
        <PreviewPane content={markdownPreview.oldContent} theme={theme} files={files} onNavigate={() => undefined} />
      </div>
    </div>
  );

  const renderDiffStage = () => {
    if (!activeFile) {
      return <div className="git-diff-placeholder">{t('core.git.select-file', 'SELECT A FILE TO VIEW DIFF')}</div>;
    }

    if (diffMode === 'unified') {
      return <div className="git-diff-stage mode-unified">{unifiedPanel}</div>;
    }
    if (diffMode === 'split') {
      return <div className="git-diff-stage mode-split">{renderResizableDiff(oldFilePanel, newFilePanel, t('core.git.resize-diff-panes', 'Resize Git diff panes'))}</div>;
    }
    if (diffMode === 'unified-preview') {
      return <div className="git-diff-stage mode-unified-preview">{renderResizableDiff(unifiedPanel, updatedPreviewPanel, t('core.git.resize-preview-panes', 'Resize Git preview panes'))}</div>;
    }
    return <div className="git-diff-stage mode-split-preview">{renderResizableDiff(updatedPreviewPanel, previousPreviewPanel, t('core.git.resize-preview-panes', 'Resize Git preview panes'))}</div>;
  };

  return (
    <div className="git-ops-pane editor-pane-container" role="region" aria-label={t('core.git.region', 'Git Operations')}>
      {isDragging && <div className="editor-splitter-drag-shield" />}
      <div className="view-toolbar" aria-label={t('core.git.toolbar', 'Git Operations toolbar')}>
        <div className="view-toolbar-group">
          <button
            type="button"
            className={`view-toolbar-btn ${effectiveSidebarOpen ? 'active' : ''}`}
            title={t('core.git.toggle-panel', 'Toggle source-control panel')}
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
              aria-label={t(mode.labelKey, mode.defaultLabel)}
              title={t(mode.labelKey, mode.defaultLabel)}
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
            aria-label={t('core.git.stage-active-file', 'Stage active file')}
            title={t('core.git.stage-active-file', 'Stage active file')}
            onClick={() => activeFile && stageFile(activeFile.id)}
            disabled={!activeFile || changedFiles.length === 0}
          >
            <Check size={14} />
          </button>
          <button type="button" className="view-toolbar-btn" aria-label={t('core.git.refresh-diff', 'Refresh diff')} title={t('core.git.refresh-diff', 'Refresh diff')}>
            <RefreshCw size={14} />
          </button>
        </div>
        <div className="view-toolbar-group view-toolbar-group--end">
          <span className="view-toolbar-divider" />
          <button type="button" className="view-toolbar-btn" title={t('core.git.close', 'Close Git Operations')} onClick={onClose}>
            <XCircle size={14} />
          </button>
        </div>
      </div>

      <div className="editor-pane-shell">
        <div className="git-workspace">
          <div className="git-diff-view">
            <div className="panel-toolbar git-diff-header">
              <span className="git-diff-title">
                {activeFile ? `${t('core.git.diff-prefix', 'DIFF')}: ${activeFile.name}` : t('core.git.no-selection', 'NO SELECTION')}
              </span>
              <div className="git-diff-actions">
                <div className="git-diff-legend">
                  <div className="git-diff-legend-item"><div className="git-legend-icon-del" /> {t('core.git.removed', 'REMOVED')}</div>
                  <div className="git-diff-legend-item"><div className="git-legend-icon-add" /> {t('core.git.added', 'ADDED')}</div>
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
