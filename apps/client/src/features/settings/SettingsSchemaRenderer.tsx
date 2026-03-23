import React from 'react';
import type { ExtensionSettingField, ExtensionSettingsSchema } from '@markdown-workspace/extension-manifest';

export interface SettingsSchemaRendererProps {
  readonly schema: ExtensionSettingsSchema;
  readonly values: Readonly<Record<string, unknown>>;
  readonly onChange: (key: string, value: unknown) => void;
}

const resolveValue = (field: ExtensionSettingField, values: Readonly<Record<string, unknown>>): unknown => {
  if (field.key in values) {
    return values[field.key];
  }

  if ('defaultValue' in field) {
    return field.defaultValue;
  }

  return field.kind === 'multiselect' ? [] : '';
};

export const SettingsSchemaRenderer: React.FC<SettingsSchemaRendererProps> = ({ schema, values, onChange }) => {
  const sections = schema.sections && schema.sections.length > 0
    ? schema.sections
    : [{ id: 'default', title: { defaultMessage: schema.title?.defaultMessage ?? 'Configuration' } }];

  return (
    <div className="settings-pane">
      <div className="settings-card settings-card-stack">
        {sections.map((section) => {
          const fields = schema.fields.filter((field) => (field.sectionId ?? 'default') === section.id);
          if (fields.length === 0) {
            return null;
          }

          return (
            <div key={section.id} className="flex flex-col gap-3">
              <div>
                <span className="font-bold text-[11px] uppercase">{section.title.defaultMessage}</span>
                {section.description && (
                  <p className="text-[11px] text-[var(--fg-muted)] mt-1">{section.description.defaultMessage}</p>
                )}
              </div>
              {fields.map((field) => {
                const value = resolveValue(field, values);
                const description = field.description?.defaultMessage;
                if (field.kind === 'boolean') {
                  return (
                    <label key={field.key} className="pwa-toggle justify-start gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(event) => onChange(field.key, event.target.checked)}
                      />
                      <span className="pwa-toggle-indicator" />
                      <span className="pwa-toggle-label">{field.label.defaultMessage}</span>
                      {description && <span className="text-[11px] text-[var(--fg-muted)]">{description}</span>}
                    </label>
                  );
                }

                if (field.kind === 'select') {
                  return (
                    <label key={field.key} className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{field.label.defaultMessage}</span>
                      <select
                        className="modal-input !text-xs !py-3"
                        value={String(value ?? '')}
                        onChange={(event) => onChange(field.key, event.target.value)}
                      >
                        {field.options.map((option) => (
                          <option key={option.value} value={option.value}>{option.label.defaultMessage}</option>
                        ))}
                      </select>
                      {description && <span className="text-[11px] text-[var(--fg-muted)]">{description}</span>}
                    </label>
                  );
                }

                return (
                  <label key={field.key} className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{field.label.defaultMessage}</span>
                    <input
                      className="modal-input !text-xs !py-3"
                      type={field.kind === 'secret' ? 'password' : field.kind === 'number' || field.kind === 'integer' ? 'number' : 'text'}
                      value={String(value ?? '')}
                      onChange={(event) => onChange(field.key, event.target.value)}
                      placeholder={'placeholder' in field ? field.placeholder : undefined}
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
