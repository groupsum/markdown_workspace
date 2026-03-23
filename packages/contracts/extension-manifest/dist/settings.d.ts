import type { I18nLabel } from "./i18n.js";
export declare const EXTENSION_SETTING_FIELD_KINDS: readonly ["boolean", "string", "number", "integer", "select", "multiselect", "secret", "json"];
export type ExtensionSettingFieldKind = typeof EXTENSION_SETTING_FIELD_KINDS[number];
export type ExtensionSettingScope = "user" | "workspace" | "session";
export interface ExtensionSettingOption {
    readonly value: string;
    readonly label: I18nLabel;
    readonly description?: I18nLabel;
}
export interface ExtensionSettingsSection {
    readonly id: string;
    readonly title: I18nLabel;
    readonly description?: I18nLabel;
    readonly order?: number;
}
export interface ExtensionSettingFieldBase {
    readonly key: string;
    readonly kind: ExtensionSettingFieldKind;
    readonly label: I18nLabel;
    readonly description?: I18nLabel;
    readonly sectionId?: string;
    readonly scope?: ExtensionSettingScope;
    readonly required?: boolean;
    readonly restartRequired?: boolean;
    readonly visibilityExpression?: string;
}
export interface BooleanSettingField extends ExtensionSettingFieldBase {
    readonly kind: "boolean";
    readonly defaultValue: boolean;
}
export interface StringSettingField extends ExtensionSettingFieldBase {
    readonly kind: "string" | "secret";
    readonly defaultValue?: string;
    readonly placeholder?: string;
    readonly multiline?: boolean;
    readonly minLength?: number;
    readonly maxLength?: number;
    readonly pattern?: string;
}
export interface NumberSettingField extends ExtensionSettingFieldBase {
    readonly kind: "number" | "integer";
    readonly defaultValue?: number;
    readonly min?: number;
    readonly max?: number;
    readonly step?: number;
    readonly unit?: string;
}
export interface SelectSettingField extends ExtensionSettingFieldBase {
    readonly kind: "select" | "multiselect";
    readonly defaultValue?: string | readonly string[];
    readonly options: readonly ExtensionSettingOption[];
}
export interface JsonSettingField extends ExtensionSettingFieldBase {
    readonly kind: "json";
    readonly defaultValue?: unknown;
    readonly schemaUri?: string;
}
export type ExtensionSettingField = BooleanSettingField | StringSettingField | NumberSettingField | SelectSettingField | JsonSettingField;
export interface ExtensionSettingsSchema {
    readonly version: number;
    readonly title?: I18nLabel;
    readonly description?: I18nLabel;
    readonly sections?: readonly ExtensionSettingsSection[];
    readonly fields: readonly ExtensionSettingField[];
}
//# sourceMappingURL=settings.d.ts.map