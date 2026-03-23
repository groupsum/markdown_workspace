import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from "react";
import { extensionManagerLabels } from "../i18n.js";
const defaultValueForField = (field) => {
    switch (field.kind) {
        case "boolean":
            return field.defaultValue;
        case "number":
        case "integer":
            return field.defaultValue ?? null;
        case "select":
        case "multiselect":
            return field.defaultValue ?? (field.kind === "multiselect" ? [] : "");
        case "string":
        case "secret":
            return field.defaultValue ?? "";
        case "json":
            return field.defaultValue ?? {};
        default:
            return null;
    }
};
const toNumberValue = (field, raw) => {
    if (raw.trim() === "")
        return null;
    const parsed = Number(raw);
    if (Number.isNaN(parsed))
        return null;
    return field.kind === "integer" ? Math.trunc(parsed) : parsed;
};
const inputStyle = {
    width: "100%",
    background: "var(--bg-secondary)",
    color: "var(--fg-primary)",
    border: "1px solid var(--border-primary)",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 12,
};
export const SettingsSchemaForm = ({ runtime, extensionId, schema, formatLabel }) => {
    const store = React.useMemo(() => runtime.getConfigurationStore(extensionId), [runtime, extensionId]);
    const [values, setValues] = React.useState({});
    const [jsonText, setJsonText] = React.useState({});
    const [jsonErrors, setJsonErrors] = React.useState({});
    React.useEffect(() => {
        let cancelled = false;
        const disposables = schema.fields.map((field) => store.watch(field.key, (value) => {
            const nextValue = value ?? defaultValueForField(field);
            setValues((current) => ({ ...current, [field.key]: nextValue }));
            if (field.kind === "json") {
                setJsonText((current) => ({
                    ...current,
                    [field.key]: JSON.stringify(nextValue ?? defaultValueForField(field), null, 2),
                }));
            }
        }));
        void Promise.all(schema.fields.map(async (field) => {
            const stored = await store.get(field.key);
            return [field.key, stored ?? defaultValueForField(field)];
        })).then((entries) => {
            if (cancelled)
                return;
            setValues(Object.fromEntries(entries));
            setJsonText(Object.fromEntries(entries.filter(([, value]) => value !== undefined).map(([key, value]) => [key, JSON.stringify(value, null, 2)])));
        });
        return () => {
            cancelled = true;
            for (const disposable of disposables) {
                disposable.dispose();
            }
        };
    }, [schema.fields, store]);
    const fieldsBySection = React.useMemo(() => {
        const sections = new Map();
        for (const field of schema.fields) {
            const bucketKey = field.sectionId ?? "__root__";
            const bucket = sections.get(bucketKey) ?? [];
            bucket.push(field);
            sections.set(bucketKey, bucket);
        }
        return sections;
    }, [schema.fields]);
    const writeValue = React.useCallback(async (field, nextValue) => {
        setValues((current) => ({ ...current, [field.key]: nextValue }));
        await store.set(field.key, nextValue);
    }, [store]);
    const renderField = (field) => {
        const value = values[field.key] ?? defaultValueForField(field);
        const labelId = `${extensionId}-${field.key}`;
        return (_jsxs("div", { style: { display: "grid", gap: 6 }, children: [_jsx("label", { id: `${labelId}-label`, htmlFor: labelId, style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(field.label) }), field.description && (_jsx("p", { style: { margin: 0, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.5 }, children: formatLabel(field.description) })), field.kind === "boolean" && (_jsxs("label", { style: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12 }, children: [_jsx("input", { id: labelId, "aria-labelledby": `${labelId}-label`, type: "checkbox", checked: Boolean(value), onChange: (event) => {
                                void writeValue(field, event.currentTarget.checked);
                            } }), Boolean(value) ? formatLabel(extensionManagerLabels.settingsEnabled) : formatLabel(extensionManagerLabels.settingsDisabled)] })), (field.kind === "string" || field.kind === "secret") && !field.multiline && (_jsx("input", { id: labelId, type: field.kind === "secret" ? "password" : "text", value: String(value ?? ""), placeholder: field.placeholder, style: inputStyle, onChange: (event) => {
                        void writeValue(field, event.currentTarget.value);
                    } })), (field.kind === "string" || field.kind === "secret") && field.multiline && (_jsx("textarea", { id: labelId, value: String(value ?? ""), placeholder: field.placeholder, style: { ...inputStyle, minHeight: 96, resize: "vertical" }, onChange: (event) => {
                        void writeValue(field, event.currentTarget.value);
                    } })), (field.kind === "number" || field.kind === "integer") && (_jsx("input", { id: labelId, type: "number", value: typeof value === "number" ? String(value) : "", min: field.min, max: field.max, step: field.step ?? (field.kind === "integer" ? 1 : undefined), style: inputStyle, onChange: (event) => {
                        void writeValue(field, toNumberValue(field, event.currentTarget.value));
                    } })), field.kind === "select" && (_jsx("select", { id: labelId, value: typeof value === "string" ? value : String(field.defaultValue ?? ""), style: inputStyle, onChange: (event) => {
                        void writeValue(field, event.currentTarget.value);
                    }, children: field.options.map((option) => (_jsx("option", { value: option.value, children: formatLabel(option.label) }, option.value))) })), field.kind === "multiselect" && (_jsx("select", { id: labelId, multiple: true, value: Array.isArray(value) ? value.map(String) : [], style: { ...inputStyle, minHeight: 96 }, onChange: (event) => {
                        const selected = Array.from(event.currentTarget.selectedOptions).map((option) => option.value);
                        void writeValue(field, selected);
                    }, children: field.options.map((option) => (_jsx("option", { value: option.value, children: formatLabel(option.label) }, option.value))) })), field.kind === "json" && (_jsxs(_Fragment, { children: [_jsx("textarea", { id: labelId, value: jsonText[field.key] ?? JSON.stringify(value ?? {}, null, 2), style: { ...inputStyle, minHeight: 144, fontFamily: "var(--font-mono, monospace)" }, onChange: (event) => {
                                const nextText = event.currentTarget.value;
                                setJsonText((current) => ({ ...current, [field.key]: nextText }));
                            }, onBlur: () => {
                                const nextText = jsonText[field.key] ?? JSON.stringify(value ?? {}, null, 2);
                                try {
                                    const parsed = JSON.parse(nextText);
                                    setJsonErrors((current) => ({ ...current, [field.key]: null }));
                                    void writeValue(field, parsed);
                                }
                                catch (error) {
                                    setJsonErrors((current) => ({
                                        ...current,
                                        [field.key]: error instanceof Error ? error.message : String(error),
                                    }));
                                }
                            } }), jsonErrors[field.key] && (_jsx("p", { style: { margin: 0, fontSize: 11, color: "var(--accent-red, #f87171)" }, children: jsonErrors[field.key] }))] }))] }, field.key));
    };
    const sections = schema.sections ?? [];
    const rootFields = fieldsBySection.get("__root__") ?? [];
    return (_jsxs("div", { style: { display: "grid", gap: 14 }, children: [rootFields.length > 0 && (_jsx("div", { style: { display: "grid", gap: 12 }, children: rootFields.map(renderField) })), sections.map((section) => {
                const fields = fieldsBySection.get(section.id) ?? [];
                if (fields.length === 0)
                    return null;
                return (_jsxs("section", { style: { display: "grid", gap: 12, paddingTop: 6 }, children: [_jsxs("div", { style: { display: "grid", gap: 4 }, children: [_jsx("span", { style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }, children: formatLabel(section.title) }), section.description && (_jsx("p", { style: { margin: 0, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.5 }, children: formatLabel(section.description) }))] }), _jsx("div", { style: { display: "grid", gap: 12 }, children: fields.map(renderField) })] }, section.id));
            })] }));
};
//# sourceMappingURL=SettingsSchemaForm.js.map