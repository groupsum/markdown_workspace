import type { ExtensionSettingsSchema, I18nLabel } from "@mdwrk/extension-manifest";
import type { ExtensionRuntime } from "@mdwrk/extension-runtime";
export interface SettingsSchemaFormProps {
    readonly runtime: ExtensionRuntime;
    readonly extensionId: string;
    readonly schema: ExtensionSettingsSchema;
    readonly formatLabel: (label: I18nLabel | string) => string;
}
export declare const SettingsSchemaForm: React.FC<SettingsSchemaFormProps>;
//# sourceMappingURL=SettingsSchemaForm.d.ts.map