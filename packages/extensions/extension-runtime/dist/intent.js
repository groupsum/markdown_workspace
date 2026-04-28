const hasCapability = (capabilities, capability) => capabilities.includes(capability);
const toWorkflow = (extension) => {
    const id = extension.id;
    if (id.includes("workspace-files"))
        return ["Open or import markdown", "Edit with preview", "Save or export"];
    if (id.includes("git-ops"))
        return ["Review repository state", "Refresh changes", "Inspect and resolve"];
    if (id.includes("theme-studio"))
        return ["Select token or class", "Edit and preview", "Apply or export theme"];
    if (id.includes("language-pack-studio"))
        return ["Select locale", "Fill missing tokens", "Save, enable, or export"];
    if (id.includes("gemini-agent"))
        return ["Configure provider", "Generate a draft", "Review before writeback"];
    if (id.includes("extension-manager"))
        return ["Inspect extensions", "Review trust and health", "Install, repair, or disable"];
    return ["Open extension", "Review state", "Act on available commands"];
};
const toSafeAction = (extension) => {
    if (!extension.enabled)
        return "Enable when needed";
    if (extension.status === "error")
        return "Review recovery actions";
    if (extension.status === "incompatible")
        return "Review compatibility";
    if (extension.status === "active")
        return "Open workspace view";
    return "Activate extension";
};
const toDangerousAction = (capabilities) => {
    if (hasCapability(capabilities, "editor.write"))
        return "Can write draft or generated content back into the editor";
    if (hasCapability(capabilities, "workspace.write"))
        return "Can write workspace files";
    if (hasCapability(capabilities, "theme.write"))
        return "Can apply theme drafts";
    if (hasCapability(capabilities, "network.fetch"))
        return "Can send network requests";
    return null;
};
const toTrust = (extension) => {
    if (extension.source === "bundled") {
        return {
            label: "Bundled",
            level: "safe",
            detail: "Shipped with the Markdown Workspace host.",
        };
    }
    if (extension.verification?.signatureVerified) {
        return {
            label: "Signed",
            level: "safe",
            detail: `Signature verified${extension.verification.signerKeyId ? ` by ${extension.verification.signerKeyId}` : ""}.`,
        };
    }
    if (extension.verification?.integrityVerified) {
        return {
            label: "Integrity only",
            level: "review",
            detail: "Artifact integrity was verified, but no trusted signature is attached.",
        };
    }
    return {
        label: "Unverified",
        level: "danger",
        detail: "No trusted signature or integrity verification is attached.",
    };
};
const toCapabilitySummary = (capabilities) => {
    const summary = [];
    if (hasCapability(capabilities, "workspace.read") || hasCapability(capabilities, "editor.read"))
        summary.push("Reads markdown context");
    if (hasCapability(capabilities, "workspace.write") || hasCapability(capabilities, "editor.write"))
        summary.push("Can write markdown content");
    if (hasCapability(capabilities, "selection.read"))
        summary.push("Uses current selection");
    if (hasCapability(capabilities, "network.fetch"))
        summary.push("Uses network");
    if (hasCapability(capabilities, "settings.read") || hasCapability(capabilities, "settings.write"))
        summary.push("Uses settings");
    if (hasCapability(capabilities, "theme.read") || hasCapability(capabilities, "theme.write"))
        summary.push("Uses theme tokens");
    if (summary.length === 0)
        summary.push("No content permissions declared");
    return summary;
};
const toRecoveryActions = (extension) => {
    const actions = [];
    if (!extension.compatibility.compatible)
        actions.push("Review host/runtime compatibility requirements");
    if (extension.missingCapabilities.length > 0)
        actions.push("Review denied capabilities");
    if (extension.lastError || extension.diagnostics.length > 0)
        actions.push("Retry activation or disable the extension");
    if (extension.manifest.settingsSchema)
        actions.push("Open extension settings");
    if (extension.source === "installed" && extension.verification?.signatureVerified !== true)
        actions.push("Review external extension trust policy");
    if (actions.length === 0)
        actions.push("No recovery action required");
    return actions;
};
export function deriveExtensionIntent(extension) {
    const capabilities = extension.manifest.capabilities ?? [];
    return {
        purpose: extension.manifest.description.defaultMessage,
        primaryWorkflow: toWorkflow(extension),
        safeDefaultAction: toSafeAction(extension),
        dangerousAction: toDangerousAction(capabilities),
        contentAccess: {
            readsWorkspace: hasCapability(capabilities, "workspace.read"),
            writesWorkspace: hasCapability(capabilities, "workspace.write"),
            readsEditor: hasCapability(capabilities, "editor.read"),
            writesEditor: hasCapability(capabilities, "editor.write"),
            readsSelection: hasCapability(capabilities, "selection.read"),
        },
        networkAccess: hasCapability(capabilities, "network.fetch"),
        persistenceAccess: hasCapability(capabilities, "settings.read") || hasCapability(capabilities, "settings.write"),
        trust: toTrust(extension),
        capabilitySummary: toCapabilitySummary(capabilities),
        recoveryActions: toRecoveryActions(extension),
    };
}
//# sourceMappingURL=intent.js.map
