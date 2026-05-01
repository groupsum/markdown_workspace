import React, { useEffect, useMemo, useState } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { useClientI18n } from '../../src/features/i18n/useClientI18n';

export interface SettingsModalSection {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly icon?: React.ReactNode;
  readonly panel?: string;
  readonly render: () => React.ReactNode;
}

interface SettingsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly sections: readonly SettingsModalSection[];
  readonly activeThemeLabel?: string;
  readonly initialSectionId?: string | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  sections,
  activeThemeLabel,
  initialSectionId,
}) => {
  const { t } = useClientI18n();
  const resolvePanelLabel = React.useCallback((panel: string | undefined): string => {
    if (!panel) return t('core.settings.group.general', 'GENERAL');
    const fallbackLabel = panel.toUpperCase().replace(/[_\s]+/g, ' ');
    const messageKey = `core.settings.group.${panel}`;
    return t(messageKey, fallbackLabel);
  }, [t]);
  const resolveSidebarLabel = React.useCallback((section: SettingsModalSection): string => {
    const fallbackLabel = section.title.toUpperCase().replace(/\s+/g, '_');
    const messageKey = `core.settings.sidebar.${section.id}.label`;
    return t(messageKey, fallbackLabel);
  }, [t]);
  const orderedSections = useMemo(() => [...sections], [sections]);
  const groupedSections = useMemo(() => orderedSections.reduce<Array<{ panel: string; label: string; sections: SettingsModalSection[] }>>((groups, section) => {
    const panel = section.panel ?? 'general';
    const previous = groups.at(-1);
    if (!previous || previous.panel !== panel) {
      groups.push({
        panel,
        label: resolvePanelLabel(panel),
        sections: [section],
      });
      return groups;
    }
    previous.sections.push(section);
    return groups;
  }, []), [orderedSections, resolvePanelLabel]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(orderedSections[0]?.id ?? null);

  useEffect(() => {
    if (!isOpen) return;
    if (!activeSectionId || !orderedSections.some((section) => section.id === activeSectionId)) {
      setActiveSectionId(orderedSections[0]?.id ?? null);
    }
  }, [activeSectionId, isOpen, orderedSections]);

  useEffect(() => {
    if (!isOpen || !initialSectionId) return;
    if (!orderedSections.some((section) => section.id === initialSectionId)) return;
    setActiveSectionId(initialSectionId);
  }, [initialSectionId, isOpen, orderedSections]);

  if (!isOpen) return null;

  const activeSection = orderedSections.find((section) => section.id === activeSectionId) ?? orderedSections[0];
  if (!activeSection) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-base settings-modal">
        <div className="modal-header">
          <span className="modal-title">
            <SettingsIcon size={18} className="settings-accent-text" />
            {t('core.views.settings.title', 'System Configuration')}
          </span>
          <button onClick={onClose} className="modal-close" aria-label={t('core.settings.modal.close', 'Close settings')}><X size={18} /></button>
        </div>

        <div className="settings-layout">
          <nav className="settings-sidebar">
            <div className="settings-sidebar-overview">
              <span className="settings-sidebar-overview-label">{t('core.settings.nav.title', 'SETTINGS')}</span>
              <span className="settings-sidebar-overview-count">{orderedSections.length}</span>
            </div>
            <div className="settings-sidebar-groups">
              {groupedSections.map((group) => (
                <div key={group.panel} className="settings-sidebar-group">
                  <div className="settings-sidebar-group-label">{group.label}</div>
                  <div className="settings-sidebar-group-items">
                    {group.sections.map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setActiveSectionId(section.id)}
                        className={`settings-sidebar-btn ${activeSection.id === section.id ? 'active' : ''}`}
                        data-active={activeSection.id === section.id ? 'true' : 'false'}
                        title={section.title}
                        aria-label={section.title}
                        aria-pressed={activeSection.id === section.id}
                        aria-current={activeSection.id === section.id ? 'page' : undefined}
                      >
                        <span className="settings-sidebar-icon">{section.icon}</span>
                        <span className="settings-sidebar-text">
                          <span className="settings-sidebar-label">{resolveSidebarLabel(section)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          <div className="settings-content">
            <div className="settings-content-header">
              <div className="settings-content-title">
                <span className="settings-content-kicker">{resolvePanelLabel(activeSection.panel)}</span>
                <span className="settings-content-name">{activeSection.title}</span>
                {activeSection.description ? (
                  <p className="settings-content-description">{activeSection.description}</p>
                ) : null}
              </div>
              <div className="settings-content-meta">
                <div className="settings-content-meta-chip">
                  <span className="settings-content-meta-label">{t('core.settings.meta.section', 'SECTION')}</span>
                  <span className="settings-content-meta-value">{orderedSections.findIndex((section) => section.id === activeSection.id) + 1}/{orderedSections.length}</span>
                </div>
                {activeThemeLabel && (
                  <div className="settings-content-meta-chip">
                    <span className="settings-content-meta-label">{t('core.settings.visual.active-theme', 'ACTIVE_THEME')}</span>
                    <span className="settings-content-meta-value">{activeThemeLabel}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="settings-content-frame">
              {activeSection.render()}
            </div>
          </div>
        </div>

        <footer className="modal-footer">
          <button onClick={onClose} className="modal-btn">{t('core.settings.modal.exit', 'EXIT_CONFIG')}</button>
        </footer>
      </div>
    </div>
  );
};
