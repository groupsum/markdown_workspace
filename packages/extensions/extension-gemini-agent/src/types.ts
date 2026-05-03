import type { I18nLabel } from "@mdwrk/extension-manifest";
import type {
  ActiveDocument,
  ExtensionContext,
  ExtensionConfigurationStore,
  SelectionRange,
  WorkspaceFileSummary,
  WorkspaceProjectSummary,
} from "@mdwrk/extension-host";

export type GeminiAgentIntent = "idle" | "summarize-current-file" | "rewrite-selection" | "custom-prompt";
export type GeminiAgentWritebackMode = "selection" | "document";
export type GeminiAgentAuthMode = "api-key" | "none";

export interface GeminiAgentResolvedSettings {
  readonly endpoint: string;
  readonly model: string;
  readonly authMode: GeminiAgentAuthMode;
  readonly apiKey: string;
  readonly systemPrompt: string;
  readonly temperature: number;
  readonly requestTimeoutMs: number;
  readonly autoAttachDocument: boolean;
  readonly autoAttachSelection: boolean;
  readonly allowWriteBack: boolean;
}

export interface GeminiAgentContextSnapshot {
  readonly project: WorkspaceProjectSummary | null;
  readonly file: WorkspaceFileSummary | null;
  readonly document: ActiveDocument | null;
  readonly selections: readonly SelectionRange[];
}

export interface GeminiAgentRequest {
  readonly intent: GeminiAgentIntent;
  readonly prompt: string;
  readonly context: GeminiAgentContextSnapshot;
  readonly settings: GeminiAgentResolvedSettings;
}

export interface GeminiAgentUsage {
  readonly promptTokens?: number;
  readonly responseTokens?: number;
  readonly totalTokens?: number;
}

export interface GeminiAgentResponse {
  readonly text: string;
  readonly model: string;
  readonly usage?: GeminiAgentUsage;
  readonly raw?: unknown;
}

export type GeminiChatMessageRole = "user" | "assistant" | "system";

export interface GeminiChatMessage {
  readonly id: string;
  readonly role: GeminiChatMessageRole;
  readonly text: string;
  readonly createdAt: string;
  readonly intent?: GeminiAgentIntent;
}

export interface GeminiChatThread {
  readonly id: string;
  readonly title: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly messages: readonly GeminiChatMessage[];
}

export interface GeminiAgentServiceSnapshot {
  readonly busy: boolean;
  readonly lastIntent: GeminiAgentIntent;
  readonly lastPrompt: string;
  readonly lastContext: GeminiAgentContextSnapshot | null;
  readonly lastResponse: GeminiAgentResponse | null;
  readonly pendingDraft: string | null;
  readonly lastError: string | null;
  readonly writebackBlockedReason: string | null;
  readonly infoMessage: string | null;
  readonly threads: readonly GeminiChatThread[];
  readonly activeThreadId: string | null;
}

export interface GeminiAgentService {
  getSnapshot(): GeminiAgentServiceSnapshot;
  subscribe(listener: () => void): () => void;
  loadSettings(): Promise<GeminiAgentResolvedSettings>;
  refreshContext(): Promise<GeminiAgentContextSnapshot>;
  runIntent(intent: GeminiAgentIntent, prompt?: string): Promise<GeminiAgentResponse>;
  updateDraft(nextDraft: string): void;
  clearDraft(): void;
  clearResult(): void;
  applyDraft(mode: GeminiAgentWritebackMode): Promise<boolean>;
  createThread(): GeminiChatThread;
  selectThread(threadId: string): void;
}

export interface GeminiTextProvider {
  readonly id: string;
  generate(request: GeminiAgentRequest): Promise<GeminiAgentResponse>;
}

export interface GeminiProviderCreateOptions {
  readonly fetchImpl?: GeminiFetchLike;
}

export interface GeminiAgentEntryOptions {
  readonly provider?: GeminiTextProvider;
}

export interface GeminiAgentViewInput {
  readonly intent?: GeminiAgentIntent;
  readonly prompt?: string;
}

export interface GeminiAgentViewProps {
  readonly close: () => Promise<void>;
  readonly formatLabel: (label: I18nLabel | string) => string;
  readonly service: GeminiAgentService;
  readonly input?: GeminiAgentViewInput | null;
  readonly shellSidebarOpen?: boolean;
  readonly onShellSidebarToggle?: (open: boolean) => void;
  readonly embedBrowserInShellSidebar?: boolean;
}

export type GeminiFetchLike = (input: string, init?: {
  readonly method?: string;
  readonly headers?: Record<string, string>;
  readonly body?: string;
  readonly signal?: AbortSignal;
}) => Promise<{
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  json(): Promise<unknown>;
  text(): Promise<string>;
}>;

export interface GeminiAgentServiceDependencies {
  readonly context: ExtensionContext;
  readonly provider: GeminiTextProvider;
  readonly formatLabel: (label: I18nLabel | string) => string;
}

export interface GeminiSettingsReadOptions {
  readonly config: ExtensionConfigurationStore;
}
