import { type FC } from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import { type ExtensionRuntime } from "@mdwrk/extension-runtime";
export interface ExtensionManagerViewProps {
    readonly runtime: ExtensionRuntime;
    readonly close: () => Promise<void>;
    readonly formatLabel: (label: I18nLabel | string) => string;
    readonly defaultSettings?: {
        readonly showCompatibility?: boolean;
        readonly showDiagnostics?: boolean;
    };
}
export declare const ExtensionManagerView: FC<ExtensionManagerViewProps>;
//# sourceMappingURL=ExtensionManagerView.d.ts.map