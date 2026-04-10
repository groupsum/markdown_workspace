import type { I18nLabel } from "@mdwrk/extension-manifest";
import type { ExtensionRuntime } from "@mdwrk/extension-runtime";
export interface ExtensionManagerSettingsPanelProps {
    readonly runtime: ExtensionRuntime;
    readonly open: () => Promise<void>;
    readonly formatLabel: (label: I18nLabel | string) => string;
}
export declare const ExtensionManagerSettingsPanel: React.FC<ExtensionManagerSettingsPanelProps>;
//# sourceMappingURL=ExtensionManagerSettingsPanel.d.ts.map