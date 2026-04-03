import { type FC } from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import type { ThemeStudioService } from "../types.js";
export interface ThemeStudioViewProps {
    readonly service: ThemeStudioService;
    readonly close: () => Promise<void>;
    readonly formatLabel: (label: I18nLabel | string) => string;
    readonly shellSidebarOpen?: boolean;
    readonly onShellSidebarToggle?: (open: boolean) => void;
    readonly embedBrowserInShellSidebar?: boolean;
}
export declare const ThemeStudioSidebar: FC<Pick<ThemeStudioViewProps, "service" | "formatLabel">>;
export declare const ThemeStudioView: FC<ThemeStudioViewProps>;
//# sourceMappingURL=ThemeStudioView.d.ts.map