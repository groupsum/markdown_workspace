import React from 'react';
import {
  Download,
  FileDown,
  FilePlus,
  Folder,
  FolderPlus,
  GitBranch,
  LayoutGrid,
  Minus,
  Pencil,
  Plus,
  Printer,
  Settings,
  Trash2
} from 'lucide-react';
import type { OidcProviderId } from '../types';
import { t } from '../i18n';

export const PROVIDER_REPO_HOST: Record<OidcProviderId, string> = {
  github: 'github.com',
  gitlab: 'gitlab.com',
  gitea: 'gitea.com'
};

export const inferPatProvider = (token: string): OidcProviderId | null => {
  const trimmed = token.trim().toLowerCase();
  if (!trimmed) return null;

  if (trimmed.startsWith('ghp_') || trimmed.startsWith('github_pat_') || trimmed.startsWith('gho_') || trimmed.startsWith('ghu_')) {
    return 'github';
  }

  if (trimmed.startsWith('glpat-')) {
    return 'gitlab';
  }

  return null;
};

export const normalizeRepositoryUrl = (value: string, defaultHost: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\/[\w.-]+(?:\.git)?$/.test(trimmed)) return `https://${defaultHost}/${trimmed}`;
  if (/^[\w.-]+\.[\w.-]+\//.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
};

export const buildCommandActions = (actions: any, appMode: 'work' | 'git') => [
  { id: 'new-file', label: t('_create_new_file'), action: actions.promptNewFile, icon: <FilePlus size={14} /> },
  { id: 'new-folder', label: t('_create_new_folder'), action: actions.promptNewFolder, icon: <FolderPlus size={14} /> },
  { id: 'save', label: t('_save_current_file'), action: actions.saveCurrentFile, icon: <Settings size={14} /> },
  { id: 'rename', label: t('_rename_selected_item'), action: actions.promptRenameSelected, icon: <Pencil size={14} /> },
  { id: 'delete', label: t('_delete_selected_item'), action: actions.deleteSelectedItem, icon: <Trash2 size={14} /> },
  { id: 'toggle-sidebar', label: t('_toggle_explorer'), action: actions.toggleSidebar, icon: <Folder size={14} /> },
  { id: 'download', label: t('_download_current_item'), action: actions.handleDownload, icon: <Download size={14} /> },
  { id: 'export-html', label: t('_export_html'), action: actions.handleHtmlExport, icon: <FileDown size={14} /> },
  { id: 'print-preview', label: t('_print_preview'), action: actions.handlePrint, icon: <Printer size={14} /> },
  { id: 'git-mode', label: t('_toggle_git_operations'), action: () => actions.setAppMode(appMode === 'git' ? 'work' : 'git'), icon: <GitBranch size={14} /> },
  { id: 'switch-project', label: t('_switch_project'), action: actions.switchToProjectSelector, icon: <LayoutGrid size={14} /> },
  { id: 'settings', label: t('_system_settings'), action: () => actions.setShowSettings(true), icon: <Settings size={14} /> },
  { id: 'zoom-in', label: t('_zoom_in'), action: () => actions.adjustZoom(0.1), icon: <Plus size={14} /> },
  { id: 'zoom-out', label: t('_zoom_out'), action: () => actions.adjustZoom(-0.1), icon: <Minus size={14} /> },
  { id: 'view-editor', label: t('_editor_view'), action: () => actions.setViewMode('editor'), icon: <LayoutGrid size={14} /> },
  { id: 'view-split', label: t('_split_view'), action: () => actions.setViewMode('split'), icon: <LayoutGrid size={14} /> },
  { id: 'view-preview', label: t('_preview_view'), action: () => actions.setViewMode('preview'), icon: <LayoutGrid size={14} /> },
  { id: 'next-tab', label: t('_next_tab'), action: actions.selectNextTab, icon: <LayoutGrid size={14} /> },
  { id: 'previous-tab', label: t('_previous_tab'), action: actions.selectPreviousTab, icon: <LayoutGrid size={14} /> }
];
