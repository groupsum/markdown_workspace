
import { AppTheme } from '../types';
import { setTheme } from '../services/themeService';

/**
 * Deterministically switches the application theme.
 * Uses the centralized setTheme logic which handles CSS injection.
 */
export const switchTheme = async (themeId: AppTheme): Promise<void> => {
  console.log(`[themeLoader] Requesting switch to: ${themeId}`);
  await setTheme(themeId);
};
