import React from 'react';
import type { ExtensionSettingField, ExtensionSettingsSchema, I18nLabel } from '@mdwrk/extension-manifest';
import type { JsonValue } from '@mdwrk/extension-host';

export interface SettingsSchemaValueStore {
  get<T extends JsonValue = JsonValue>(key: string): Promise<T | null>;
  set<T extends JsonValue = JsonValue>(key: string, value: T): Promise<void>;
  remove?(key: string): Promise<void>;
  watch<T extends JsonValue = JsonValue>(key: string, listener: (value: T | null) => void): { dispose(): void };
}

export interface SettingsSchemaRendererProps {
  readonly schema: ExtensionSettingsSchema;
  readonly values?: Readonly<Record<string, unknown>>;
  readonly onChange?: (key: string, value: unknown) => void;
  readonly store?: SettingsSchemaValueStore;
  readonly formatLabel?: (label: I18nLabel | string) => string;
}

const defaultValueForField = (field: ExtensionSettingField): unknown => {
  switch (field.kind) {
    case 'boolean':
      return field.defaultValue;
    case 'number':
    case 'integer':
      return field.defaultValue ?? null;
    case 'select':
    case 'multiselect':
      return field.defaultValue ?? (field.kind === 'multiselect' ? [] : '');
    case 'string':
    case 'secret':
      return field.defaultValue ?? '';
    case 'json':
      return field.defaultValue ?? {};
    default:
      return null;
  }
};

const toNumberValue = (field: Extract<ExtensionSettingField, { kind: 'number' | 'integer' }>, raw: string): number | null => {
  if (raw.trim() === '') return null;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) return null;
  return field.kind === 'integer' ? Math.trunc(parsed) : parsed;
};

const defaultFormatLabel = (label: I18nLabel | string): string => typeof label === 'string' ? label : label.defaultMessage;

