import React from 'react';
import { MarkdownRenderer, createMarkdownRendererThemeStyle } from '@mdwrk/markdown-renderer-react';
import { getSyntaxThemeStyle } from '../../data/themes';
import type { AppTheme, FileNode } from '../../types';
import { getMarkdownProfileWarnings, useMarkdownProfileConfig } from '../../src/features/markdownProfiles/profileConfig';
import {
  isExternalHref,
  normalizeEmptyListItemsForPreview,
  resolveInternalMarkdownHref,
  resolveMarkdownHtmlHandlingMode,
  scrollPreviewHash,
} from '../../services/markdownPreviewPolicy.js';

const PENDING_PREVIEW_HASH_STORAGE_KEY = 'mdwrk.pending-preview-hash.v1';

interface WorkspaceMarkdownRendererProps {
  readonly markdown: string;
  readonly theme: AppTheme;
  readonly files: FileNode[];
  readonly currentFile?: FileNode | null;
  readonly onNavigate: (fileId: string) => void;
  readonly className?: string;
}

export function WorkspaceMarkdownRenderer({
  markdown,
  theme,
  files,
  currentFile = null,
  onNavigate,
  className,
}: WorkspaceMarkdownRendererProps): React.JSX.Element {
  const profileConfig = useMarkdownProfileConfig();
  const normalizedMarkdown = React.useMemo(
    () => normalizeEmptyListItemsForPreview(markdown),
    [markdown],
  );
  const htmlHandling = React.useMemo(
    () => resolveMarkdownHtmlHandlingMode(profileConfig, 'preview'),
    [profileConfig],
  );
  const warnings = React.useMemo(
    () => getMarkdownProfileWarnings(profileConfig, 'preview'),
    [profileConfig],
  );
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const pendingHash = window.sessionStorage.getItem(PENDING_PREVIEW_HASH_STORAGE_KEY);
    if (!pendingHash) return;
    const didScroll = scrollPreviewHash(containerRef.current, pendingHash);
    if (didScroll) {
      window.sessionStorage.removeItem(PENDING_PREVIEW_HASH_STORAGE_KEY);
    }
  }, [normalizedMarkdown]);

  const showPolicyAdvisory = warnings.length > 0 || htmlHandling !== 'allow-trusted';

  return (
    <div
      ref={containerRef}
      className="workspace-markdown-renderer-shell"
      data-markdown-html-handling={htmlHandling}
    >
      {showPolicyAdvisory && (
        <aside
          className="workspace-markdown-renderer-warning"
          style={{
            margin: '0 0 12px',
            padding: '12px 14px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-panel)',
            color: 'var(--fg-muted)',
            fontSize: '11px',
            lineHeight: 1.5,
          }}
        >
          <strong style={{ display: 'block', marginBottom: 6, color: 'var(--fg-primary)' }}>PREVIEW_POLICY</strong>
          <div style={{ marginBottom: warnings.length > 0 ? 8 : 0 }}>
            HTML_HANDLING: {htmlHandling.toUpperCase()}
          </div>
          {warnings.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {warnings.map((warning) => (
                <li key={`${warning.scope}:${warning.code}`}>{warning.message}</li>
              ))}
            </ul>
          )}
        </aside>
      )}
      <MarkdownRenderer
        markdown={normalizedMarkdown}
        className={className}
        syntaxTheme={getSyntaxThemeStyle(theme)}
        profile={profileConfig.baseProfile}
        extensions={profileConfig.enabledExtensions}
        htmlHandling={htmlHandling}
        themeStyle={createMarkdownRendererThemeStyle()}
        onLinkClick={(event, href) => {
          if (!href || isExternalHref(href)) return;
          const resolution = resolveInternalMarkdownHref(href, files, currentFile);
          if (!resolution) return;
          event.preventDefault();

          if (resolution.kind === 'hash') {
            scrollPreviewHash(containerRef.current, resolution.hash);
            return;
          }

          if (resolution.fileId === currentFile?.id) {
            if (resolution.hash) {
              scrollPreviewHash(containerRef.current, resolution.hash);
            }
            return;
          }

          if (resolution.hash && typeof window !== 'undefined') {
            window.sessionStorage.setItem(PENDING_PREVIEW_HASH_STORAGE_KEY, resolution.hash);
          }
          onNavigate(resolution.fileId);
        }}
      />
    </div>
  );
}
