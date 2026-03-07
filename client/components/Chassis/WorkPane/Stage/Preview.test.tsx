// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PreviewPane } from './Preview';

describe('PreviewPane', () => {
  it('renders nested empty bullet as list item content instead of promoting to heading', () => {
    const content = '# test\n\n1. ad\n\t- \n';

    const { container } = render(
      <PreviewPane content={content} theme="default" files={[]} onNavigate={vi.fn()} />
    );

    const h2 = container.querySelector('h2');
    expect(h2).toBeNull();

    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBe(2);

    expect(screen.getByRole('heading', { level: 1, name: 'test' })).toBeTruthy();
    expect(screen.getByText('ad')).toBeTruthy();
  });
});
