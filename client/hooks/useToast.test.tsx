// @vitest-environment jsdom
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastContainer } from '../components/UI/Toast';
import { useToast } from './useToast';

const HookHarness: React.FC = () => {
  const { toasts, addToast } = useToast();

  React.useEffect(() => {
    addToast('OIDC CALLBACK IS MISSING CODE OR STATE.', 'warning');
    addToast('OIDC CALLBACK IS MISSING CODE OR STATE.', 'warning');
  }, [addToast]);

  return <ToastContainer messages={toasts} onDismiss={() => {}} />;
};

describe('toast behavior', () => {
  afterEach(() => {
    cleanup();
  });
  it('does not add duplicate toasts with the same message and type', async () => {
    render(<HookHarness />);

    const toasts = await screen.findAllByText('OIDC CALLBACK IS MISSING CODE OR STATE.');
    expect(toasts).toHaveLength(1);
  });

  it('dismisses toast when clicking the x button', async () => {
    const onDismiss = vi.fn();

    render(
      <ToastContainer
        messages={[{ id: 'toast-1', message: 'Sample warning', type: 'warning' }]}
        onDismiss={onDismiss}
      />
    );

    const closeButton = screen.getByRole('button', { name: 'Dismiss toast' });
    closeButton.click();

    expect(onDismiss).toHaveBeenCalledWith('toast-1');
  });
});
