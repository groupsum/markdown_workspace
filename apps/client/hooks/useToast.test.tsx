// @vitest-environment jsdom
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastContainer } from '../components/UI/Toast';
import { useToast } from './useToast';
import { createClientNotificationService } from '../src/features/notifications/clientNotificationService';

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

    const toasts = await screen.findAllByText('OIDC callback is missing code or state.');
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

  it('normalizes technical error text into a graceful error toast', async () => {
    const ErrorHarness: React.FC = () => {
      const { toasts, addToast } = useToast();

      React.useEffect(() => {
        addToast('TypeError: failed to fetch at request (C:\\workspace\\internal.ts:10:2) https://example.test/private', 'error');
      }, [addToast]);

      return <ToastContainer messages={toasts} onDismiss={() => {}} />;
    };

    render(<ErrorHarness />);

    expect(await screen.findByText('Failed to fetch [link]')).toBeTruthy();
    expect(screen.getByText('Failed to fetch [link]').closest('.toast-message')?.classList.contains('error')).toBe(true);
  });

  it('publishes host errors as error toasts without forced uppercase', async () => {
    const addToast = vi.fn();
    const service = createClientNotificationService(
      () => ({ addToast }),
      (label) => typeof label === 'string' ? label : label.defaultMessage,
    );

    await service.error({ defaultMessage: 'Theme export failed. Check the selected output path.' }, { title: 'Theme Studio' });

    expect(addToast).toHaveBeenCalledWith('Theme Studio: Theme export failed. Check the selected output path.', 'error');
  });
});
