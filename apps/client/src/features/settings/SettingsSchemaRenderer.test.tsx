import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SettingsSchemaRenderer } from './SettingsSchemaRenderer';

describe('SettingsSchemaRenderer', () => {
  it('renders schema fields and emits changes', () => {
    const onChange = vi.fn();

    render(
      <SettingsSchemaRenderer
        schema={{
          version: 1,
          sections: [{ id: 'general', title: { defaultMessage: 'General' } }],
          fields: [
            {
              key: 'enabled',
              kind: 'boolean',
              label: { defaultMessage: 'Enabled' },
              sectionId: 'general',
              defaultValue: true,
            },
            {
              key: 'mode',
              kind: 'select',
              label: { defaultMessage: 'Mode' },
              sectionId: 'general',
              defaultValue: 'a',
              options: [
                { value: 'a', label: { defaultMessage: 'Mode A' } },
                { value: 'b', label: { defaultMessage: 'Mode B' } },
              ],
            },
          ],
        }}
        values={{ enabled: false, mode: 'a' }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByDisplayValue('Mode A'), { target: { value: 'b' } });

    expect(onChange).toHaveBeenCalledWith('enabled', true);
    expect(onChange).toHaveBeenCalledWith('mode', 'b');
  });
});
