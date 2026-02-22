// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePwa } from './usePwa';

type MessageHandler = (event: MessageEvent) => void;
type WorkerStateHandler = () => void;

type MockWorker = {
  state: string;
  postMessage: ReturnType<typeof vi.fn>;
  addEventListener: (type: 'statechange', handler: WorkerStateHandler) => void;
  triggerStateChange: () => void;
  scriptURL: string;
};

const createWorker = (version: string, initialState = 'installing'): MockWorker => {
  const handlers: WorkerStateHandler[] = [];
  return {
    state: initialState,
    postMessage: vi.fn(),
    addEventListener: (_type, handler) => {
      handlers.push(handler);
    },
    triggerStateChange: () => {
      handlers.forEach((handler) => handler());
    },
    scriptURL: `https://example.com/sw.js?version=${version}`
  };
};

const setupServiceWorker = () => {
  const messageHandlers: MessageHandler[] = [];

  const registration = {
    waiting: null as MockWorker | null,
    installing: null as MockWorker | null,
    active: null,
    addEventListener: vi.fn(),
    update: vi.fn().mockResolvedValue(undefined)
  };

  const serviceWorker = {
    controller: null,
    register: vi.fn().mockResolvedValue(registration),
    ready: Promise.resolve(registration),
    addEventListener: vi.fn((type: string, handler: MessageHandler) => {
      if (type === 'message') {
        messageHandlers.push(handler);
      }
    }),
    removeEventListener: vi.fn()
  };

  Object.defineProperty(window.navigator, 'serviceWorker', {
    configurable: true,
    value: serviceWorker
  });

  return { registration, serviceWorker, messageHandlers };
};

const HookHarness: React.FC<{ onReady: (actions: ReturnType<typeof usePwa>['actions']) => void }> = ({ onReady }) => {
  const { actions } = usePwa();

  React.useEffect(() => {
    onReady(actions);
  }, [actions, onReady]);

  return null;
};

describe('usePwa requestUpdate', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('promotes a currently-installing worker once it reaches waiting', async () => {
    const { registration } = setupServiceWorker();
    const installing = createWorker('1.3.75');
    const waiting = createWorker('1.3.75', 'installed');
    registration.installing = installing;

    let pwaActions: ReturnType<typeof usePwa>['actions'] | null = null;
    render(<HookHarness onReady={(actions) => { pwaActions = actions; }} />);

    await act(async () => {
      await Promise.resolve();
    });

    registration.update.mockClear();

    await act(async () => {
      pwaActions?.requestUpdate();
    });

    registration.waiting = waiting;
    installing.state = 'installed';

    await act(async () => {
      installing.triggerStateChange();
    });

    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });

  it('promotes a worker that appears as installing after update() resolves', async () => {
    const { registration } = setupServiceWorker();
    const waiting = createWorker('1.3.75', 'installed');

    registration.update.mockImplementation(async () => {
      registration.installing = createWorker('1.3.75');
    });

    let pwaActions: ReturnType<typeof usePwa>['actions'] | null = null;
    render(<HookHarness onReady={(actions) => { pwaActions = actions; }} />);

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      pwaActions?.requestUpdate();
      await Promise.resolve();
    });

    const pendingWorker = registration.installing;
    if (!pendingWorker) {
      throw new Error('Expected an installing worker after update()');
    }

    registration.waiting = waiting;
    pendingWorker.state = 'installed';

    await act(async () => {
      pendingWorker.triggerStateChange();
    });

    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });
});
