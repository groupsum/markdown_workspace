import React from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import type { LanguagePackStudioController } from "../types.js";
export interface LanguagePackStudioSettingsPanelProps {
    readonly controller: LanguagePackStudioController;
    readonly open: () => Promise<void>;
    readonly formatLabel: (label: I18nLabel | string) => string;
}
export declare const LanguagePackStudioSettingsPanel: React.FC<LanguagePackStudioSettingsPanelProps>;
//# sourceMappingURL=LanguagePackStudioSettingsPanel.d.ts.map