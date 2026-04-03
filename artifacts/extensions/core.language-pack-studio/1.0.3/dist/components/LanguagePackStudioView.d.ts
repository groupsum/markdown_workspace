import { type FC } from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import type { LanguagePackStudioController } from "../types.js";
export interface LanguagePackStudioViewProps {
    readonly controller: LanguagePackStudioController;
    readonly close: () => Promise<void>;
    readonly formatLabel: (label: I18nLabel | string) => string;
    readonly shellSidebarOpen?: boolean;
    readonly onShellSidebarToggle?: (open: boolean) => void;
    readonly embedBrowserInShellSidebar?: boolean;
}
export declare const LanguagePackStudioSidebar: FC<Pick<LanguagePackStudioViewProps, "controller">>;
export declare const LanguagePackStudioView: FC<LanguagePackStudioViewProps>;
//# sourceMappingURL=LanguagePackStudioView.d.ts.map