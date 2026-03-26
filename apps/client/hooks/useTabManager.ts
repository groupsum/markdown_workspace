
import { useCallback, useState } from 'react';
import { Tab } from '../types';

export const useTabManager = () => {
  console.log("[useTabManager] Hook init");

  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const openTab = useCallback((fileId: string) => {
    console.log(`[useTabManager] Action: openTab for file -> ${fileId}`);
    setTabs((prev) => {
      const existingTab = prev.find((tab) => tab.fileId === fileId);
      if (existingTab) {
        console.log(`[useTabManager] Tab already exists, switching to -> ${existingTab.id}`);
        setActiveTabId(existingTab.id);
        return prev;
      }
      const newTab = { id: `tab-${fileId}`, fileId };
      console.log(`[useTabManager] Creating new tab -> ${newTab.id}`);
      setActiveTabId(newTab.id);
      return [...prev, newTab];
    });
  }, []);

  const closeTab = useCallback((tabId: string) => {
    console.log(`[useTabManager] Action: closeTab -> ${tabId}`);
    setTabs((prev) => {
      const newTabs = prev.filter((tab) => tab.id !== tabId);
      setActiveTabId((currentActiveTabId) => {
        if (currentActiveTabId !== tabId) {
          return currentActiveTabId;
        }
        const nextTabId = newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null;
        console.log(`[useTabManager] Closing active tab, switching to next -> ${nextTabId}`);
        return nextTabId;
      });
      return newTabs;
    });
  }, []);

  const resetTabs = useCallback(() => {
    console.log("[useTabManager] Action: resetTabs (full clear)");
    setTabs([]);
    setActiveTabId(null);
  }, []);

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
