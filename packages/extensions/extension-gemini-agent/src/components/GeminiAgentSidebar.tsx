import React from "react";
import type { GeminiAgentViewProps } from "../types.js";
import { GeminiAgentThreadList } from "./GeminiAgentThreadList.js";

export const GeminiAgentSidebar: React.FC<Pick<GeminiAgentViewProps, "service" | "formatLabel">> = ({ service, formatLabel }) => {
  const snapshot = React.useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot);
  return (
    <GeminiAgentThreadList
      threads={snapshot.threads}
      activeThreadId={snapshot.activeThreadId}
      formatLabel={formatLabel}
      onNewThread={() => {
        service.createThread();
      }}
      onSelectThread={(threadId) => {
        service.selectThread(threadId);
      }}
    />
  );
};
