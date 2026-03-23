import { THEME_CONTRACT_VERSION } from "./version.js";
export function createEmptyThemePreset(id, name) {
    return {
        metadata: { id, name },
        compatibility: { contract: THEME_CONTRACT_VERSION },
        tokens: {},
    };
}
//# sourceMappingURL=themes.js.map