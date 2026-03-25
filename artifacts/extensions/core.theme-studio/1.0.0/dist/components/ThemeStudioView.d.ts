import type { I18nLabel } from "@mdwrk/extension-manifest";
import type { ThemeStudioService } from "../types.js";
export interface ThemeStudioViewProps {
    readonly service: ThemeStudioService;
    readonly close: () => Promise<void>;
    readonly formatLabel: (label: I18nLabel | string) => string;
}
export declare const ThemeStudioView: React.FC<ThemeStudioViewProps>;
//# sourceMappingURL=ThemeStudioView.d.ts.map