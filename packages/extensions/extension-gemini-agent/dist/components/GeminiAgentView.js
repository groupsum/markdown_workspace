import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from "react";
import { geminiAgentLabels } from "../i18n.js";
function ToolbarIcon({ name }) {
    const common = {
        width: 14,
        height: 14,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
    };
    if (name === "sidebar") {
        return _jsxs("svg", { ...common, children: [_jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }), _jsx("path", { d: "M9 3v18" })] });
    }
    if (name === "sidebar-open") {
        return _jsxs("svg", { ...common, children: [_jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }), _jsx("path", { d: "M15 3v18" })] });
    }
    if (name === "single") {
        return _jsx("svg", { ...common, children: _jsx("rect", { width: "16", height: "16", x: "4", y: "4", rx: "2" }) });
    }
    if (name === "split") {
        return _jsxs("svg", { ...common, children: [_jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }), _jsx("path", { d: "M12 3v18" })] });
    }
    return _jsxs("svg", { ...common, children: [_jsx("path", { d: "M18 6 6 18" }), _jsx("path", { d: "m6 6 12 12" })] });
}
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
const getSplitBand = (value) => {
    const clamped = Math.min(80, Math.max(20, value));
    return Math.round(clamped / 5) * 5;
};
function useWorkspaceModuleSplit(defaultPosition = 55) {
    const [splitPos, setSplitPos] = React.useState(defaultPosition);
    const [isDragging, setIsDragging] = React.useState(false);
    const splitContainerRef = React.useRef(null);
    React.useEffect(() => {
        const handleMouseMove = (event) => {
            if (!isDragging || !splitContainerRef.current)
                return;
            const rect = splitContainerRef.current.getBoundingClientRect();
            if (rect.width <= 0)
                return;
            setSplitPos(getSplitBand(((event.clientX - rect.left) / rect.width) * 100));
        };
        const handleMouseUp = () => setIsDragging(false);
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            document.body.classList.add("is-resizing-sidebar");
        }
        else {
            document.body.classList.remove("is-resizing-sidebar");
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            document.body.classList.remove("is-resizing-sidebar");
        };
    }, [isDragging]);
    return {
        splitBand: getSplitBand(splitPos),
        isDragging,
        splitContainerRef,
        startSplitDrag: () => setIsDragging(true),
    };
}
export const GeminiAgentSidebar = ({ service, formatLabel }) => {
    const snapshot = React.useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot);
    const context = snapshot.lastContext;
    return (_jsx("div", { className: "workspace-panel-content", style: { display: "grid", gap: 12, padding: 12 }, children: _jsxs("div", { style: cardStyle, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(geminiAgentLabels.panelContext) }), _jsxs("button", { type: "button", className: "settings-sidebar-btn active", style: { justifyContent: "space-between" }, children: [_jsx("span", { style: { textAlign: "left" }, children: context?.project?.name ?? formatLabel(geminiAgentLabels.panelContextNone) }), _jsx("span", { className: "settings-session-label", children: "PROJECT" })] }), _jsxs("button", { type: "button", className: "settings-sidebar-btn active", style: { justifyContent: "space-between" }, children: [_jsx("span", { style: { textAlign: "left" }, children: context?.file?.name ?? formatLabel(geminiAgentLabels.panelContextNone) }), _jsx("span", { className: "settings-session-label", children: "FILE" })] })] }) }));
};
export const GeminiAgentView = ({ close, formatLabel, service, input, shellSidebarOpen, onShellSidebarToggle, embedBrowserInShellSidebar = false, }) => {
    const snapshot = React.useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot);
    const [prompt, setPrompt] = React.useState(input?.prompt ?? "");
    const [settingsSummary, setSettingsSummary] = React.useState(null);
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const [layoutMode, setLayoutMode] = React.useState("split");
    const { splitBand, isDragging, splitContainerRef, startSplitDrag } = useWorkspaceModuleSplit();
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
    const effectiveSidebarOpen = embedBrowserInShellSidebar ? (shellSidebarOpen ?? true) : sidebarOpen;
    const promptPane = (_jsxs("div", { className: "settings-pane", style: { display: "grid", gap: 14 }, children: [_jsxs("div", { className: "settings-card settings-card-stack", style: { display: "grid", gap: 10 }, children: [_jsxs("label", { style: { display: "grid", gap: 8 }, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(geminiAgentLabels.panelPrompt) }), _jsx("textarea", { value: prompt, placeholder: formatLabel(geminiAgentLabels.statusPromptPlaceholder), style: textareaStyle, onChange: (event) => setPrompt(event.currentTarget.value) })] }), _jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [_jsx("button", { className: "modal-btn modal-btn-primary", disabled: snapshot.busy, onClick: () => void service.runIntent("custom-prompt", prompt), children: formatLabel(geminiAgentLabels.panelRunPrompt) }), _jsx("button", { className: "modal-btn", disabled: snapshot.busy, onClick: () => void service.runIntent("summarize-current-file"), children: formatLabel(geminiAgentLabels.panelSummarize) }), _jsx("button", { className: "modal-btn", disabled: snapshot.busy, onClick: () => void service.runIntent("rewrite-selection", prompt), children: formatLabel(geminiAgentLabels.panelRewriteSelection) }), _jsx("button", { className: "modal-btn", disabled: snapshot.busy, onClick: () => void service.refreshContext(), children: formatLabel(geminiAgentLabels.panelRefresh) }), _jsx("button", { className: "modal-btn", onClick: () => service.clearResult(), children: formatLabel(geminiAgentLabels.panelClearResult) })] })] }), _jsxs("div", { style: cardStyle, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(geminiAgentLabels.panelResponse) }), _jsx("pre", { style: { margin: 0, whiteSpace: "pre-wrap", fontFamily: "var(--font-mono, monospace)", fontSize: 12, lineHeight: 1.6 }, children: snapshot.lastResponse?.text ?? "" })] })] }));
    const draftPane = (_jsxs("div", { style: cardStyle, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(geminiAgentLabels.panelDraft) }), _jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [_jsx("button", { className: "modal-btn", disabled: snapshot.busy, onClick: () => void service.applyDraft("selection"), children: formatLabel(geminiAgentLabels.panelApplySelection) }), _jsx("button", { className: "modal-btn", disabled: snapshot.busy, onClick: () => void service.applyDraft("document"), children: formatLabel(geminiAgentLabels.panelReplaceDocument) }), _jsx("button", { className: "modal-btn", onClick: () => service.clearDraft(), children: formatLabel(geminiAgentLabels.panelClearDraft) })] })] }), _jsx("textarea", { value: snapshot.pendingDraft ?? "", style: { ...textareaStyle, minHeight: 180 }, onChange: (event) => service.updateDraft(event.currentTarget.value) }), snapshot.writebackBlockedReason && _jsx("p", { style: { margin: 0, fontSize: 12, color: "var(--fg-secondary)" }, children: snapshot.writebackBlockedReason })] }));
    return (_jsxs("div", { className: "extension-manager-pane editor-pane-container", role: "region", "aria-label": formatLabel(geminiAgentLabels.viewTitle), children: [isDragging && _jsx("div", { className: "editor-splitter-drag-shield" }), _jsxs("div", { className: "view-toolbar", "aria-label": "Gemini Agent toolbar", children: [_jsxs("div", { className: "view-toolbar-group", children: [_jsx("button", { type: "button", className: `view-toolbar-btn ${effectiveSidebarOpen ? "active" : ""}`, title: "Toggle sidebar", onClick: () => embedBrowserInShellSidebar ? onShellSidebarToggle?.(!effectiveSidebarOpen) : setSidebarOpen((current) => !current), children: _jsx(ToolbarIcon, { name: effectiveSidebarOpen ? "sidebar-open" : "sidebar" }) }), _jsx("button", { type: "button", className: `view-toolbar-btn ${layoutMode === "single" ? "active" : ""}`, title: "Single pane", onClick: () => setLayoutMode("single"), children: _jsx(ToolbarIcon, { name: "single" }) }), _jsx("button", { type: "button", className: `view-toolbar-btn ${layoutMode === "split" ? "active" : ""}`, title: "Split screen", onClick: () => setLayoutMode("split"), children: _jsx(ToolbarIcon, { name: "split" }) })] }), _jsxs("div", { className: "view-toolbar-group", style: { justifyContent: "flex-end" }, children: [_jsx("span", { className: "view-toolbar-divider" }), _jsx("button", { type: "button", className: "view-toolbar-btn", title: "Close Gemini Agent", onClick: () => void close(), children: _jsx(ToolbarIcon, { name: "close" }) })] })] }), _jsx("div", { className: "editor-pane-shell", children: _jsxs("div", { className: "editor-pane-body is-split", children: [!embedBrowserInShellSidebar && effectiveSidebarOpen && (_jsxs("aside", { className: "workspace-sidebar editor-pane-column", style: { width: "min(320px, 28vw)", padding: 12, gap: 12 }, children: [_jsxs("div", { style: cardStyle, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(geminiAgentLabels.panelContext) }), _jsxs("div", { className: "settings-session-grid", children: [_jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: formatLabel(geminiAgentLabels.panelContextProject) }), _jsx("span", { className: "settings-session-value", children: context?.project?.name ?? formatLabel(geminiAgentLabels.panelContextNone) })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: formatLabel(geminiAgentLabels.panelContextFile) }), _jsx("span", { className: "settings-session-value", children: context?.file?.path ?? context?.file?.name ?? formatLabel(geminiAgentLabels.panelContextNone) })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: formatLabel(geminiAgentLabels.panelContextSelection) }), _jsx("span", { className: "settings-session-value", children: selectionLength > 0 ? `${selectionLength} ${formatLabel(geminiAgentLabels.panelSelectionCountSuffix)}` : formatLabel(geminiAgentLabels.panelContextNone) })] })] })] }), _jsxs("div", { style: cardStyle, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(geminiAgentLabels.panelSettings) }), _jsx("pre", { style: { margin: 0, whiteSpace: "pre-wrap", fontFamily: "var(--font-mono, monospace)", fontSize: 12, lineHeight: 1.5 }, children: JSON.stringify(settingsSummary ?? {}, null, 2) })] })] })), _jsxs("div", { className: "editor-pane-column", style: { flex: 1, padding: 16, gap: 16 }, children: [_jsxs("div", { className: "settings-card settings-card-stack", style: { display: "grid", gap: 10 }, children: [_jsxs("div", { style: { display: "grid", gap: 4 }, children: [_jsx("span", { className: "settings-session-label", children: "GEMINI_AGENT" }), _jsx("strong", { style: { fontSize: 14 }, children: formatLabel(geminiAgentLabels.panelTitle) }), _jsx("span", { style: { fontSize: 12, color: "var(--fg-muted)" }, children: formatLabel(geminiAgentLabels.panelSubtitle) })] }), _jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [_jsx("span", { style: pillStyle, children: configured ? formatLabel(geminiAgentLabels.statusConfigured) : formatLabel(geminiAgentLabels.statusMissingConfiguration) }), _jsx("span", { style: pillStyle, children: settingsSummary?.allowWriteBack ? formatLabel(geminiAgentLabels.statusWritebackEnabled) : formatLabel(geminiAgentLabels.statusWritebackDisabled) }), _jsx("span", { style: pillStyle, children: snapshot.busy ? formatLabel(geminiAgentLabels.statusRunning) : formatLabel(geminiAgentLabels.statusIdle) })] })] }), layoutMode === "split" ? (_jsxs("div", { ref: splitContainerRef, className: "editor-pane-body is-split", style: { background: "transparent" }, children: [_jsx("div", { className: `editor-pane-column editor-pane-column--split-left-${splitBand}`, style: { display: "grid", gap: 16, paddingRight: 12 }, children: promptPane }), _jsx("div", { onMouseDown: startSplitDrag, className: `editor-splitter ${isDragging ? "dragging" : ""}`, role: "separator", "aria-orientation": "vertical", "aria-label": "Resize Gemini Agent panes", children: _jsx("div", { className: "editor-splitter-handle" }) }), _jsx("div", { className: `editor-pane-column editor-pane-column--split-right-${100 - splitBand}`, style: { display: "grid", gap: 16, paddingLeft: 12 }, children: draftPane })] })) : (_jsxs(_Fragment, { children: [promptPane, draftPane] })), snapshot.infoMessage && (_jsxs("div", { style: cardStyle, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(geminiAgentLabels.panelLastInfo) }), _jsx("p", { style: { margin: 0, fontSize: 12, color: "var(--fg-secondary)" }, children: snapshot.infoMessage })] })), snapshot.lastError && (_jsxs("div", { style: cardStyle, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(geminiAgentLabels.panelLastError) }), _jsx("p", { style: { margin: 0, fontSize: 12, color: "var(--fg-secondary)" }, children: snapshot.lastError })] }))] })] }) })] }));
};
//# sourceMappingURL=GeminiAgentView.js.map