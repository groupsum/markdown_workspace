import React from "react";
import type {
  ExtensionSettingField,
  ExtensionSettingsSchema,
  I18nLabel,
} from "@mdwrk/extension-manifest";
import type { ExtensionRuntime } from "@mdwrk/extension-runtime";
import { extensionManagerLabels } from "../i18n.js";

const defaultValueForField = (field: ExtensionSettingField): unknown => {
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

const toNumberValue = (field: Extract<ExtensionSettingField, { kind: "number" | "integer" }>, raw: string): number | null => {
  if (raw.trim() === "") return null;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) return null;
  return field.kind === "integer" ? Math.trunc(parsed) : parsed;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-secondary)",
  color: "var(--fg-primary)",
  border: "1px solid var(--border-primary)",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 12,
};

export interface SettingsSchemaFormProps {
  readonly runtime: ExtensionRuntime;
  readonly extensionId: string;
  readonly schema: ExtensionSettingsSchema;
  readonly formatLabel: (label: I18nLabel | string) => string;
}

export const SettingsSchemaForm: React.FC<SettingsSchemaFormProps> = ({ runtime, extensionId, schema, formatLabel }) => {
  const store = React.useMemo(() => runtime.getConfigurationStore(extensionId), [runtime, extensionId]);
  const [values, setValues] = React.useState<Record<string, unknown>>({});
  const [jsonText, setJsonText] = React.useState<Record<string, string>>({});
  const [jsonErrors, setJsonErrors] = React.useState<Record<string, string | null>>({});

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
      return [field.key, stored ?? defaultValueForField(field)] as const;
    })).then((entries) => {
      if (cancelled) return;
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
    const sections = new Map<string, ExtensionSettingField[]>();
    for (const field of schema.fields) {
      const bucketKey = field.sectionId ?? "__root__";
      const bucket = sections.get(bucketKey) ?? [];
      bucket.push(field);
      sections.set(bucketKey, bucket);
    }
    return sections;
  }, [schema.fields]);

  const writeValue = React.useCallback(async (field: ExtensionSettingField, nextValue: unknown) => {
    setValues((current) => ({ ...current, [field.key]: nextValue }));
    await store.set(field.key, nextValue as never);
  }, [store]);

  const renderField = (field: ExtensionSettingField) => {
    const value = values[field.key] ?? defaultValueForField(field);
    const labelId = `${extensionId}-${field.key}`;

    return (
      <div key={field.key} style={{ display: "grid", gap: 6 }}>
        <label id={`${labelId}-label`} htmlFor={labelId} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {formatLabel(field.label)}
        </label>
        {field.description && (
          <p style={{ margin: 0, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.5 }}>
            {formatLabel(field.description)}
          </p>
        )}
        {field.kind === "boolean" && (
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <input
              id={labelId}
              aria-labelledby={`${labelId}-label`}
              type="checkbox"
              checked={Boolean(value)}
              onChange={(event) => {
                void writeValue(field, event.currentTarget.checked);
              }}
            />
            {Boolean(value) ? formatLabel(extensionManagerLabels.settingsEnabled) : formatLabel(extensionManagerLabels.settingsDisabled)}
          </label>
        )}
        {(field.kind === "string" || field.kind === "secret") && !field.multiline && (
          <input
            id={labelId}
            type={field.kind === "secret" ? "password" : "text"}
            value={String(value ?? "")}
            placeholder={field.placeholder}
            style={inputStyle}
            onChange={(event) => {
              void writeValue(field, event.currentTarget.value);
            }}
          />
        )}
        {(field.kind === "string" || field.kind === "secret") && field.multiline && (
          <textarea
            id={labelId}
            value={String(value ?? "")}
            placeholder={field.placeholder}
            style={{ ...inputStyle, minHeight: 96, resize: "vertical" }}
            onChange={(event) => {
              void writeValue(field, event.currentTarget.value);
            }}
          />
        )}
        {(field.kind === "number" || field.kind === "integer") && (
          <input
            id={labelId}
            type="number"
            value={typeof value === "number" ? String(value) : ""}
            min={field.min}
            max={field.max}
            step={field.step ?? (field.kind === "integer" ? 1 : undefined)}
            style={inputStyle}
            onChange={(event) => {
              void writeValue(field, toNumberValue(field, event.currentTarget.value));
            }}
          />
        )}
        {field.kind === "select" && (
          <select
            id={labelId}
            value={typeof value === "string" ? value : String(field.defaultValue ?? "")}
            style={inputStyle}
            onChange={(event) => {
              void writeValue(field, event.currentTarget.value);
            }}
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {formatLabel(option.label)}
              </option>
            ))}
          </select>
        )}
        {field.kind === "multiselect" && (
          <select
            id={labelId}
            multiple
            value={Array.isArray(value) ? value.map(String) : []}
            style={{ ...inputStyle, minHeight: 96 }}
            onChange={(event) => {
              const selected = Array.from(event.currentTarget.selectedOptions as unknown as HTMLOptionElement[]).map((option) => option.value);
              void writeValue(field, selected);
            }}
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {formatLabel(option.label)}
              </option>
            ))}
          </select>
        )}
        {field.kind === "json" && (
          <>
            <textarea
              id={labelId}
              value={jsonText[field.key] ?? JSON.stringify(value ?? {}, null, 2)}
              style={{ ...inputStyle, minHeight: 144, fontFamily: "var(--font-mono, monospace)" }}
              onChange={(event) => {
                const nextText = event.currentTarget.value;
                setJsonText((current) => ({ ...current, [field.key]: nextText }));
              }}
              onBlur={() => {
                const nextText = jsonText[field.key] ?? JSON.stringify(value ?? {}, null, 2);
                try {
                  const parsed = JSON.parse(nextText);
                  setJsonErrors((current) => ({ ...current, [field.key]: null }));
                  void writeValue(field, parsed);
                } catch (error) {
                  setJsonErrors((current) => ({
                    ...current,
                    [field.key]: error instanceof Error ? error.message : String(error),
                  }));
                }
              }}
            />
            {jsonErrors[field.key] && (
              <p style={{ margin: 0, fontSize: 11, color: "var(--accent-red, #f87171)" }}>
                {jsonErrors[field.key]}
              </p>
            )}
          </>
        )}
      </div>
    );
  };

  const sections = schema.sections ?? [];
  const rootFields = fieldsBySection.get("__root__") ?? [];

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {rootFields.length > 0 && (
        <div style={{ display: "grid", gap: 12 }}>
          {rootFields.map(renderField)}
        </div>
      )}
      {sections.map((section) => {
        const fields = fieldsBySection.get(section.id) ?? [];
        if (fields.length === 0) return null;
        return (
          <section key={section.id} style={{ display: "grid", gap: 12, paddingTop: 6 }}>
            <div style={{ display: "grid", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {formatLabel(section.title)}
              </span>
              {section.description && (
                <p style={{ margin: 0, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.5 }}>
                  {formatLabel(section.description)}
                </p>
              )}
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {fields.map(renderField)}
            </div>
          </section>
        );
      })}
    </div>
  );
};
