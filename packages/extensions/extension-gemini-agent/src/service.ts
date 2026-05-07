import type { I18nLabel } from "@mdwrk/extension-manifest";
import type { WorkspaceFileSummary } from "@mdwrk/extension-host";
import { collectGeminiAgentContext, getPrimarySelectionText, hasActiveDocumentContext, hasSelectedTextContext } from "./context.js";
import { geminiAgentLabels } from "./i18n.js";
import { buildGeminiPrompt } from "./prompt.js";
import { readGeminiAgentSettings } from "./settings.js";
import type {
  GeminiChatMessage,
  GeminiChatThread,
  GeminiAgentIntent,
  GeminiAgentResponse,
  GeminiAgentRunOptions,
  GeminiAgentService,
  GeminiAgentServiceDependencies,
  GeminiAgentServiceSnapshot,
  GeminiMentionedFile,
  GeminiAgentWritebackMode,
} from "./types.js";

const DEFAULT_THREAD_TITLE = "New conversation";

const createSnapshot = (): GeminiAgentServiceSnapshot => ({
  busy: false,
  lastIntent: "idle",
  lastPrompt: "",
  lastContext: null,
  lastResponse: null,
  pendingDraft: null,
  lastError: null,
  writebackBlockedReason: null,
  infoMessage: null,
  threads: [],
  activeThreadId: null,
});

function formatLabel(formatter: (label: I18nLabel | string) => string, label: I18nLabel | string): string {
  return formatter(label);
}

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function getNowIso(): string {
  return new Date().toISOString();
}

