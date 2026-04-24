export const CAPABILITY_PRESETS = [
    {
        id: "workspace.module.standard",
        title: "Standard workspace module",
        description: "Baseline module shape for action-rail launch, main pane, explorer/sidebar, toolbar, and settings.",
        profileIds: ["workspace.module.base"],
        recommendedCapabilities: ["view.register", "actionRail.register", "settings.read", "settings.write"],
        requiredContributionKinds: ["views", "workspaceModules", "actionRail", "settingsSections"],
        notes: [
            "Presets are advisory composition metadata.",
            "Runtime permissions are still controlled by declared and host-granted capabilities.",
        ],
    },
    {
        id: "workspace.module.reader",
        title: "Reader workspace module",
        description: "Standard module that reads workspace/editor context.",
        profileIds: ["workspace.module.base", "workspace.module.read"],
        recommendedCapabilities: ["view.register", "actionRail.register", "settings.read", "settings.write", "workspace.read", "editor.read", "selection.read"],
        requiredContributionKinds: ["views", "workspaceModules", "actionRail", "settingsSections"],
        notes: ["Use when a module inspects files, active documents, selections, or workspace context."],
    },
    {
        id: "workspace.module.writer",
        title: "Writer workspace module",
        description: "Reader module that can write workspace files or editor content.",
        profileIds: ["workspace.module.base", "workspace.module.read", "workspace.module.write"],
        recommendedCapabilities: ["view.register", "actionRail.register", "settings.read", "settings.write", "workspace.read", "workspace.write", "editor.read", "editor.write", "selection.read"],
        requiredContributionKinds: ["views", "workspaceModules", "actionRail", "settingsSections"],
        notes: ["Use for editors, previewers with writeback, import/export tools, and authoring modules."],
    },
    {
        id: "workspace.module.provider",
        title: "Provider workspace module",
        description: "Standard module that owns provider/auth/config surfaces.",
        profileIds: ["workspace.module.base", "workspace.module.provider"],
        recommendedCapabilities: ["view.register", "actionRail.register", "settings.read", "settings.write", "workspace.read", "network.fetch"],
        requiredContributionKinds: ["views", "workspaceModules", "actionRail", "settingsSections"],
        notes: ["Use for source-control, AI, catalog, or integration modules that broker external/provider state."],
    },
    {
        id: "workspace.module.diagnostics",
        title: "Diagnostics workspace module",
        description: "Standard module that reports status, diagnostics, or operational health.",
        profileIds: ["workspace.module.base", "workspace.module.diagnostics"],
        recommendedCapabilities: ["view.register", "actionRail.register", "settings.read", "settings.write", "notification.publish"],
        requiredContributionKinds: ["views", "workspaceModules", "actionRail", "settingsSections"],
        notes: ["Use when a module surfaces health/status signals or user-facing diagnostics."],
    },
];
const CAPABILITY_PRESET_BY_ID = new Map(CAPABILITY_PRESETS.map((preset) => [preset.id, preset]));
function appendUnique(target, values) {
    for (const value of values) {
        if (!target.includes(value)) {
            target.push(value);
        }
    }
}
function getWorkspaceModuleProfileIds(manifest) {
    const profileIds = [];
    for (const module of manifest.contributions.workspaceModules ?? []) {
        appendUnique(profileIds, module.capabilityProfiles);
    }
    return profileIds;
}
export function getCapabilityPresetDescriptor(id) {
    const descriptor = CAPABILITY_PRESET_BY_ID.get(id);
    if (!descriptor) {
        throw new Error(`Unknown capability preset: ${id}`);
    }
    return descriptor;
}
export function composeCapabilityPresetSet(ids) {
    const normalizedIds = [];
    const profileIds = [];
    const recommendedCapabilities = [];
    const requiredContributionKinds = [];
    const notes = [];
    for (const id of ids) {
        if (normalizedIds.includes(id)) {
            continue;
        }
        const preset = getCapabilityPresetDescriptor(id);
        normalizedIds.push(id);
        appendUnique(profileIds, preset.profileIds);
        appendUnique(recommendedCapabilities, preset.recommendedCapabilities);
        appendUnique(requiredContributionKinds, preset.requiredContributionKinds);
        appendUnique(notes, preset.notes);
    }
    return {
        ids: normalizedIds,
        profileIds,
        recommendedCapabilities,
        requiredContributionKinds,
        notes,
    };
}
export function recommendCapabilityPresets(manifest) {
    if (!manifest.contributions.workspaceModules?.length) {
        return [];
    }
    const profileIds = new Set(getWorkspaceModuleProfileIds(manifest));
    const recommendations = [];
    const add = (id) => {
        if (!recommendations.includes(id)) {
            recommendations.push(id);
        }
    };
    if (profileIds.has("workspace.module.write")) {
        add("workspace.module.writer");
    }
    else if (profileIds.has("workspace.module.read")) {
        add("workspace.module.reader");
    }
    else {
        add("workspace.module.standard");
    }
    if (profileIds.has("workspace.module.provider")) {
        add("workspace.module.provider");
    }
    if (profileIds.has("workspace.module.diagnostics")) {
        add("workspace.module.diagnostics");
    }
    return recommendations;
}
export function evaluateCapabilityPresetSet(manifest, ids) {
    const knownIds = [];
    const gaps = [];
    for (const id of ids) {
        if (!CAPABILITY_PRESET_BY_ID.has(id)) {
            gaps.push({
                kind: "unknown-preset",
                id,
                presetId: id,
                message: `Unknown capability preset '${id}'.`,
            });
            continue;
        }
        knownIds.push(id);
    }
    const composition = composeCapabilityPresetSet(knownIds);
    const declaredCapabilities = new Set(manifest.capabilities);
    const declaredProfiles = new Set(getWorkspaceModuleProfileIds(manifest));
    for (const capability of composition.recommendedCapabilities) {
        if (!declaredCapabilities.has(capability)) {
            gaps.push({
                kind: "missing-capability",
                id: capability,
                message: `Recommended capability '${capability}' is not declared.`,
            });
        }
    }
    for (const profileId of composition.profileIds) {
        if (!declaredProfiles.has(profileId)) {
            gaps.push({
                kind: "missing-profile",
                id: profileId,
                message: `Recommended workspace-module profile '${profileId}' is not declared.`,
            });
        }
    }
    for (const contributionKind of composition.requiredContributionKinds) {
        if ((manifest.contributions[contributionKind]?.length ?? 0) === 0) {
            gaps.push({
                kind: "missing-contribution",
                id: contributionKind,
                message: `Recommended contribution kind '${contributionKind}' is missing.`,
            });
        }
    }
    return { ids, composition, gaps };
}
//# sourceMappingURL=presets.js.map