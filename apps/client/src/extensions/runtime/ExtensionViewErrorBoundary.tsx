import React from 'react';
import type { ClientDiagnosticsService } from '../../features/diagnostics/clientDiagnosticsService';

export interface ExtensionViewErrorBoundaryProps extends React.PropsWithChildren {
  readonly extensionId: string;
  readonly diagnostics: ClientDiagnosticsService;
}

interface ExtensionViewErrorBoundaryState {
  readonly error: Error | null;
}

export class ExtensionViewErrorBoundary extends React.Component<ExtensionViewErrorBoundaryProps, ExtensionViewErrorBoundaryState> {
  state: ExtensionViewErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ExtensionViewErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error): void {
    void this.props.diagnostics.publish(this.props.extensionId, {
      severity: 'error',
      code: 'EXT_RUNTIME_VIEW_RENDER_FAILED',
      message: error.message,
      detail: error.stack,
    });
  }

  render(): React.ReactNode {
    if (this.state.error) {
      return (
        <div className="modal-overlay">
          <div className="modal-base settings-modal">
            <div className="modal-header">
              <span className="modal-title">Extension Render Failure</span>
            </div>
            <div className="settings-content-frame">
              <div className="settings-pane">
                <div className="settings-card settings-card-stack">
                  <span className="settings-section-label">{this.props.extensionId}</span>
                  <p className="settings-muted-caption leading-relaxed">{this.state.error.message}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
