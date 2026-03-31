export interface SplitViewViewport {
  readonly width: number;
  readonly height: number;
}

export function isMobileLandscapeViewport(viewport: SplitViewViewport): boolean {
  return viewport.width <= 1024 && viewport.width > viewport.height;
}

export function isSplitViewAllowedForViewport(viewport: SplitViewViewport): boolean {
  return viewport.width > 900 || isMobileLandscapeViewport(viewport);
}
