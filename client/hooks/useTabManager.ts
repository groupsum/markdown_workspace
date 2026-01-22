
import { useState } from 'react';
import { Tab } from '../types';

export const useTabManager = () => {
  console.log("[useTabManager] Hook init");

  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const openTab = (fileId: string) => {
    console.log(`[useTabManager] Action: openTab for file -> ${fileId}`);
    const existingTab = tabs.find(t => t.fileId === fileId);
    if (existingTab) {
      console.log(`[useTabManager] Tab already exists, switching to -> ${existingTab.id}`);
      setActiveTabId(existingTab.id);
    } else {
      const newTab = { id: `tab-${fileId}`, fileId };
      console.log(`[useTabManager] Creating new tab -> ${newTab.id}`);
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
    }
  };

  const closeTab = (tabId: string) => {
    console.log(`[useTabManager] Action: closeTab -> ${tabId}`);
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      const nextTabId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
      console.log(`[useTabManager] Closing active tab, switching to next -> ${nextTabId}`);
      setActiveTabId(nextTabId);
    }
  };

  const resetTabs = () => {
    console.log("[useTabManager] Action: resetTabs (full clear)");
    setTabs([]);
    setActiveTabId(null);
  };

  return {
    tabs,
    activeTabId,
    setActiveTabId,
    openTab,
    closeTab,
    resetTabs,
    setTabs
  };
};