function createThread(title = DEFAULT_THREAD_TITLE): GeminiChatThread {
  const now = getNowIso();
  return {
    id: createId("thread"),
    title,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

function createMessage(
  role: GeminiChatMessage["role"],
  text: string,
  intent?: GeminiAgentIntent,
): GeminiChatMessage {
  return {
    id: createId("msg"),
    role,
    text,
    createdAt: getNowIso(),
    intent,
  };
}

function buildIntentPrompt(intent: GeminiAgentIntent, prompt: string, contextSnapshot: Awaited<ReturnType<typeof collectGeminiAgentContext>>): string {
  const trimmed = prompt.trim();
  if (trimmed) return trimmed;
  if (intent === "summarize-current-file") {
    return `Summarize ${contextSnapshot.file?.name ?? "the active file"}.`;
  }
  if (intent === "rewrite-selection") {
    return `Rewrite the current selection from ${contextSnapshot.file?.name ?? "the active file"}.`;
  }
  if (intent === "custom-prompt") {
    return "Run a custom Gemini prompt using the active Markdown context.";
  }
  return "Open a new Gemini conversation.";
}

function buildThreadTitle(source: string): string {
  const normalized = source.replace(/\s+/g, " ").trim();
  if (!normalized) return DEFAULT_THREAD_TITLE;
  return normalized.length <= 48 ? normalized : `${normalized.slice(0, 45).trimEnd()}...`;
}

function extractPromptMentionKeys(prompt: string): string[] {
  const matches = prompt.matchAll(/(^|\s)@([^\s@]+)/g);
  const keys = new Set<string>();
  for (const match of matches) {
    const token = match[2]?.trim();
    if (token) {
      keys.add(token);
    }
  }
  return Array.from(keys);
}

function resolveMentionPath(key: string, files: readonly WorkspaceFileSummary[]): string | null {
  const normalized = key.replace(/^\/+/, "").toLowerCase();
  const byPath = files.find((file) => file.path.replace(/^\/+/, "").toLowerCase() === normalized);
  if (byPath) return byPath.path;

  const byName = files.filter((file) => file.name.toLowerCase() === normalized);
  if (byName.length === 1) return byName[0]?.path ?? null;

  return null;
}

export function createGeminiAgentService(deps: GeminiAgentServiceDependencies): GeminiAgentService {
  let snapshot = createSnapshot();
  const listeners = new Set<() => void>();

  const emit = () => {
    for (const listener of Array.from(listeners)) {
      listener();
    }
  };

  const setSnapshot = (patch: Partial<GeminiAgentServiceSnapshot>) => {
    snapshot = { ...snapshot, ...patch };
    emit();
  };

  const ensureActiveThread = (): GeminiChatThread => {
    const existing = snapshot.activeThreadId
      ? snapshot.threads.find((thread) => thread.id === snapshot.activeThreadId) ?? null
      : null;
    if (existing) return existing;
    const thread = createThread();
    snapshot = {
      ...snapshot,
      threads: [thread, ...snapshot.threads],
      activeThreadId: thread.id,
    };
    emit();
    return thread;
  };

  const updateThread = (threadId: string, updater: (thread: GeminiChatThread) => GeminiChatThread) => {
    const threads = snapshot.threads.map((thread) => (thread.id === threadId ? updater(thread) : thread));
    setSnapshot({ threads });
  };

  const appendThreadMessage = (threadId: string, message: GeminiChatMessage, nextTitle?: string) => {
    updateThread(threadId, (thread) => ({
      ...thread,
      title: thread.title === DEFAULT_THREAD_TITLE && nextTitle ? nextTitle : thread.title,
      updatedAt: message.createdAt,
      messages: [...thread.messages, message],
    }));
  };

  const publishDiagnostic = async (severity: "info" | "warning" | "error", code: string, label: I18nLabel, detail?: string) => {
    await deps.context.host.diagnostics.publish(deps.context.extensionId, {
      severity,
      code,
      message: formatLabel(deps.formatLabel, label),
      detail,
    });
  };

  const loadSettings = async () => await readGeminiAgentSettings(deps.context.config);

  const refreshContext = async () => {
    const contextSnapshot = await collectGeminiAgentContext(deps.context.host);
    setSnapshot({ lastContext: contextSnapshot });
    return contextSnapshot;
  };

  const listMentionableFiles = async (query = ""): Promise<readonly WorkspaceFileSummary[]> => {
    const normalized = query.trim().toLowerCase();
    const files = (await deps.context.host.workspace.listFiles())
      .filter((file) => file.kind === "file");
    const sorted = files.slice().sort((left, right) => left.path.localeCompare(right.path));

    if (!normalized) {
      return sorted;
    }

    const rank = (file: WorkspaceFileSummary): number => {
      const path = file.path.toLowerCase();
      const name = file.name.toLowerCase();
      if (path.startsWith(normalized) || name.startsWith(normalized)) return 0;
      if (path.includes(`/${normalized}`) || name.includes(normalized)) return 1;
      return 2;
    };

    return sorted
      .filter((file) => file.path.toLowerCase().includes(normalized) || file.name.toLowerCase().includes(normalized))
      .sort((left, right) => rank(left) - rank(right) || left.path.localeCompare(right.path))
      .slice(0, 24);
  };

  const resolveMentionedFiles = async (prompt: string, options?: GeminiAgentRunOptions): Promise<readonly GeminiMentionedFile[]> => {
    const files = await listMentionableFiles();
    const mentionKeys = new Set<string>([...(options?.mentionPaths ?? []), ...extractPromptMentionKeys(prompt)]);
    const paths = Array.from(mentionKeys)
      .map((key) => resolveMentionPath(key, files))
      .filter((path): path is string => Boolean(path));
    const uniquePaths = Array.from(new Set(paths));
    const mentions = await Promise.all(uniquePaths.map(async (path) => {
      const file = files.find((candidate) => candidate.path === path);
      if (!file) return null;
      try {
        const content = await deps.context.host.workspace.readFile(path);
        return {
          path,
          name: file.name,
          content,
        } satisfies GeminiMentionedFile;
      } catch {
        return null;
      }
    }));

    return mentions.filter((mention): mention is GeminiMentionedFile => Boolean(mention));
  };

  const ensureRequestPreconditions = async (intent: GeminiAgentIntent, contextSnapshot: Awaited<ReturnType<typeof collectGeminiAgentContext>>) => {
    const settings = await loadSettings();

    if (settings.authMode === "api-key" && !settings.apiKey.trim()) {
      const message = formatLabel(deps.formatLabel, geminiAgentLabels.notificationsMissingConfiguration);
      setSnapshot({ lastError: message, infoMessage: null });
      await publishDiagnostic("warning", "EXT_GEMINI_MISSING_CONFIGURATION", geminiAgentLabels.diagnosticsMissingConfiguration);
      await deps.context.host.notifications.warn(geminiAgentLabels.notificationsMissingConfiguration);
      throw new Error(message);
    }

    let oidcAccessToken: string | undefined;
    let oidcSubject: string | undefined;

    if (settings.authMode === "oidc") {
      if (!deps.oidc) {
        const message = "Gemini OIDC is not available in this host runtime.";
        setSnapshot({ lastError: message, infoMessage: null });
        await publishDiagnostic("warning", "EXT_GEMINI_OIDC_UNAVAILABLE", geminiAgentLabels.diagnosticsMissingConfiguration, message);
        throw new Error(message);
      }

      const credential = await deps.oidc.readCredential(settings.oidcProvider);
      if (!credential?.accessToken) {
        const message = "Gemini OIDC is not connected for the selected provider.";
        setSnapshot({ lastError: message, infoMessage: null });
        await publishDiagnostic("warning", "EXT_GEMINI_OIDC_NOT_CONNECTED", geminiAgentLabels.diagnosticsMissingConfiguration, message);
        await deps.context.host.notifications.warn({ defaultMessage: message });
        throw new Error(message);
      }

      oidcAccessToken = credential.accessToken;
      oidcSubject = credential.subject;
    }

    if (intent === "summarize-current-file" && !hasActiveDocumentContext(contextSnapshot)) {
      const message = formatLabel(deps.formatLabel, geminiAgentLabels.notificationsNoDocument);
      setSnapshot({ lastError: message, infoMessage: null });
      await publishDiagnostic("warning", "EXT_GEMINI_NO_DOCUMENT", geminiAgentLabels.diagnosticsNoDocument);
      await deps.context.host.notifications.warn(geminiAgentLabels.notificationsNoDocument);
      throw new Error(message);
    }

    if (intent === "rewrite-selection" && !hasSelectedTextContext(contextSnapshot)) {
      const message = formatLabel(deps.formatLabel, geminiAgentLabels.notificationsNoSelection);
      setSnapshot({ lastError: message, infoMessage: null });
      await publishDiagnostic("warning", "EXT_GEMINI_NO_SELECTION", geminiAgentLabels.diagnosticsNoSelection);
      await deps.context.host.notifications.warn(geminiAgentLabels.notificationsNoSelection);
      throw new Error(message);
    }

    return {
      ...settings,
      oidcAccessToken,
      oidcSubject,
    };
  };

  const runIntent = async (intent: GeminiAgentIntent, prompt = "", options?: GeminiAgentRunOptions): Promise<GeminiAgentResponse> => {
    setSnapshot({
      busy: true,
      lastIntent: intent,
      lastPrompt: prompt,
      lastError: null,
      infoMessage: formatLabel(deps.formatLabel, geminiAgentLabels.statusRunning),
      writebackBlockedReason: null,
    });

    try {
      const contextSnapshot = await collectGeminiAgentContext(deps.context.host);
      const activeThread = ensureActiveThread();
      const userPrompt = buildIntentPrompt(intent, prompt, contextSnapshot);
      appendThreadMessage(activeThread.id, createMessage("user", userPrompt, intent), buildThreadTitle(userPrompt));
      const settings = await ensureRequestPreconditions(intent, contextSnapshot);
      const mentions = await resolveMentionedFiles(prompt, options);
      const requestPrompt = buildGeminiPrompt(intent, prompt, contextSnapshot, settings, mentions);
      const response = await deps.provider.generate({
        intent,
        prompt: requestPrompt,
        context: contextSnapshot,
        settings,
        mentions,
      });

      const nextDraft = intent === "rewrite-selection" ? response.text : snapshot.pendingDraft;
      const assistantMessage = createMessage("assistant", response.text, intent);
      appendThreadMessage(activeThread.id, assistantMessage);
      setSnapshot({
        busy: false,
        lastContext: contextSnapshot,
        lastResponse: response,
        pendingDraft: nextDraft,
        lastError: null,
        infoMessage: formatLabel(deps.formatLabel, geminiAgentLabels.diagnosticsRequestSucceeded),
      });

      await publishDiagnostic("info", "EXT_GEMINI_REQUEST_SUCCEEDED", geminiAgentLabels.diagnosticsRequestSucceeded);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSnapshot({
        busy: false,
        lastError: message,
        infoMessage: null,
      });
      await deps.context.host.diagnostics.publish(deps.context.extensionId, {
        severity: "error",
        code: "EXT_GEMINI_REQUEST_FAILED",
        message,
        detail: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  };

  const blockWriteback = async (): Promise<boolean> => {
    const reason = formatLabel(deps.formatLabel, geminiAgentLabels.notificationsWritebackBlocked);
    setSnapshot({ writebackBlockedReason: reason, infoMessage: null, lastError: null });
    await publishDiagnostic("warning", "EXT_GEMINI_WRITEBACK_BLOCKED", geminiAgentLabels.diagnosticsWritebackBlocked);
    await deps.context.host.notifications.warn(geminiAgentLabels.notificationsWritebackBlocked);
    return false;
  };

  const applyDraft = async (mode: GeminiAgentWritebackMode): Promise<boolean> => {
    const settings = await loadSettings();
    const draft = snapshot.pendingDraft?.trim() ?? "";
    if (!settings.allowWriteBack || !draft) {
      return await blockWriteback();
    }

    if (mode === "selection") {
      const selectionText = getPrimarySelectionText(snapshot.lastContext ?? await collectGeminiAgentContext(deps.context.host));
      if (!selectionText) {
        return await blockWriteback();
      }
      await deps.context.host.editor.replaceSelections(draft);
      setSnapshot({
        writebackBlockedReason: null,
        infoMessage: formatLabel(deps.formatLabel, geminiAgentLabels.notificationsWritebackAppliedSelection),
      });
      await publishDiagnostic("info", "EXT_GEMINI_WRITEBACK_APPLIED", geminiAgentLabels.diagnosticsWritebackApplied);
      await deps.context.host.notifications.info(geminiAgentLabels.notificationsWritebackAppliedSelection);
      return true;
    }

    await deps.context.host.editor.setDocumentContent(draft);
    setSnapshot({
      writebackBlockedReason: null,
      infoMessage: formatLabel(deps.formatLabel, geminiAgentLabels.notificationsWritebackAppliedDocument),
    });
    await publishDiagnostic("info", "EXT_GEMINI_WRITEBACK_APPLIED", geminiAgentLabels.diagnosticsWritebackApplied);
    await deps.context.host.notifications.info(geminiAgentLabels.notificationsWritebackAppliedDocument);
    return true;
  };

  return {
    getSnapshot(): GeminiAgentServiceSnapshot {
      return snapshot;
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    loadSettings,
    refreshContext,
    listMentionableFiles,
    runIntent,
    updateDraft(nextDraft: string): void {
      setSnapshot({ pendingDraft: nextDraft, writebackBlockedReason: null });
    },
    clearDraft(): void {
      setSnapshot({ pendingDraft: null, writebackBlockedReason: null });
    },
    clearResult(): void {
      setSnapshot({ lastResponse: null, lastError: null, infoMessage: formatLabel(deps.formatLabel, geminiAgentLabels.statusIdle) });
    },
    applyDraft,
    createThread(): GeminiChatThread {
      const thread = createThread();
      setSnapshot({
        threads: [thread, ...snapshot.threads],
        activeThreadId: thread.id,
      });
      return thread;
    },
    selectThread(threadId: string): void {
      if (!snapshot.threads.some((thread) => thread.id === threadId)) return;
      setSnapshot({ activeThreadId: threadId });
    },
  };
}
