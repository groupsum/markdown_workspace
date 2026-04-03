import type { I18nLabel } from "@mdwrk/extension-manifest";
import type { ThemeStudioService } from "../types.js";
export interface ThemeStudioSettingsPanelProps {
    readonly service: ThemeStudioService;
    readonly open: () => Promise<void>;
    readonly formatLabel: (label: I18nLabel | string) => string;
}
export declare const ThemeStudioSettingsPanel: React.FC<ThemeStudioSettingsPanelProps>;
//# sourceMappingURL=ThemeStudioSettingsPanel.d.ts.map