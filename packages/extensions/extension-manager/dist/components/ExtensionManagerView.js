import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortableExtensionCatalogRegistration, normalizePortableExtensionPackageArtifact, } from "@mdwrk/extension-runtime";
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
export const ExtensionManagerView = ({ runtime, close, formatLabel, defaultSettings, }) => {
    const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
    const defaults = useMemo(() => ({
        showCompatibility: defaultSettings?.showCompatibility ?? true,
        showDiagnostics: defaultSettings?.showDiagnostics ?? true,
    }), [defaultSettings]);
    const [importInput, setImportInput] = useState(null);
    const [busyEntryId, setBusyEntryId] = useState(null);
    const [error, setError] = useState(null);
    const [treeState, setTreeState] = useState({ extensions: true, catalog: true });
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [layoutMode, setLayoutMode] = useState("split");
    const installedIds = useMemo(() => new Set(snapshot.extensions.filter((extension) => extension.source === "installed").map((extension) => extension.id)), [snapshot.extensions]);
    const browserNodes = useMemo(() => createBrowserNodes(snapshot, formatLabel), [snapshot, formatLabel]);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    useEffect(() => {
        if (selectedNodeId && [...browserNodes.extensions, ...browserNodes.catalogEntries].some((node) => node.id === selectedNodeId)) {
            return;
        }
        setSelectedNodeId(browserNodes.extensions[0]?.id ?? browserNodes.catalogEntries[0]?.id ?? null);
    }, [browserNodes.catalogEntries, browserNodes.extensions, selectedNodeId]);
    const selectedNode = useMemo(() => [...browserNodes.extensions, ...browserNodes.catalogEntries].find((node) => node.id === selectedNodeId) ?? null, [browserNodes.catalogEntries, browserNodes.extensions, selectedNodeId]);
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
    const catalogPane = (_jsxs("div", { className: "settings-card settings-card-stack", children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsx("span", { className: "settings-session-label", children: "CATALOG" }), _jsx("strong", { style: { fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(extensionManagerLabels.catalogEntriesTitle) })] }), _jsx("div", { style: { display: "grid", gap: 10 }, children: snapshot.catalogEntries.map((entry) => (_jsxs("div", { className: "settings-session-item", style: { alignItems: "start" }, children: [_jsxs("div", { style: { display: "grid", gap: 4 }, children: [_jsx("span", { className: "settings-session-label", children: formatLabel(entry.displayName) }), _jsxs("span", { className: "settings-session-value", children: [entry.packageName, "@", entry.version] })] }), _jsxs("div", { className: "settings-action-row", style: { padding: 8 }, children: [_jsx("button", { type: "button", className: "modal-btn", onClick: () => setSelectedNodeId(entry.entryId), children: "INSPECT" }), _jsx("button", { type: "button", className: "modal-btn modal-btn-primary", onClick: () => void installCatalogEntry(entry.entryId), disabled: busyEntryId === entry.entryId || !entry.policyTrusted, children: entry.installed ? "UPDATE" : "INSTALL" })] })] }, entry.entryId))) })] }));
    return (_jsxs("div", { className: "extension-manager-pane editor-pane-container", "data-testid": "extension-manager-pane", role: "region", "aria-label": formatLabel(extensionManagerLabels.viewTitle), children: [_jsx("div", { className: "view-toolbar", "aria-label": "Extension Manager toolbar", children: _jsxs("div", { className: "view-toolbar-group", children: [_jsx("button", { type: "button", className: `view-toolbar-btn ${sidebarOpen ? "active" : ""}`, title: "Toggle sidebar", onClick: () => setSidebarOpen((current) => !current), children: "SB" }), _jsx("button", { type: "button", className: `view-toolbar-btn ${layoutMode === "single" ? "active" : ""}`, title: "Single pane", onClick: () => setLayoutMode("single"), children: "1P" }), _jsx("button", { type: "button", className: `view-toolbar-btn ${layoutMode === "split" ? "active" : ""}`, title: "Split screen", onClick: () => setLayoutMode("split"), children: "2P" }), _jsx("span", { className: "view-toolbar-divider" }), _jsx("button", { type: "button", className: "view-toolbar-btn", title: "Import extension package", onClick: () => importInput?.click(), children: "IMP" }), _jsx("button", { type: "button", className: "view-toolbar-btn", title: "Export catalog snapshot", onClick: () => downloadJson("extension-catalog-snapshot.json", snapshot.catalogEntries), disabled: snapshot.catalogEntries.length === 0, children: "EXP" }), _jsx("span", { className: "view-toolbar-divider" }), _jsx("button", { type: "button", className: "view-toolbar-btn", title: "Close manager", onClick: () => void close(), children: "CLOSE" })] }) }), _jsxs("div", { className: "editor-pane-shell", children: [_jsx("input", { ref: setImportInput, type: "file", accept: "application/json,.json", hidden: true, onChange: handleImportPortablePackage }), _jsxs("div", { className: "editor-pane-body is-split", children: [sidebarOpen && (_jsxs("aside", { className: "editor-pane-column", style: { width: "min(320px, 28vw)", borderRight: "1px solid var(--border-color)", padding: 12, gap: 12 }, children: [_jsxs("div", { className: "settings-card settings-card-stack", children: [_jsx(StatsGrid, { snapshot: snapshot, formatLabel: formatLabel }), error && _jsx("p", { style: { margin: 0, fontSize: 11, color: "var(--status-error)" }, children: error })] }), _jsxs("div", { className: "settings-card settings-card-stack", style: { gap: 12 }, children: [_jsxs("details", { open: treeState.extensions, onToggle: (event) => {
                                                    const nextOpen = event.currentTarget.open;
                                                    setTreeState((current) => ({ ...current, extensions: nextOpen }));
                                                }, children: [_jsx("summary", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }, children: formatLabel(extensionManagerLabels.paneTreeExtensions) }), _jsx("div", { style: { display: "grid", gap: 6, marginTop: 8 }, children: browserNodes.extensions.map((node) => (_jsxs("button", { type: "button", className: `settings-sidebar-btn ${selectedNodeId === node.id ? "active" : ""}`, onClick: () => setSelectedNodeId(node.id), style: { justifyContent: "space-between" }, children: [_jsx("span", { style: { textAlign: "left" }, children: node.title }), _jsx("span", { className: "settings-session-label", children: node.extension.status })] }, node.id))) })] }), _jsxs("details", { open: treeState.catalog, onToggle: (event) => {
                                                    const nextOpen = event.currentTarget.open;
                                                    setTreeState((current) => ({ ...current, catalog: nextOpen }));
                                                }, children: [_jsx("summary", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }, children: formatLabel(extensionManagerLabels.paneTreeCatalog) }), _jsxs("div", { style: { display: "grid", gap: 6, marginTop: 8 }, children: [browserNodes.catalogEntries.length === 0 && _jsx("span", { className: "text-[11px] text-[var(--fg-muted)]", children: formatLabel(extensionManagerLabels.emptyCatalog) }), browserNodes.catalogEntries.map((node) => (_jsxs("button", { type: "button", className: `settings-sidebar-btn ${selectedNodeId === node.id ? "active" : ""}`, onClick: () => setSelectedNodeId(node.id), style: { justifyContent: "space-between" }, children: [_jsx("span", { style: { textAlign: "left" }, children: node.title }), _jsx("span", { className: "settings-session-label", children: node.catalogEntry.installed ? "INSTALLED" : "CATALOG" })] }, node.id)))] })] })] })] })), _jsxs("div", { className: "editor-pane-column", style: { flex: 1, padding: 16, gap: 16 }, children: [_jsx("div", { className: "settings-card settings-card-stack", style: { gap: 10 }, children: _jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }, children: [_jsxs("div", { style: { display: "grid", gap: 4 }, children: [_jsx("span", { className: "settings-session-label", children: "EXTENSION_MANAGER" }), _jsx("strong", { style: { fontSize: 14 }, children: formatLabel(extensionManagerLabels.headerTitle) }), _jsx("span", { style: { fontSize: 11, color: "var(--fg-muted)" }, children: formatLabel(extensionManagerLabels.headerSubtitle) })] }), _jsxs("div", { className: "settings-action-row", style: { padding: 8, gap: 8 }, children: [_jsx("button", { type: "button", className: "modal-btn", onClick: () => importInput?.click(), children: formatLabel(extensionManagerLabels.actionImport) }), _jsx("button", { type: "button", className: "modal-btn", onClick: () => downloadJson("extension-catalog-snapshot.json", snapshot.catalogEntries), disabled: snapshot.catalogEntries.length === 0, children: formatLabel(extensionManagerLabels.actionExport) })] })] }) }), _jsxs("div", { style: { display: "grid", gap: 16, gridTemplateColumns: layoutMode === "split" ? "minmax(0, 1.1fr) minmax(320px, 0.9fr)" : "minmax(0, 1fr)" }, children: [_jsx("div", { style: { display: "grid", gap: 16 }, children: detailsPane }), layoutMode === "split" && (_jsx("div", { style: { display: "grid", gap: 16 }, children: _jsxs("div", { className: "settings-card settings-card-stack", children: [_jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [_jsx("span", { className: "settings-session-label", children: "CATALOG" }), _jsx("strong", { style: { fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }, children: "Catalog Browser" })] }), catalogPane] }) }))] }), layoutMode === "single" && catalogPane] })] })] })] }));
};
//# sourceMappingURL=ExtensionManagerView.js.map