import { type ExtensionManifest } from "@mdwrk/extension-manifest";
import type { ExtensionRuntimeCompatibilityResult } from "./types.js";
interface CompatibilityContext {
    readonly hostApiVersion: string;
    readonly hostVersion: string;
    readonly runtimeVersion: string;
    readonly themeContractVersion: string;
}
export declare function satisfiesVersionRange(actual: string, range: string | number | undefined): boolean;
export declare function evaluateExtensionCompatibility(manifest: ExtensionManifest, context?: CompatibilityContext): ExtensionRuntimeCompatibilityResult;
export {};
//# sourceMappingURL=compatibility.d.ts.map