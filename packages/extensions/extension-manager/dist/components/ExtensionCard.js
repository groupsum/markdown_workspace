import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { AlertTriangle, CheckCircle2, ChevronsUpDown, CircleSlash2, Power, PowerOff } from "lucide-react";
import { extensionManagerLabels } from "../i18n.js";
import { ExtensionManifestIcon } from "./ExtensionManifestIcon.js";
import { ExtensionStatusBadge } from "./ExtensionStatusBadge.js";
import { SettingsSchemaForm } from "./SettingsSchemaForm.js";
const detailSummaryStyle = {
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
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
export const ExtensionCard = ({ extension, runtime, formatLabel, defaults }) => {
    const [showCompatibility, setShowCompatibility] = React.useState(defaults.showCompatibility || !extension.compatibility.compatible);
    const [showDiagnostics, setShowDiagnostics] = React.useState(defaults.showDiagnostics || extension.status === "error");
    const [showSettings, setShowSettings] = React.useState(false);
    const [busy, setBusy] = React.useState(false);
    React.useEffect(() => {
        if (!extension.compatibility.compatible) {
            setShowCompatibility(true);
        }
        if (extension.status === "error") {
            setShowDiagnostics(true);
        }
    }, [extension.compatibility.compatible, extension.status]);
    const toggleEnabled = async () => {
        setBusy(true);
        try {
            await runtime.setEnabled(extension.id, !extension.enabled);
        }
        finally {
            setBusy(false);
        }
    };
    const activate = async () => {
        setBusy(true);
        try {
            await runtime.activate(extension.id);
        }
        finally {
            setBusy(false);
        }
    };
    const deactivate = async () => {
        setBusy(true);
        try {
            await runtime.deactivate(extension.id);
        }
        finally {
            setBusy(false);
        }
    };
    const stopSummaryToggle = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };
    const enableLabel = formatLabel(extensionManagerLabels.actionEnable);
    const disableLabel = formatLabel(extensionManagerLabels.actionDisable);
    const activateLabel = formatLabel(extensionManagerLabels.actionActivate);
    const deactivateLabel = formatLabel(extensionManagerLabels.actionDeactivate);
    return (_jsx("article", { className: "settings-card settings-card-stack", style: { display: "grid", gap: 14 }, children: _jsxs("details", { open: true, style: { display: "grid", gap: 12 }, children: [_jsx("summary", { style: { listStyle: "none", cursor: "pointer" }, children: _jsxs("header", { style: { display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "start" }, children: [_jsx("div", { style: { display: "inline-flex", width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center", border: "1px solid var(--border-primary)" }, children: _jsx(ExtensionManifestIcon, { icon: extension.manifest.icon, size: 18 }) }), _jsxs("div", { style: { display: "grid", gap: 4 }, children: [_jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }, children: [_jsx("strong", { style: { fontSize: 14 }, children: formatLabel(extension.manifest.displayName) }), _jsx("span", { style: pillStyle, children: extension.source === "bundled" ? formatLabel(extensionManagerLabels.sourceBundled) : formatLabel(extensionManagerLabels.sourceInstalled) }), _jsx(ExtensionStatusBadge, { status: extension.status })] }), _jsx("span", { style: { fontSize: 11, color: "var(--fg-muted)" }, children: extension.id }), _jsx("p", { style: { margin: 0, fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.6 }, children: formatLabel(extension.manifest.description) })] }), _jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }, children: [_jsx("button", { className: "modal-btn", onClick: (event) => { stopSummaryToggle(event); void toggleEnabled(); }, disabled: busy, "aria-label": `${extension.enabled ? disableLabel : enableLabel} ${extension.id}`, title: extension.enabled ? disableLabel : enableLabel, children: extension.enabled ? _jsx(PowerOff, { size: 14 }) : _jsx(Power, { size: 14 }) }), _jsx("button", { className: "modal-btn modal-btn-primary", onClick: (event) => { stopSummaryToggle(event); void activate(); }, disabled: busy || !extension.enabled, "aria-label": `${activateLabel} ${extension.id}`, title: activateLabel, children: _jsx(CheckCircle2, { size: 14 }) }), _jsx("button", { className: "modal-btn", onClick: (event) => { stopSummaryToggle(event); void deactivate(); }, disabled: busy || extension.status !== "active", "aria-label": `${deactivateLabel} ${extension.id}`, title: deactivateLabel, children: _jsx(CircleSlash2, { size: 14 }) })] })] }) }), _jsxs("div", { className: "settings-session-grid", children: [_jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: formatLabel(extensionManagerLabels.labelPackage) }), _jsx("span", { className: "settings-session-value", children: extension.manifest.packageName })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: formatLabel(extensionManagerLabels.labelVersion) }), _jsx("span", { className: "settings-session-value", children: extension.manifest.version })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: formatLabel(extensionManagerLabels.labelActivation) }), _jsx("span", { className: "settings-session-value", children: extension.activation })] }), _jsxs("div", { className: "settings-session-item", children: [_jsx("span", { className: "settings-session-label", children: formatLabel(extensionManagerLabels.labelEnabled) }), _jsx("span", { className: "settings-session-value", children: extension.enabled ? formatLabel(extensionManagerLabels.stateEnabled) : formatLabel(extensionManagerLabels.stateDisabled) })] })] }), _jsxs("section", { style: { display: "grid", gap: 8 }, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(extensionManagerLabels.labelPermissions) }), _jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [extension.grantedCapabilities.map((capability) => (_jsxs("span", { style: pillStyle, children: [_jsx(CheckCircle2, { size: 12 }), " ", capability] }, `granted-${capability}`))), extension.missingCapabilities.map((capability) => (_jsxs("span", { style: pillStyle, children: [_jsx(CircleSlash2, { size: 12 }), " ", capability] }, `missing-${capability}`)))] })] }), _jsxs("details", { open: showCompatibility, onToggle: (event) => setShowCompatibility(event.currentTarget.open), children: [_jsxs("summary", { style: detailSummaryStyle, children: [_jsx(ChevronsUpDown, { size: 12, style: { display: "inline-flex", marginRight: 6 } }), formatLabel(extensionManagerLabels.labelCompatibility)] }), _jsxs("div", { style: { display: "grid", gap: 8, marginTop: 10 }, children: [_jsx("p", { style: { margin: 0, fontSize: 12, color: "var(--fg-secondary)" }, children: extension.compatibility.compatible ? formatLabel(extensionManagerLabels.compatibilityOk) : formatLabel(extensionManagerLabels.compatibilityError) }), !extension.compatibility.compatible && (_jsx("ul", { style: { margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--fg-secondary)", display: "grid", gap: 6 }, children: extension.compatibility.issues.map((issue, index) => (_jsx("li", { children: issue.message }, `${issue.target}-${index}`))) }))] })] }), _jsxs("details", { open: showDiagnostics, onToggle: (event) => setShowDiagnostics(event.currentTarget.open), children: [_jsxs("summary", { style: detailSummaryStyle, children: [_jsx(ChevronsUpDown, { size: 12, style: { display: "inline-flex", marginRight: 6 } }), formatLabel(extensionManagerLabels.labelHealth)] }), _jsxs("div", { style: { display: "grid", gap: 8, marginTop: 10 }, children: [extension.lastError && (_jsxs("div", { style: { display: "grid", gap: 4 }, children: [_jsxs("span", { style: { ...pillStyle, width: "fit-content" }, children: [_jsx(AlertTriangle, { size: 12 }), " ", formatLabel(extensionManagerLabels.lastError)] }), _jsx("p", { style: { margin: 0, fontSize: 12, color: "var(--fg-secondary)" }, children: extension.lastError.message })] })), extension.diagnostics.length > 0 ? (_jsx("ul", { style: { margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--fg-secondary)", display: "grid", gap: 6 }, children: extension.diagnostics.map((record, index) => (_jsxs("li", { children: [record.code, ": ", record.message] }, `${record.code}-${index}`))) })) : !extension.lastError ? (_jsx("p", { style: { margin: 0, fontSize: 12, color: "var(--fg-muted)" }, children: formatLabel(extensionManagerLabels.noDiagnostics) })) : null] })] }), extension.manifest.settingsSchema && (_jsxs("details", { open: showSettings, onToggle: (event) => setShowSettings(event.currentTarget.open), children: [_jsxs("summary", { style: detailSummaryStyle, children: [_jsx(ChevronsUpDown, { size: 12, style: { display: "inline-flex", marginRight: 6 } }), formatLabel(extensionManagerLabels.labelSettings)] }), _jsx("div", { style: { marginTop: 10 }, children: _jsx(SettingsSchemaForm, { runtime: runtime, extensionId: extension.id, schema: extension.manifest.settingsSchema, formatLabel: formatLabel }) })] }))] }) }));
};
//# sourceMappingURL=ExtensionCard.js.map