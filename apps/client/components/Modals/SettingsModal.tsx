import React, { useEffect, useMemo, useState } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';

export interface SettingsModalSection {
  readonly id: string;
  readonly title: string;
  readonly icon?: React.ReactNode;
  readonly panel?: string;
  readonly render: () => React.ReactNode;
}

interface SettingsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly sections: readonly SettingsModalSection[];
  readonly activeThemeLabel?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  sections,
  activeThemeLabel,
}) => {
  const orderedSections = useMemo(() => [...sections], [sections]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(orderedSections[0]?.id ?? null);

  useEffect(() => {
    if (!isOpen) return;
    if (!activeSectionId || !orderedSections.some((section) => section.id === activeSectionId)) {
      setActiveSectionId(orderedSections[0]?.id ?? null);
    }
  }, [activeSectionId, isOpen, orderedSections]);

  if (!isOpen) return null;

  const activeSection = orderedSections.find((section) => section.id === activeSectionId) ?? orderedSections[0];
  if (!activeSection) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-base settings-modal">
        <div className="modal-header">
          <span className="modal-title">
            <SettingsIcon size={18} className="text-[var(--accent)]" />
            System Configuration
          </span>
          <button onClick={onClose} className="modal-close"><X size={18} /></button>
        </div>

        <div className="settings-layout">
          <nav className="settings-sidebar">
            {orderedSections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSectionId(section.id)}
                className={`settings-sidebar-btn ${activeSection.id === section.id ? 'active' : ''}`}
                title={section.title}
              >
                <span className="settings-sidebar-icon">{section.icon}</span>
                <span className="settings-sidebar-label">{section.title.toUpperCase().replace(/\s+/g, '_')}</span>
              </button>
            ))}
          </nav>

          <div className="settings-content">
            <div className="settings-content-header">
              <div className="settings-content-title">
                <span className="settings-content-name">{activeSection.title}</span>
              </div>
              {activeThemeLabel && (
                <div className="settings-content-meta">
                  <span className="settings-content-meta-label">ACTIVE_THEME</span>
                  <span className="settings-content-meta-value">{activeThemeLabel}</span>
                </div>
              )}
            </div>

            <div className="settings-content-frame">
              {activeSection.render()}
            </div>
          </div>
        </div>

        <footer className="modal-footer">
          <button onClick={onClose} className="modal-btn">EXIT_CONFIG</button>
        </footer>
      </div>
    </div>
  );
};
