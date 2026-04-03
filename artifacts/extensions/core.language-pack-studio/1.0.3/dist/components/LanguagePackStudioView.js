import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDeferredValue, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Columns2, Download, Languages, PackagePlus, Sidebar, SidebarOpen, Power, PowerOff, Square, SplitSquareHorizontal, Trash2, Upload, X, } from "lucide-react";
function downloadJson(filename, value) {
    const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
const denseInputStyle = {
    width: "100%",
    border: "1px solid var(--border-color)",
    background: "var(--bg-panel)",
    color: "var(--fg-primary)",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 11,
    lineHeight: 1.4,
};
const createLanguageBrowserStore = () => {
    let state = { browserQuery: "", browserFilter: "all", selectedLocale: null };
    const listeners = new Set();
    return {
        getSnapshot: () => state,
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        setState(update) {
            state = { ...state, ...update };
            listeners.forEach((listener) => listener());
        },
    };
};
const languageBrowserStores = new WeakMap();
const getLanguageBrowserStore = (controller) => {
    let store = languageBrowserStores.get(controller);
    if (!store) {
        store = createLanguageBrowserStore();
        languageBrowserStores.set(controller, store);
    }
    return store;
};
function useLanguageBrowserState(controller) {
    const store = getLanguageBrowserStore(controller);
    const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    return { state, setState: store.setState };
}
function LanguagePackBrowserSidebar({ controller, snapshot, }) {
    const { state, setState } = useLanguageBrowserState(controller);
    const deferredBrowserQuery = useDeferredValue(state.browserQuery.trim().toLowerCase());
    const builtInPackCount = snapshot.packs.filter((pack) => pack.source === "built-in").length;
    const installedPackCount = snapshot.packs.filter((pack) => pack.source === "installed").length;
    const filteredPacks = useMemo(() => snapshot.packs.filter((pack) => {
        if (state.browserFilter === "built-in" && pack.source !== "built-in")
            return false;
        if (state.browserFilter === "installed" && pack.source !== "installed")
            return false;
        if (state.browserFilter === "disabled" && pack.enabled)
            return false;
        if (!deferredBrowserQuery)
            return true;
        const haystack = `${pack.locale} ${pack.label} ${pack.source} ${pack.enabled ? "enabled" : "disabled"}`.toLowerCase();
        return haystack.includes(deferredBrowserQuery);
    }), [deferredBrowserQuery, snapshot.packs, state.browserFilter]);
    return (_jsxs("div", { className: "workspace-panel-content", style: { display: "grid", gap: 12, padding: 12 }, children: [_jsxs("div", { className: "settings-card settings-card-stack", children: [_jsxs("div", { className: "settings-session-grid", children: [_jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: "PACKS" }), _jsx("span", { className: "settings-session-value", children: snapshot.packs.length })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: "ENABLED" }), _jsx("span", { className: "settings-session-value", children: snapshot.packs.filter((pack) => pack.enabled).length })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: "BUILT_IN" }), _jsx("span", { className: "settings-session-value", children: builtInPackCount })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: "ACTIVE" }), _jsx("span", { className: "settings-session-value", children: snapshot.activeLocale })] })] }), _jsxs("div", { className: "settings-chip-row", children: [_jsx("span", { className: "settings-chip", children: "LANGUAGE_BROWSER" }), _jsx("span", { className: "settings-chip", children: "INDEXEDDB" }), _jsx("span", { className: "settings-chip", children: "BUILT_IN + INSTALLED" })] })] }), _jsxs("div", { className: "settings-card settings-card-stack", style: { gap: 8 }, children: [_jsx("input", { style: denseInputStyle, value: state.browserQuery, onChange: (event) => setState({ browserQuery: event.target.value }), placeholder: "Filter locale, label, source", "aria-label": "Filter language browser" }), _jsx("div", { className: "settings-chip-row", children: [
                            ["all", `ALL ${snapshot.packs.length}`],
                            ["built-in", `BUILT_IN ${builtInPackCount}`],
                            ["installed", `INSTALLED ${installedPackCount}`],
                            ["disabled", `DISABLED ${snapshot.packs.filter((pack) => !pack.enabled).length}`],
                        ].map(([value, label]) => (_jsx("button", { type: "button", className: `view-toolbar-btn ${state.browserFilter === value ? "active" : ""}`, onClick: () => setState({ browserFilter: value }), children: label }, value))) }), filteredPacks.map((pack) => (_jsxs("button", { type: "button", className: `settings-sidebar-btn ${state.selectedLocale === pack.locale ? "active" : ""}`, onClick: () => setState({ selectedLocale: pack.locale }), style: { justifyContent: "space-between", gap: 10 }, children: [_jsx("span", { style: { textAlign: "left" }, children: pack.label }), _jsx("span", { className: "settings-session-label", children: pack.source === "built-in" ? "BUILT_IN" : pack.enabled ? "INSTALLED" : "DISABLED" })] }, `${pack.source}:${pack.locale}`))), filteredPacks.length === 0 && _jsx("span", { className: "text-[11px] text-[var(--fg-muted)]", children: "No language packs match the current browser filter." })] })] }));
}
export const LanguagePackStudioSidebar = ({ controller }) => {
    const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
    return _jsx(LanguagePackBrowserSidebar, { controller: controller, snapshot: snapshot });
};
export const LanguagePackStudioView = ({ controller, close, formatLabel: _formatLabel, shellSidebarOpen, onShellSidebarToggle, embedBrowserInShellSidebar = false, }) => {
    const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
    const [importInput, setImportInput] = useState(null);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [layoutMode, setLayoutMode] = useState("split");
    const [draftLocale, setDraftLocale] = useState("custom");
    const [draftLabel, setDraftLabel] = useState("Custom Language Pack");
    const [draftMessages, setDraftMessages] = useState('{\n  "core.views.settings.title": "System Configuration"\n}');
    const { state: browserState, setState: setBrowserState } = useLanguageBrowserState(controller);
    const effectiveSidebarOpen = embedBrowserInShellSidebar ? (shellSidebarOpen ?? true) : sidebarOpen;
    useEffect(() => {
        if (browserState.selectedLocale && snapshot.packs.some((pack) => pack.locale === browserState.selectedLocale)) {
            return;
        }
        setBrowserState({ selectedLocale: snapshot.packs[0]?.locale ?? null });
    }, [browserState.selectedLocale, setBrowserState, snapshot.packs]);
    const selectedPack = snapshot.packs.find((pack) => pack.locale === browserState.selectedLocale) ?? null;
    const missingKeys = useMemo(() => {
        if (!selectedPack || selectedPack.source === "built-in") {
            return [];
        }
        return snapshot.tokens.filter((token) => !(token.key in selectedPack.messages));
    }, [selectedPack, snapshot.tokens]);
    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        try {
            await controller.importArtifact(await file.text());
            setError(null);
        }
        catch (nextError) {
            setError(nextError instanceof Error ? nextError.message : "Failed to import language pack.");
        }
        finally {
            event.target.value = "";
        }
    };
    const handleCreate = async () => {
        try {
            const messages = JSON.parse(draftMessages);
            const pack = await controller.createArtifact({ locale: draftLocale, label: draftLabel, messages, enabled: true });
            downloadJson(`${pack.locale}.language-pack.json`, pack);
            setBrowserState({ selectedLocale: pack.locale });
            setError(null);
        }
        catch (nextError) {
            setError(nextError instanceof Error ? nextError.message : "Failed to create language pack.");
        }
    };
    return (_jsxs("div", { className: "language-pack-studio-pane editor-pane-container", "data-testid": "language-pack-studio-pane", children: [_jsxs("div", { className: "view-toolbar", "aria-label": "Language Pack Studio toolbar", children: [_jsxs("div", { className: "view-toolbar-group", children: [_jsx("button", { type: "button", className: `view-toolbar-btn ${effectiveSidebarOpen ? "active" : ""}`, title: "Toggle sidebar", onClick: () => embedBrowserInShellSidebar ? onShellSidebarToggle?.(!effectiveSidebarOpen) : setSidebarOpen((current) => !current), children: effectiveSidebarOpen ? _jsx(SidebarOpen, { size: 14 }) : _jsx(Sidebar, { size: 14 }) }), _jsx("button", { type: "button", className: `view-toolbar-btn ${layoutMode === "single" ? "active" : ""}`, title: "Single pane", onClick: () => setLayoutMode("single"), children: _jsx(Square, { size: 14 }) }), _jsx("button", { type: "button", className: `view-toolbar-btn ${layoutMode === "split" ? "active" : ""}`, title: "Split screen", onClick: () => setLayoutMode("split"), children: _jsx(SplitSquareHorizontal, { size: 14 }) })] }), _jsxs("div", { className: "view-toolbar-group", children: [_jsx("span", { className: "view-toolbar-divider" }), _jsx("button", { type: "button", className: "view-toolbar-btn", title: "Import pack", onClick: () => importInput?.click(), children: _jsx(Upload, { size: 14 }) }), _jsx("button", { type: "button", className: "view-toolbar-btn", title: "Enable all packs", onClick: () => { void controller.setAllEnabled(true); }, children: _jsx(Power, { size: 14 }) }), _jsx("button", { type: "button", className: "view-toolbar-btn", title: "Disable all packs", onClick: () => { void controller.setAllEnabled(false); }, children: _jsx(PowerOff, { size: 14 }) })] }), _jsxs("div", { className: "view-toolbar-group", style: { justifyContent: "flex-end" }, children: [_jsx("span", { className: "view-toolbar-divider" }), _jsx("button", { type: "button", className: "view-toolbar-btn", title: "Close studio", onClick: () => void close(), children: _jsx(X, { size: 14 }) })] })] }), _jsxs("div", { className: "editor-pane-shell", children: [_jsx("input", { ref: setImportInput, type: "file", accept: "application/json,.json", hidden: true, onChange: handleImport }), _jsxs("div", { className: "editor-pane-body is-split", children: [!embedBrowserInShellSidebar && sidebarOpen && (_jsxs("aside", { className: `workspace-sidebar editor-pane-column ${sidebarOpen ? "" : "is-collapsed"}`, style: { width: "min(320px, 28vw)", padding: 12, gap: 12 }, children: [_jsx(LanguagePackBrowserSidebar, { controller: controller, snapshot: snapshot }), error && _jsx("p", { style: { margin: 0, fontSize: 11, color: "var(--status-error)" }, children: error })] })), _jsxs("div", { className: "editor-pane-column", style: { flex: 1, padding: 16, gap: 16 }, children: [_jsx("div", { className: "settings-card settings-card-stack", style: { gap: 10 }, children: _jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }, children: [_jsxs("div", { style: { display: "grid", gap: 4 }, children: [_jsx("span", { className: "settings-session-label", children: "LANGUAGE_PACK_STUDIO" }), _jsx("strong", { style: { fontSize: 14 }, children: "Workspace language packs" }), _jsx("span", { style: { fontSize: 11, color: "var(--fg-muted)" }, children: "Built-in and installed locale packs share one high-density manager surface." })] }), _jsxs("div", { className: "settings-chip-row", children: [_jsx("span", { className: "settings-chip", children: "INDEXEDDB" }), _jsx("span", { className: "settings-chip", children: "BUILT_IN + INSTALLED" }), _jsx("span", { className: "settings-chip", children: "PANE_ONLY" })] })] }) }), selectedPack && (_jsxs("div", { style: { display: "grid", gap: 16, gridTemplateColumns: layoutMode === "split" ? "minmax(0, 1.15fr) minmax(320px, 0.85fr)" : "minmax(0, 1fr)" }, children: [_jsxs("div", { style: { display: "grid", gap: 16 }, children: [_jsxs("div", { className: "settings-card settings-card-stack", children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }, children: [_jsxs("div", { children: [_jsx("strong", { style: { fontSize: 14 }, children: selectedPack.label }), _jsxs("p", { style: { margin: "6px 0 0", fontSize: 11, color: "var(--fg-muted)" }, children: [selectedPack.locale, " | ", selectedPack.source.toUpperCase()] })] }), _jsxs("div", { className: "settings-action-row", style: { padding: 8, gap: 8 }, children: [_jsxs("button", { type: "button", className: "modal-btn", onClick: () => { void controller.setEnabled(selectedPack.locale, !selectedPack.enabled); }, children: [selectedPack.enabled ? _jsx(PowerOff, { size: 14 }) : _jsx(Power, { size: 14 }), " ", selectedPack.enabled ? "DISABLE" : "ENABLE"] }), _jsx("button", { type: "button", className: "modal-btn modal-btn-primary", onClick: () => { void controller.activate(selectedPack.locale); }, disabled: !selectedPack.enabled, children: "USE" }), _jsxs("button", { type: "button", className: "modal-btn", onClick: () => {
                                                                                    const artifact = controller.exportArtifact(selectedPack.locale);
                                                                                    if (artifact)
                                                                                        downloadJson(`${selectedPack.locale}.language-pack.json`, artifact);
                                                                                }, disabled: selectedPack.source !== "installed", children: [_jsx(Download, { size: 14 }), " EXPORT"] }), _jsxs("button", { type: "button", className: "modal-btn", onClick: () => { void controller.remove(selectedPack.locale); }, disabled: selectedPack.source !== "installed", children: [_jsx(Trash2, { size: 14 }), " REMOVE"] })] })] }), _jsxs("div", { className: "settings-session-grid", children: [_jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: "STATUS" }), _jsx("span", { className: "settings-session-value", children: selectedPack.enabled ? "ENABLED" : "DISABLED" })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: "SOURCE" }), _jsx("span", { className: "settings-session-value", children: selectedPack.source.toUpperCase() })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: "TOKENS" }), _jsx("span", { className: "settings-session-value", children: selectedPack.source === "installed" ? Object.keys(selectedPack.messages).length : "CORE" })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: "MISSING" }), _jsx("span", { className: "settings-session-value", children: selectedPack.source === "installed" ? missingKeys.length : "N/A" })] })] })] }), _jsxs("div", { className: "settings-card settings-card-stack", children: [_jsx("strong", { style: { fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }, children: "Token Audit" }), selectedPack.source === "built-in" ? (_jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: "BUILT_IN_LOCALE" }), _jsx("span", { className: "settings-session-value", children: "Core shell catalogs load through the extension-aware i18n fallback chain." })] })) : snapshot.loadingTokens ? (_jsx("span", { className: "text-[11px] text-[var(--fg-muted)]", children: "Loading tokens..." })) : (_jsx("div", { style: { display: "grid", gap: 8, maxHeight: 420, overflow: "auto" }, children: snapshot.tokens.map((token) => {
                                                                    const missing = !(token.key in selectedPack.messages);
                                                                    return (_jsxs("div", { className: "settings-session-item", style: { borderColor: missing ? "var(--status-error)" : undefined }, children: [_jsxs("div", { style: { display: "grid", gap: 4 }, children: [_jsx("span", { className: "settings-session-label", children: token.key }), _jsx("span", { className: "text-[11px] text-[var(--fg-muted)]", children: token.source })] }), _jsxs("div", { style: { display: "grid", gap: 4 }, children: [_jsx("span", { className: "settings-session-value", children: missing ? "MISSING" : "PRESENT" }), _jsx("span", { className: "text-[11px] text-[var(--fg-muted)]", children: selectedPack.messages[token.key] ?? token.defaultMessage })] })] }, token.key));
                                                                }) }))] })] }), layoutMode === "split" && (_jsxs("div", { className: "settings-card settings-card-stack", children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsx(Columns2, { size: 14 }), _jsx("strong", { style: { fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }, children: "Create Language Pack" })] }), _jsxs("div", { className: "settings-grid-2", children: [_jsxs("label", { className: "flex flex-col gap-2", children: [_jsx("span", { className: "text-[10px] font-bold text-[var(--fg-muted)] uppercase", children: "Locale" }), _jsx("input", { style: denseInputStyle, value: draftLocale, onChange: (event) => setDraftLocale(event.target.value) })] }), _jsxs("label", { className: "flex flex-col gap-2", children: [_jsx("span", { className: "text-[10px] font-bold text-[var(--fg-muted)] uppercase", children: "Label" }), _jsx("input", { style: denseInputStyle, value: draftLabel, onChange: (event) => setDraftLabel(event.target.value) })] })] }), _jsxs("label", { className: "flex flex-col gap-2", children: [_jsx("span", { className: "text-[10px] font-bold text-[var(--fg-muted)] uppercase", children: "Messages JSON" }), _jsx("textarea", { style: { ...denseInputStyle, minHeight: 220, fontFamily: "var(--font-mono, monospace)" }, value: draftMessages, onChange: (event) => setDraftMessages(event.target.value) })] }), _jsx("div", { className: "settings-action-row", style: { padding: 8 }, children: _jsxs("button", { type: "button", className: "modal-btn modal-btn-primary", onClick: () => void handleCreate(), children: [_jsx(PackagePlus, { size: 14 }), " CREATE_AND_EXPORT"] }) })] }))] })), layoutMode === "single" && (_jsxs("div", { className: "settings-card settings-card-stack", children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsx(Languages, { size: 14 }), _jsx("strong", { style: { fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }, children: "Create Language Pack" })] }), _jsxs("div", { className: "settings-grid-2", children: [_jsxs("label", { className: "flex flex-col gap-2", children: [_jsx("span", { className: "text-[10px] font-bold text-[var(--fg-muted)] uppercase", children: "Locale" }), _jsx("input", { style: denseInputStyle, value: draftLocale, onChange: (event) => setDraftLocale(event.target.value) })] }), _jsxs("label", { className: "flex flex-col gap-2", children: [_jsx("span", { className: "text-[10px] font-bold text-[var(--fg-muted)] uppercase", children: "Label" }), _jsx("input", { style: denseInputStyle, value: draftLabel, onChange: (event) => setDraftLabel(event.target.value) })] })] }), _jsxs("label", { className: "flex flex-col gap-2", children: [_jsx("span", { className: "text-[10px] font-bold text-[var(--fg-muted)] uppercase", children: "Messages JSON" }), _jsx("textarea", { style: { ...denseInputStyle, minHeight: 180, fontFamily: "var(--font-mono, monospace)" }, value: draftMessages, onChange: (event) => setDraftMessages(event.target.value) })] }), _jsx("div", { className: "settings-action-row", style: { padding: 8 }, children: _jsxs("button", { type: "button", className: "modal-btn modal-btn-primary", onClick: () => void handleCreate(), children: [_jsx(PackagePlus, { size: 14 }), " CREATE_AND_EXPORT"] }) })] }))] })] })] })] }));
};
//# sourceMappingURL=LanguagePackStudioView.js.map