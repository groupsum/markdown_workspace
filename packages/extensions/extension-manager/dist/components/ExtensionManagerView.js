import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortableExtensionCatalogRegistration, normalizePortableExtensionPackageArtifact, } from "@mdwrk/extension-runtime";
import { Download, Sidebar, SidebarOpen, SplitSquareHorizontal, Square, Upload, X, } from "lucide-react";
import { extensionManagerLabels } from "../i18n.js";
import { ExtensionCard } from "./ExtensionCard.js";
function downloadJson(filename, value) {
    const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
const getSplitBand = (value) => {
    const clamped = Math.min(80, Math.max(20, value));
    return Math.round(clamped / 5) * 5;
};
function useWorkspaceModuleSplit(defaultPosition = 55) {
    const [splitPos, setSplitPos] = useState(defaultPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [splitContainer, setSplitContainer] = useState(null);
    useEffect(() => {
        const handleMouseMove = (event) => {
            if (!isDragging || !splitContainer)
                return;
            const rect = splitContainer.getBoundingClientRect();
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
    }, [isDragging, splitContainer]);
    return {
        splitBand: getSplitBand(splitPos),
        isDragging,
        splitContainerRef: setSplitContainer,
        startSplitDrag: () => setIsDragging(true),
    };
}
function createBrowserNodes(snapshot, formatLabel) {
    return {
        extensions: snapshot.extensions.map((extension) => ({
            kind: "extension",
            id: extension.id,
            title: formatLabel(extension.manifest.displayName),
            subtitle: extension.manifest.packageName,
            extension,
        })),
        catalogEntries: snapshot.catalogEntries.map((entry) => ({
            kind: "catalog",
            id: entry.entryId,
            title: formatLabel(entry.displayName),
            subtitle: `${entry.packageName}@${entry.version}`,
            catalogEntry: entry,
        })),
    };
}
function StatsGrid({ snapshot, formatLabel, }) {
    return (_jsxs("div", { className: "settings-session-grid", children: [_jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: formatLabel(extensionManagerLabels.statsExtensions) }), _jsx("span", { className: "settings-session-value", children: snapshot.extensions.length })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: formatLabel(extensionManagerLabels.statsActive) }), _jsx("span", { className: "settings-session-value", children: snapshot.extensions.filter((extension) => extension.status === "active").length })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: formatLabel(extensionManagerLabels.statsDisabled) }), _jsx("span", { className: "settings-session-value", children: snapshot.extensions.filter((extension) => !extension.enabled).length })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: formatLabel(extensionManagerLabels.statsIncompatible) }), _jsx("span", { className: "settings-session-value", children: snapshot.extensions.filter((extension) => extension.status === "incompatible").length })] })] }));
}
const createExtensionBrowserStore = () => {
    let state = {
        selectedNodeId: null,
        browserQuery: "",
        browserScope: "all",
        treeState: { extensions: true, catalog: true },
    };
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
const extensionBrowserStores = new WeakMap();
const getExtensionBrowserStore = (runtime) => {
    let store = extensionBrowserStores.get(runtime);
    if (!store) {
        store = createExtensionBrowserStore();
        extensionBrowserStores.set(runtime, store);
    }
    return store;
};
function useExtensionBrowserState(runtime) {
    const store = getExtensionBrowserStore(runtime);
    const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
    return { state, setState: store.setState };
}
function ExtensionManagerBrowserSidebar({ runtime, snapshot, formatLabel, }) {
    const browserNodes = useMemo(() => createBrowserNodes(snapshot, formatLabel), [snapshot, formatLabel]);
    const { state, setState } = useExtensionBrowserState(runtime);
    const filteredExtensionNodes = useMemo(() => browserNodes.extensions.filter((node) => {
        if (state.browserScope === "catalog")
            return false;
        if (!state.browserQuery.trim())
            return true;
        const query = state.browserQuery.trim().toLowerCase();
        return `${node.title} ${node.subtitle} ${node.extension.status}`.toLowerCase().includes(query);
    }), [browserNodes.extensions, state.browserQuery, state.browserScope]);
    const filteredCatalogNodes = useMemo(() => browserNodes.catalogEntries.filter((node) => {
        if (state.browserScope === "extensions")
            return false;
        if (!state.browserQuery.trim())
            return true;
        const query = state.browserQuery.trim().toLowerCase();
        return `${node.title} ${node.subtitle} ${node.catalogEntry.catalogId}`.toLowerCase().includes(query);
    }), [browserNodes.catalogEntries, state.browserQuery, state.browserScope]);
    return (_jsxs("div", { className: "workspace-panel-content", style: { display: "grid", gap: 12, padding: 12 }, children: [_jsxs("div", { className: "settings-card settings-card-stack", children: [_jsx(StatsGrid, { snapshot: snapshot, formatLabel: formatLabel }), _jsxs("div", { className: "settings-chip-row", children: [_jsx("span", { className: "settings-chip", children: "EXTENSION_BROWSER" }), _jsxs("span", { className: "settings-chip", children: [snapshot.extensions.filter((extension) => extension.source === "installed").length, " INSTALLED"] }), _jsxs("span", { className: "settings-chip", children: [snapshot.catalogEntries.length, " CATALOG"] })] })] }), _jsxs("div", { className: "settings-card settings-card-stack", style: { gap: 12 }, children: [_jsx("input", { style: {
                            width: "100%",
                            border: "1px solid var(--border-primary)",
                            background: "var(--surface-elevated, var(--bg-panel))",
                            color: "var(--fg-primary)",
                            borderRadius: 8,
                            padding: "8px 10px",
                            fontSize: 11,
                        }, value: state.browserQuery, onChange: (event) => setState({ browserQuery: event.currentTarget.value }), placeholder: "Filter extensions or catalog entries", "aria-label": "Filter extension browser" }), _jsx("div", { className: "settings-chip-row", children: [
                            ["all", `ALL ${browserNodes.extensions.length + browserNodes.catalogEntries.length}`],
                            ["extensions", `EXT ${browserNodes.extensions.length}`],
                            ["catalog", `CAT ${browserNodes.catalogEntries.length}`],
                        ].map(([value, label]) => (_jsx("button", { type: "button", className: `view-toolbar-btn ${state.browserScope === value ? "active" : ""}`, onClick: () => setState({ browserScope: value }), children: label }, value))) }), _jsxs("details", { open: state.treeState.extensions, onToggle: (event) => {
                            const nextOpen = event.currentTarget.open;
                            setState({ treeState: { ...state.treeState, extensions: nextOpen } });
                        }, children: [_jsx("summary", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }, children: formatLabel(extensionManagerLabels.paneTreeExtensions) }), _jsxs("div", { style: { display: "grid", gap: 6, marginTop: 8 }, children: [filteredExtensionNodes.map((node) => (_jsxs("button", { type: "button", className: `settings-sidebar-btn ${state.selectedNodeId === node.id ? "active" : ""}`, onClick: () => setState({ selectedNodeId: node.id }), style: { justifyContent: "space-between" }, children: [_jsx("span", { style: { textAlign: "left" }, children: node.title }), _jsx("span", { className: "settings-session-label", children: node.extension.status })] }, node.id))), filteredExtensionNodes.length === 0 && _jsx("span", { className: "text-[11px] text-[var(--fg-muted)]", children: "No extensions match the current browser filter." })] })] }), _jsxs("details", { open: state.treeState.catalog, onToggle: (event) => {
                            const nextOpen = event.currentTarget.open;
                            setState({ treeState: { ...state.treeState, catalog: nextOpen } });
                        }, children: [_jsx("summary", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }, children: formatLabel(extensionManagerLabels.paneTreeCatalog) }), _jsxs("div", { style: { display: "grid", gap: 6, marginTop: 8 }, children: [filteredCatalogNodes.length === 0 && _jsx("span", { className: "text-[11px] text-[var(--fg-muted)]", children: "No catalog entries match the current browser filter." }), filteredCatalogNodes.map((node) => (_jsxs("button", { type: "button", className: `settings-sidebar-btn ${state.selectedNodeId === node.id ? "active" : ""}`, onClick: () => setState({ selectedNodeId: node.id }), style: { justifyContent: "space-between" }, children: [_jsx("span", { style: { textAlign: "left" }, children: node.title }), _jsx("span", { className: "settings-session-label", children: node.catalogEntry.installed ? "INSTALLED" : "CATALOG" })] }, node.id)))] })] })] })] }));
}
export const ExtensionManagerSidebar = ({ runtime, formatLabel }) => {
    const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
    return _jsx(ExtensionManagerBrowserSidebar, { runtime: runtime, snapshot: snapshot, formatLabel: formatLabel });
};
export const ExtensionManagerView = ({ runtime, close, formatLabel, defaultSettings, shellSidebarOpen, onShellSidebarToggle, embedBrowserInShellSidebar = false, }) => {
    const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
    const defaults = useMemo(() => ({
        showCompatibility: defaultSettings?.showCompatibility ?? true,
        showDiagnostics: defaultSettings?.showDiagnostics ?? true,
    }), [defaultSettings]);
    const [importInput, setImportInput] = useState(null);
    const [busyEntryId, setBusyEntryId] = useState(null);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [layoutMode, setLayoutMode] = useState("split");
    const { splitBand, isDragging, splitContainerRef, startSplitDrag } = useWorkspaceModuleSplit();
    const { state: browserState, setState: setBrowserState } = useExtensionBrowserState(runtime);
    const effectiveSidebarOpen = embedBrowserInShellSidebar ? (shellSidebarOpen ?? true) : sidebarOpen;
    const installedIds = useMemo(() => new Set(snapshot.extensions.filter((extension) => extension.source === "installed").map((extension) => extension.id)), [snapshot.extensions]);
    const browserNodes = useMemo(() => createBrowserNodes(snapshot, formatLabel), [snapshot, formatLabel]);
    const filteredExtensionNodes = useMemo(() => browserNodes.extensions.filter((node) => {
        if (browserState.browserScope === "catalog")
            return false;
        if (!browserState.browserQuery.trim())
            return true;
        const query = browserState.browserQuery.trim().toLowerCase();
        return `${node.title} ${node.subtitle} ${node.extension.status}`.toLowerCase().includes(query);
    }), [browserNodes.extensions, browserState.browserQuery, browserState.browserScope]);
    const filteredCatalogNodes = useMemo(() => browserNodes.catalogEntries.filter((node) => {
        if (browserState.browserScope === "extensions")
            return false;
        if (!browserState.browserQuery.trim())
            return true;
        const query = browserState.browserQuery.trim().toLowerCase();
        return `${node.title} ${node.subtitle} ${node.catalogEntry.catalogId}`.toLowerCase().includes(query);
    }), [browserNodes.catalogEntries, browserState.browserQuery, browserState.browserScope]);
    useEffect(() => {
        if (browserState.selectedNodeId && [...browserNodes.extensions, ...browserNodes.catalogEntries].some((node) => node.id === browserState.selectedNodeId)) {
            return;
        }
        setBrowserState({ selectedNodeId: browserNodes.extensions[0]?.id ?? browserNodes.catalogEntries[0]?.id ?? null });
    }, [browserNodes.catalogEntries, browserNodes.extensions, browserState.selectedNodeId, setBrowserState]);
    const selectedNode = useMemo(() => [...browserNodes.extensions, ...browserNodes.catalogEntries].find((node) => node.id === browserState.selectedNodeId) ?? null, [browserNodes.catalogEntries, browserNodes.extensions, browserState.selectedNodeId]);
    const handleImportPortablePackage = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        try {
            const text = await file.text();
            const artifact = normalizePortableExtensionPackageArtifact(JSON.parse(text));
            if (!artifact) {
                throw new Error("Invalid portable extension package artifact.");
            }
            const registration = await createPortableExtensionCatalogRegistration(artifact);
            runtime.registerCatalog(registration.catalog, {
                catalogId: registration.catalogId,
                baseUrl: registration.baseUrl,
            });
            await runtime.installFromCatalogEntry(registration.entryId, { autoActivate: true });
            setError(null);
        }
        catch (nextError) {
            setError(nextError instanceof Error ? nextError.message : "Failed to import extension package.");
        }
        finally {
            event.target.value = "";
        }
    };
    const installCatalogEntry = async (entryId) => {
        setBusyEntryId(entryId);
        try {
            await runtime.installFromCatalogEntry(entryId, { autoActivate: true });
            setError(null);
        }
        catch (nextError) {
            setError(nextError instanceof Error ? nextError.message : "Failed to install extension.");
        }
        finally {
            setBusyEntryId(null);
        }
    };
    const removeInstalledExtension = async (extensionId) => {
        setBusyEntryId(extensionId);
        try {
            await runtime.removeInstalledExtension(extensionId);
            setError(null);
        }
        catch (nextError) {
            setError(nextError instanceof Error ? nextError.message : "Failed to remove installed extension.");
        }
        finally {
            setBusyEntryId(null);
        }
    };
    const detailsPane = (_jsxs("div", { style: { display: "grid", gap: 16 }, children: [!selectedNode && (_jsx("div", { className: "settings-card settings-card-stack", children: _jsx("span", { className: "text-[11px] text-[var(--fg-muted)]", children: formatLabel(extensionManagerLabels.emptyTreeSelection) }) })), selectedNode?.kind === "catalog" && (_jsxs("div", { className: "settings-card settings-card-stack", children: [_jsx("strong", { style: { fontSize: 12 }, children: selectedNode.title }), _jsxs("div", { className: "settings-session-grid", children: [_jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: "ENTRY_ID" }), _jsx("span", { className: "settings-session-value", children: selectedNode.catalogEntry.entryId })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: formatLabel(extensionManagerLabels.labelPackage) }), _jsx("span", { className: "settings-session-value", children: selectedNode.catalogEntry.packageName })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: formatLabel(extensionManagerLabels.labelVersion) }), _jsx("span", { className: "settings-session-value", children: selectedNode.catalogEntry.version })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: "CATALOG_ID" }), _jsx("span", { className: "settings-session-value", children: selectedNode.catalogEntry.catalogId })] })] }), _jsx("p", { style: { margin: 0, fontSize: 12, color: "var(--fg-secondary)" }, children: formatLabel(selectedNode.catalogEntry.description) }), _jsx("div", { className: "settings-action-row", style: { padding: 8 }, children: _jsx("button", { type: "button", className: "modal-btn modal-btn-primary", onClick: () => void installCatalogEntry(selectedNode.catalogEntry.entryId), disabled: busyEntryId === selectedNode.catalogEntry.entryId || !selectedNode.catalogEntry.policyTrusted, children: selectedNode.catalogEntry.installed ? "UPDATE" : "INSTALL" }) })] })), selectedNode?.kind === "extension" && (_jsxs("div", { style: { display: "grid", gap: 12 }, children: [_jsx(ExtensionCard, { extension: selectedNode.extension, runtime: runtime, formatLabel: formatLabel, defaults: defaults }), installedIds.has(selectedNode.extension.id) && (_jsx("div", { className: "settings-action-row", style: { justifyContent: "flex-end", padding: 8 }, children: _jsx("button", { type: "button", className: "modal-btn", onClick: () => void removeInstalledExtension(selectedNode.extension.id), disabled: busyEntryId === selectedNode.extension.id, children: formatLabel(extensionManagerLabels.actionRemove) }) }))] }))] }));
    const catalogPane = (_jsxs("div", { className: "settings-card settings-card-stack", children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsx("span", { className: "settings-session-label", children: "CATALOG" }), _jsx("strong", { style: { fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(extensionManagerLabels.catalogEntriesTitle) })] }), _jsx("div", { style: { display: "grid", gap: 10 }, children: snapshot.catalogEntries.map((entry) => (_jsxs("div", { className: "settings-session-item", style: { alignItems: "start" }, children: [_jsxs("div", { style: { display: "grid", gap: 4 }, children: [_jsx("span", { className: "settings-session-label", children: formatLabel(entry.displayName) }), _jsxs("span", { className: "settings-session-value", children: [entry.packageName, "@", entry.version] })] }), _jsxs("div", { className: "settings-action-row", style: { padding: 8 }, children: [_jsx("button", { type: "button", className: "modal-btn", onClick: () => setBrowserState({ selectedNodeId: entry.entryId }), children: "INSPECT" }), _jsx("button", { type: "button", className: "modal-btn modal-btn-primary", onClick: () => void installCatalogEntry(entry.entryId), disabled: busyEntryId === entry.entryId || !entry.policyTrusted, children: entry.installed ? "UPDATE" : "INSTALL" })] })] }, entry.entryId))) })] }));
    return (_jsxs("div", { className: "extension-manager-pane editor-pane-container", "data-testid": "extension-manager-pane", role: "region", "aria-label": formatLabel(extensionManagerLabels.viewTitle), children: [isDragging && _jsx("div", { className: "editor-splitter-drag-shield" }), _jsxs("div", { className: "view-toolbar", "aria-label": "Extension Manager toolbar", children: [_jsxs("div", { className: "view-toolbar-group", children: [_jsx("button", { type: "button", className: `view-toolbar-btn ${effectiveSidebarOpen ? "active" : ""}`, title: "Toggle sidebar", onClick: () => embedBrowserInShellSidebar ? onShellSidebarToggle?.(!effectiveSidebarOpen) : setSidebarOpen((current) => !current), children: effectiveSidebarOpen ? _jsx(SidebarOpen, { size: 14 }) : _jsx(Sidebar, { size: 14 }) }), _jsx("button", { type: "button", className: `view-toolbar-btn ${layoutMode === "single" ? "active" : ""}`, title: "Single pane", onClick: () => setLayoutMode("single"), children: _jsx(Square, { size: 14 }) }), _jsx("button", { type: "button", className: `view-toolbar-btn ${layoutMode === "split" ? "active" : ""}`, title: "Split screen", onClick: () => setLayoutMode("split"), children: _jsx(SplitSquareHorizontal, { size: 14 }) })] }), _jsxs("div", { className: "view-toolbar-group", children: [_jsx("span", { className: "view-toolbar-divider" }), _jsx("button", { type: "button", className: "view-toolbar-btn", title: "Import extension package", onClick: () => importInput?.click(), children: _jsx(Upload, { size: 14 }) }), _jsx("button", { type: "button", className: "view-toolbar-btn", title: "Export catalog snapshot", onClick: () => downloadJson("extension-catalog-snapshot.json", snapshot.catalogEntries), disabled: snapshot.catalogEntries.length === 0, children: _jsx(Download, { size: 14 }) })] }), _jsxs("div", { className: "view-toolbar-group", style: { justifyContent: "flex-end" }, children: [_jsx("span", { className: "view-toolbar-divider" }), _jsx("button", { type: "button", className: "view-toolbar-btn", title: "Close manager", onClick: () => void close(), children: _jsx(X, { size: 14 }) })] })] }), _jsxs("div", { className: "editor-pane-shell", children: [_jsx("input", { ref: setImportInput, type: "file", accept: "application/json,.json", hidden: true, onChange: handleImportPortablePackage }), _jsxs("div", { className: "editor-pane-body is-split", children: [!embedBrowserInShellSidebar && sidebarOpen && (_jsxs("aside", { className: `workspace-sidebar editor-pane-column ${sidebarOpen ? "" : "is-collapsed"}`, style: { width: "min(320px, 28vw)", padding: 12, gap: 12 }, children: [_jsx(ExtensionManagerBrowserSidebar, { runtime: runtime, snapshot: snapshot, formatLabel: formatLabel }), error && _jsx("p", { style: { margin: 0, fontSize: 11, color: "var(--status-error)" }, children: error })] })), _jsxs("div", { className: "editor-pane-column", style: { flex: 1, padding: 16, gap: 16 }, children: [_jsx("div", { className: "settings-card settings-card-stack", style: { gap: 10 }, children: _jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }, children: [_jsxs("div", { style: { display: "grid", gap: 4 }, children: [_jsx("span", { className: "settings-session-label", children: "EXTENSION_MANAGER" }), _jsx("strong", { style: { fontSize: 14 }, children: formatLabel(extensionManagerLabels.headerTitle) }), _jsx("span", { style: { fontSize: 11, color: "var(--fg-muted)" }, children: formatLabel(extensionManagerLabels.headerSubtitle) })] }), _jsxs("div", { className: "settings-chip-row", children: [_jsx("span", { className: "settings-chip", children: "PANE_ONLY" }), _jsx("span", { className: "settings-chip", children: "SPLIT + SINGLE" }), _jsx("span", { className: "settings-chip", children: "SETTINGS_CONTENT" })] })] }) }), layoutMode === "split" ? (_jsxs("div", { ref: splitContainerRef, className: "editor-pane-body is-split", style: { background: "transparent" }, children: [_jsx("div", { className: `editor-pane-column editor-pane-column--split-left-${splitBand}`, style: { display: "grid", gap: 16, paddingRight: 12 }, children: detailsPane }), _jsx("div", { onMouseDown: startSplitDrag, className: `editor-splitter ${isDragging ? "dragging" : ""}`, role: "separator", "aria-orientation": "vertical", "aria-label": "Resize Extension Manager panes", children: _jsx("div", { className: "editor-splitter-handle" }) }), _jsx("div", { className: `editor-pane-column editor-pane-column--split-right-${100 - splitBand}`, style: { display: "grid", gap: 16, paddingLeft: 12 }, children: _jsxs("div", { className: "settings-card settings-card-stack", children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsx("span", { className: "settings-session-label", children: "CATALOG" }), _jsx("strong", { style: { fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }, children: "Catalog Browser" })] }), catalogPane] }) })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { style: { display: "grid", gap: 16 }, children: detailsPane }), catalogPane] }))] })] })] })] }));
};
//# sourceMappingURL=ExtensionManagerView.js.map