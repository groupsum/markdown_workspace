import './index.css';

import coreCssText from './index.css?inline';
import acidEtchedThemeCssText from './themes/theme-acid-etched.css?inline';
import anodizedBilletThemeCssText from './themes/theme-anodized-billet.css?inline';
import defaultThemeCssText from './themes/theme-default.css?inline';
import micropressThemeCssText from './themes/theme-micropress.css?inline';
import zincThemeCssText from './themes/theme-zinc.css?inline';

export const THEME_STYLESHEET_TEXT = {
  'acid-etched': acidEtchedThemeCssText,
  'anodized-billet': anodizedBilletThemeCssText,
  default: defaultThemeCssText,
  micropress: micropressThemeCssText,
  zinc: zincThemeCssText
} as const;

export const CORE_STYLESHEET_TEXT = coreCssText;
export const DEFAULT_THEME_STYLESHEET_TEXT = THEME_STYLESHEET_TEXT.micropress;
