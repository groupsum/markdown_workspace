export type LanderThemeId = 'lander-light' | 'lander-dark';

export interface LanderThemeDefinition {
  readonly id: LanderThemeId;
  readonly label: string;
  readonly mode: 'light' | 'dark';
}

export const LANDER_THEMES: Record<LanderThemeId, LanderThemeDefinition> = {
  'lander-light': {
    id: 'lander-light',
    label: 'Lander Light',
    mode: 'light',
  },
  'lander-dark': {
    id: 'lander-dark',
    label: 'Lander Dark',
    mode: 'dark',
  },
};

export function getPreferredLanderThemeId(): LanderThemeId {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'lander-dark';
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'lander-light' : 'lander-dark';
}
