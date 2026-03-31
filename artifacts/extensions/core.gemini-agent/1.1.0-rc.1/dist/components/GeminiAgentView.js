import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { geminiAgentLabels } from "../i18n.js";
const cardStyle = {
    display: "grid",
    gap: 10,
    padding: 12,
    border: "1px solid var(--border-primary)",
    borderRadius: 10,
    background: "var(--bg-secondary)",
};
const pillStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "2px 8px",
    borderRadius: 999,
    border: "1px solid var(--border-primary)",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
};
const textareaStyle = {
    width: "100%",
    minHeight: 120,
    background: "var(--bg-primary)",
    color: "var(--fg-primary)",
    border: "1px solid var(--border-primary)",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 12,
    lineHeight: 1.6,
    resize: "vertical",
};
export const GeminiAgentView = ({ close, formatLabel, service, input }) => {
    const snapshot = React.useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot);
    const [prompt, setPrompt] = React.useState(input?.prompt ?? "");
    const [settingsSummary, setSettingsSummary] = React.useState(null);
    const lastIntentRef = React.useRef(null);
    React.useEffect(() => {
        void service.refreshContext();
        void service.loadSettings().then((settings) => {
            setSettingsSummary({
                endpoint: settings.endpoint,
                model: settings.model,
                authMode: settings.authMode,
                hasApiKey: Boolean(settings.apiKey),
                allowWriteBack: settings.allowWriteBack,
                autoAttachDocument: settings.autoAttachDocument,
                autoAttachSelection: settings.autoAttachSelection,
            });
        });
    }, [service]);
    React.useEffect(() => {
        if (!input?.intent || input.intent === "idle")
            return;
        const inputKey = `${input.intent}:${input.prompt ?? ""}`;
        if (lastIntentRef.current === inputKey)
            return;
        lastIntentRef.current = inputKey;
        if (input.prompt) {
            setPrompt(input.prompt);
        }
        void service.runIntent(input.intent, input.prompt ?? "");
    }, [input, service]);
    const context = snapshot.lastContext;
    const selectionLength = context?.selections?.[0]?.text?.length ?? 0;
    const configured = Boolean(settingsSummary?.endpoint) && (settingsSummary?.authMode === "none" || Boolean(settingsSummary?.hasApiKey));
    return (_jsx("div", { className: "modal-overlay", children: _jsxs("div", { className: "modal-base settings-modal", style: { width: "min(1080px, calc(100vw - 48px))" }, children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { style: { display: "grid", gap: 4 }, children: [_jsx("span", { className: "modal-title", children: formatLabel(geminiAgentLabels.panelTitle) }), _jsx("span", { style: { fontSize: 12, color: "var(--fg-muted)" }, children: formatLabel(geminiAgentLabels.panelSubtitle) })] }), _jsx("button", { onClick: () => void close(), className: "modal-close", children: formatLabel(geminiAgentLabels.panelClose) })] }), _jsxs("div", { className: "settings-content-frame", style: { display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(320px, 0.85fr)", gap: 16 }, children: [_jsxs("div", { className: "settings-pane", style: { display: "grid", gap: 14 }, children: [_jsxs("div", { className: "settings-card settings-card-stack", style: { display: "grid", gap: 10 }, children: [_jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [_jsx("span", { style: pillStyle, children: configured ? formatLabel(geminiAgentLabels.statusConfigured) : formatLabel(geminiAgentLabels.statusMissingConfiguration) }), _jsx("span", { style: pillStyle, children: settingsSummary?.allowWriteBack ? formatLabel(geminiAgentLabels.statusWritebackEnabled) : formatLabel(geminiAgentLabels.statusWritebackDisabled) }), _jsx("span", { style: pillStyle, children: snapshot.busy ? formatLabel(geminiAgentLabels.statusRunning) : formatLabel(geminiAgentLabels.statusIdle) })] }), _jsxs("label", { style: { display: "grid", gap: 8 }, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(geminiAgentLabels.panelPrompt) }), _jsx("textarea", { value: prompt, placeholder: formatLabel(geminiAgentLabels.statusPromptPlaceholder), style: textareaStyle, onChange: (event) => setPrompt(event.currentTarget.value) })] }), _jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [_jsx("button", { className: "modal-btn modal-btn-primary", disabled: snapshot.busy, onClick: () => void service.runIntent("custom-prompt", prompt), children: formatLabel(geminiAgentLabels.panelRunPrompt) }), _jsx("button", { className: "modal-btn", disabled: snapshot.busy, onClick: () => void service.runIntent("summarize-current-file"), children: formatLabel(geminiAgentLabels.panelSummarize) }), _jsx("button", { className: "modal-btn", disabled: snapshot.busy, onClick: () => void service.runIntent("rewrite-selection", prompt), children: formatLabel(geminiAgentLabels.panelRewriteSelection) }), _jsx("button", { className: "modal-btn", disabled: snapshot.busy, onClick: () => void service.refreshContext(), children: formatLabel(geminiAgentLabels.panelRefresh) }), _jsx("button", { className: "modal-btn", onClick: () => service.clearResult(), children: formatLabel(geminiAgentLabels.panelClearResult) })] })] }), _jsxs("div", { style: cardStyle, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(geminiAgentLabels.panelResponse) }), _jsx("pre", { style: { margin: 0, whiteSpace: "pre-wrap", fontFamily: "var(--font-mono, monospace)", fontSize: 12, lineHeight: 1.6 }, children: snapshot.lastResponse?.text ?? "" })] }), _jsxs("div", { style: cardStyle, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(geminiAgentLabels.panelDraft) }), _jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [_jsx("button", { className: "modal-btn", disabled: snapshot.busy, onClick: () => void service.applyDraft("selection"), children: formatLabel(geminiAgentLabels.panelApplySelection) }), _jsx("button", { className: "modal-btn", disabled: snapshot.busy, onClick: () => void service.applyDraft("document"), children: formatLabel(geminiAgentLabels.panelReplaceDocument) }), _jsx("button", { className: "modal-btn", onClick: () => service.clearDraft(), children: formatLabel(geminiAgentLabels.panelClearDraft) })] })] }), _jsx("textarea", { value: snapshot.pendingDraft ?? "", style: { ...textareaStyle, minHeight: 180 }, onChange: (event) => service.updateDraft(event.currentTarget.value) }), snapshot.writebackBlockedReason && _jsx("p", { style: { margin: 0, fontSize: 12, color: "var(--fg-secondary)" }, children: snapshot.writebackBlockedReason })] })] }), _jsxs("div", { className: "settings-pane", style: { display: "grid", gap: 14 }, children: [_jsxs("div", { style: cardStyle, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(geminiAgentLabels.panelContext) }), _jsxs("div", { className: "settings-session-grid", children: [_jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: formatLabel(geminiAgentLabels.panelContextProject) }), _jsx("span", { className: "settings-session-value", children: context?.project?.name ?? formatLabel(geminiAgentLabels.panelContextNone) })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: formatLabel(geminiAgentLabels.panelContextFile) }), _jsx("span", { className: "settings-session-value", children: context?.file?.path ?? context?.file?.name ?? formatLabel(geminiAgentLabels.panelContextNone) })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: formatLabel(geminiAgentLabels.panelContextSelection) }), _jsx("span", { className: "settings-session-value", children: selectionLength > 0 ? `${selectionLength} ${formatLabel(geminiAgentLabels.panelSelectionCountSuffix)}` : formatLabel(geminiAgentLabels.panelContextNone) })] })] })] }), _jsxs("div", { style: cardStyle, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(geminiAgentLabels.panelSettings) }), _jsx("pre", { style: { margin: 0, whiteSpace: "pre-wrap", fontFamily: "var(--font-mono, monospace)", fontSize: 12, lineHeight: 1.5 }, children: JSON.stringify(settingsSummary ?? {}, null, 2) })] }), snapshot.infoMessage && (_jsxs("div", { style: cardStyle, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(geminiAgentLabels.panelLastInfo) }), _jsx("p", { style: { margin: 0, fontSize: 12, color: "var(--fg-secondary)" }, children: snapshot.infoMessage })] })), snapshot.lastError && (_jsxs("div", { style: cardStyle, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(geminiAgentLabels.panelLastError) }), _jsx("p", { style: { margin: 0, fontSize: 12, color: "var(--fg-secondary)" }, children: snapshot.lastError })] }))] })] })] }) }));
};
//# sourceMappingURL=GeminiAgentView.js.map