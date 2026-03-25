import type { ExtensionManifest } from "@mdwrk/extension-manifest";
import type { ExtensionContext } from "./context.js";
import type { Disposable, MaybePromise } from "./primitives.js";
export interface ExtensionActivationResult {
    readonly dispose?: Disposable;
}
export type ActivateExtension = (context: ExtensionContext) => MaybePromise<void | Disposable | ExtensionActivationResult>;
export type DeactivateExtension = (context: ExtensionContext) => MaybePromise<void>;
export interface MarkdownWorkspaceExtension {
    readonly manifest: ExtensionManifest;
    activate: ActivateExtension;
    deactivate?: DeactivateExtension;
}
//# sourceMappingURL=lifecycle.d.ts.map