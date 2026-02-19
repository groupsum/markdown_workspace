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
  { id: 'new-file', label: 'Create New File', action: actions.promptNewFile, icon: <FilePlus size={14} /> },
  { id: 'new-folder', label: 'Create New Folder', action: actions.promptNewFolder, icon: <FolderPlus size={14} /> },
  { id: 'save', label: 'Save Current File', action: actions.saveCurrentFile, icon: <Settings size={14} /> },
  { id: 'rename', label: 'Rename Selected Item', action: actions.promptRenameSelected, icon: <Pencil size={14} /> },
  { id: 'delete', label: 'Delete Selected Item', action: actions.deleteSelectedItem, icon: <Trash2 size={14} /> },
  { id: 'toggle-sidebar', label: 'Toggle Explorer', action: actions.toggleSidebar, icon: <Folder size={14} /> },
  { id: 'download', label: 'Download Current Item', action: actions.handleDownload, icon: <Download size={14} /> },
  { id: 'export-html', label: 'Export HTML', action: actions.handleHtmlExport, icon: <FileDown size={14} /> },
  { id: 'print-preview', label: 'Print Preview', action: actions.handlePrint, icon: <Printer size={14} /> },
  { id: 'git-mode', label: 'Toggle Git Operations', action: () => actions.setAppMode(appMode === 'git' ? 'work' : 'git'), icon: <GitBranch size={14} /> },
  { id: 'switch-project', label: 'Switch Project', action: actions.switchToProjectSelector, icon: <LayoutGrid size={14} /> },
  { id: 'settings', label: 'System Settings', action: () => actions.setShowSettings(true), icon: <Settings size={14} /> },
  { id: 'zoom-in', label: 'Zoom In', action: () => actions.adjustZoom(0.1), icon: <Plus size={14} /> },
  { id: 'zoom-out', label: 'Zoom Out', action: () => actions.adjustZoom(-0.1), icon: <Minus size={14} /> },
  { id: 'view-editor', label: 'Editor View', action: () => actions.setViewMode('editor'), icon: <LayoutGrid size={14} /> },
  { id: 'view-split', label: 'Split View', action: () => actions.setViewMode('split'), icon: <LayoutGrid size={14} /> },
  { id: 'view-preview', label: 'Preview View', action: () => actions.setViewMode('preview'), icon: <LayoutGrid size={14} /> },
  { id: 'next-tab', label: 'Next Tab', action: actions.selectNextTab, icon: <LayoutGrid size={14} /> },
  { id: 'previous-tab', label: 'Previous Tab', action: actions.selectPreviousTab, icon: <LayoutGrid size={14} /> }
];