export const SettingsSchemaRenderer: React.FC<SettingsSchemaRendererProps> = ({ schema, values, onChange, store, formatLabel = defaultFormatLabel }) => {
  const [storeValues, setStoreValues] = React.useState<Record<string, unknown>>({});
  const [jsonText, setJsonText] = React.useState<Record<string, string>>({});
  const [jsonErrors, setJsonErrors] = React.useState<Record<string, string | null>>({});

  React.useEffect(() => {
    if (!store) return;
    let cancelled = false;
    const disposables = schema.fields.map((field) => store.watch(field.key, (value) => {
      const nextValue = value ?? defaultValueForField(field);
      setStoreValues((current) => ({ ...current, [field.key]: nextValue }));
      if (field.kind === 'json') {
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
      setStoreValues(Object.fromEntries(entries));
      setJsonText(Object.fromEntries(entries.filter(([, value]) => value !== undefined).map(([key, value]) => [key, JSON.stringify(value, null, 2)])));
    });

    return () => {
      cancelled = true;
      for (const disposable of disposables) {
        disposable.dispose();
      }
    };
  }, [schema.fields, store]);

  const resolvedValues = store ? storeValues : (values ?? {});

  const writeValue = React.useCallback(async (field: ExtensionSettingField, nextValue: unknown) => {
    if (store) {
      setStoreValues((current) => ({ ...current, [field.key]: nextValue }));
      await store.set(field.key, nextValue as never);
      return;
    }
    onChange?.(field.key, nextValue);
  }, [onChange, store]);

  const sections = schema.sections && schema.sections.length > 0
    ? schema.sections
    : [{ id: 'default', title: { defaultMessage: schema.title?.defaultMessage ?? 'Configuration' } }];

  return (
    <div className="settings-pane">
      <div className="settings-card settings-card-stack">
        {sections.map((section) => {
          const fields = schema.fields.filter((field) => (field.sectionId ?? 'default') === section.id);
          if (fields.length === 0) return null;

          return (
            <div key={section.id} className="flex flex-col gap-3">
              <div>
                <span className="font-bold text-[11px] uppercase">{formatLabel(section.title)}</span>
                {section.description && (
                  <p className="text-[11px] text-[var(--fg-muted)] mt-1">{formatLabel(section.description)}</p>
                )}
              </div>
              {fields.map((field) => {
                const value = field.key in resolvedValues ? resolvedValues[field.key] : defaultValueForField(field);
                const description = field.description ? formatLabel(field.description) : null;
                const placeholder = 'placeholder' in field ? field.placeholder : undefined;

                if (field.kind === 'boolean') {
                  return (
                    <label key={field.key} className="pwa-toggle justify-start gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(event) => { void writeValue(field, event.target.checked); }}
                      />
                      <span className="pwa-toggle-indicator" />
                      <span className="pwa-toggle-label">{formatLabel(field.label)}</span>
                      {description && <span className="text-[11px] text-[var(--fg-muted)]">{description}</span>}
                    </label>
                  );
                }

                if (field.kind === 'select') {
                  return (
                    <label key={field.key} className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{formatLabel(field.label)}</span>
                      <select
                        className="modal-input modal-input--multiselect !text-xs !py-3"
                        value={typeof value === 'string' ? value : String(field.defaultValue ?? '')}
                        onChange={(event) => { void writeValue(field, event.target.value); }}
                      >
                        {field.options.map((option) => (
                          <option key={option.value} value={option.value}>{formatLabel(option.label)}</option>
                        ))}
                      </select>
                      {description && <span className="text-[11px] text-[var(--fg-muted)]">{description}</span>}
                    </label>
                  );
                }

                if (field.kind === 'multiselect') {
                  return (
                    <label key={field.key} className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{formatLabel(field.label)}</span>
                      <select
                        className="modal-input !text-xs !py-3"
                        multiple
                        value={Array.isArray(value) ? value.map(String) : []}
                        onChange={(event) => {
                          const selected = Array.from<HTMLOptionElement>(event.currentTarget.selectedOptions).map((option) => option.value);
                          void writeValue(field, selected);
                        }}
                      >
                        {field.options.map((option) => (
                          <option key={option.value} value={option.value}>{formatLabel(option.label)}</option>
                        ))}
                      </select>
                      {description && <span className="text-[11px] text-[var(--fg-muted)]">{description}</span>}
                    </label>
                  );
                }

                if ((field.kind === 'string' || field.kind === 'secret') && field.multiline) {
                  return (
                    <label key={field.key} className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{formatLabel(field.label)}</span>
                      <textarea
                        className="modal-input modal-input--textarea !text-xs !py-3"
                        value={String(value ?? '')}
                        onChange={(event) => { void writeValue(field, event.target.value); }}
                        placeholder={placeholder}
                      />
                      {description && <span className="text-[11px] text-[var(--fg-muted)]">{description}</span>}
                    </label>
                  );
                }

                if (field.kind === 'json') {
                  return (
                    <label key={field.key} className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{formatLabel(field.label)}</span>
                      <textarea
                        className="modal-input modal-input--json !text-xs !py-3 font-mono"
                        value={jsonText[field.key] ?? JSON.stringify(value ?? {}, null, 2)}
                        onChange={(event) => {
                          const nextText = event.target.value;
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
                      {jsonErrors[field.key] && <span className="text-[11px] text-[var(--danger)]">{jsonErrors[field.key]}</span>}
                      {description && <span className="text-[11px] text-[var(--fg-muted)]">{description}</span>}
                    </label>
                  );
                }

                const numericField = field.kind === 'number' || field.kind === 'integer' ? field : null;

                return (
                  <label key={field.key} className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{formatLabel(field.label)}</span>
                    <input
                      className="modal-input !text-xs !py-3"
                      type={field.kind === 'secret' ? 'password' : numericField ? 'number' : 'text'}
                      value={numericField ? (typeof value === 'number' ? String(value) : '') : String(value ?? '')}
                      onChange={(event) => {
                        const nextValue = numericField
                          ? toNumberValue(numericField, event.target.value)
                          : event.target.value;
                        void writeValue(field, nextValue);
                      }}
                      placeholder={placeholder}
                      min={numericField?.min}
                      max={numericField?.max}
                      step={numericField ? (numericField.step ?? (numericField.kind === 'integer' ? 1 : undefined)) : undefined}
                    />
                    {description && <span className="text-[11px] text-[var(--fg-muted)]">{description}</span>}
                  </label>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
