export interface DesktopWindowState {
  readonly width: number;
  readonly height: number;
  readonly x?: number;
  readonly y?: number;
  readonly isMaximized: boolean;
}

export const DEFAULT_DESKTOP_WINDOW_STATE: DesktopWindowState = {
  width: 1600,
  height: 1024,
  isMaximized: false,
};

function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function normalizeDesktopWindowState(value: unknown): DesktopWindowState {
  const candidate = typeof value === 'object' && value ? value as Record<string, unknown> : {};
  const width = Math.max(1100, asFiniteNumber(candidate.width) ?? DEFAULT_DESKTOP_WINDOW_STATE.width);
  const height = Math.max(760, asFiniteNumber(candidate.height) ?? DEFAULT_DESKTOP_WINDOW_STATE.height);
  const x = asFiniteNumber(candidate.x);
  const y = asFiniteNumber(candidate.y);
  const isMaximized = typeof candidate.isMaximized === 'boolean' ? candidate.isMaximized : DEFAULT_DESKTOP_WINDOW_STATE.isMaximized;

  return {
    width,
    height,
    ...(x !== undefined ? { x } : {}),
    ...(y !== undefined ? { y } : {}),
    isMaximized,
  };
}

export function serializeDesktopWindowState(value: DesktopWindowState): string {
  return JSON.stringify(normalizeDesktopWindowState(value), null, 2);
}
