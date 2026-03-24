import type { I18nLabel } from "@markdown-workspace/extension-manifest";
import type { ExtensionRuntime, ExtensionRuntimeExtensionSnapshot } from "@markdown-workspace/extension-runtime";
export interface ExtensionCardProps {
    readonly extension: ExtensionRuntimeExtensionSnapshot;
    readonly runtime: ExtensionRuntime;
    readonly formatLabel: (label: I18nLabel | string) => string;
    readonly defaults: {
        readonly showCompatibility: boolean;
        readonly showDiagnostics: boolean;
    };
}
export declare const ExtensionCard: React.FC<ExtensionCardProps>;
//# sourceMappingURL=ExtensionCard.d.ts.map