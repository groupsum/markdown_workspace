
import { useState, useCallback } from 'react';
import { Tab } from '../types';

type TabState = {
  tabs: Tab[];
  activeTabId: string | null;
};

export const useTabManager = () => {
  console.log("[useTabManager] Hook init");

  const [state, setState] = useState<TabState>({ tabs: [], activeTabId: null });

  const openTab = useCallback((fileId: string) => {
    console.log(`[useTabManager] Action: openTab for file -> ${fileId}`);
    setState((prevState) => {
      const { tabs } = prevState;
      const existingTab = tabs.find((tab) => tab.fileId === fileId);
      if (existingTab) {
        console.log(`[useTabManager] Tab already exists, switching to -> ${existingTab.id}`);
        return { tabs, activeTabId: existingTab.id };
      }

      const newTab = { id: `tab-${fileId}`, fileId };
      console.log(`[useTabManager] Creating new tab -> ${newTab.id}`);
      return {
        tabs: [...tabs, newTab],
        activeTabId: newTab.id,
      };
    });
  }, []);

  const closeTab = useCallback((tabId: string) => {
    console.log(`[useTabManager] Action: closeTab -> ${tabId}`);
    setState((prevState) => {
      const nextTabs = prevState.tabs.filter((tab) => tab.id !== tabId);
      let nextActiveTabId = prevState.activeTabId;
      if (prevState.activeTabId === tabId) {
        const nextTabId = nextTabs.length > 0 ? nextTabs[nextTabs.length - 1].id : null;
        console.log(`[useTabManager] Closing active tab, switching to next -> ${nextTabId}`);
        nextActiveTabId = nextTabId;
      }
      return {
        tabs: nextTabs,
        activeTabId: nextActiveTabId,
      };
    });
  }, []);

  const resetTabs = useCallback(() => {
    console.log("[useTabManager] Action: resetTabs (full clear)");
    setState({ tabs: [], activeTabId: null });
  }, []);

  return {
    tabs: state.tabs,
    activeTabId: state.activeTabId,
    setActiveTabId: (activeTabId: string | null) => {
      setState((prevState) => ({ ...prevState, activeTabId }));
    },
    openTab,
    closeTab,
    resetTabs,
    setTabs: (tabs: Tab[]) => {
      setState((prevState) => ({ ...prevState, tabs }));
    }
  };
};
