import './index.css';

import coreCssText from './index.css?inline';
import shellStructureCssText from './base/shell-structure.css?inline';
import acidEtchedThemeCssText from './themes/theme-acid-etched.css?inline';
import anodizedBilletThemeCssText from './themes/theme-anodized-billet.css?inline';
import defaultThemeCssText from './themes/theme-default.css?inline';
import ferrousMonolithThemeCssText from './themes/theme-ferrous-monolith.css?inline';
import heavyGaugeTectonicThemeCssText from './themes/theme-heavy-gauge-tectonic.css?inline';
import galvanizedCellularThemeCssText from './themes/theme-galvanized-cellular.css?inline';
import landerDarkThemeCssText from './themes/theme-lander-dark.css?inline';
import landerLightThemeCssText from './themes/theme-lander-light.css?inline';
import micropressThemeCssText from './themes/theme-micropress.css?inline';
import opticalVellumDraftingGridThemeCssText from './themes/theme-optical-vellum-drafting-grid.css?inline';
import pressedChromiumThemeCssText from './themes/theme-pressed-chromium.css?inline';
import pneumaticMycelialScaffoldingThemeCssText from './themes/theme-pneumatic-mycelial-scaffolding.css?inline';
import tensionedTechnicalSkeletonThemeCssText from './themes/theme-tensioned-technical-skeleton.css?inline';
import researchScienceThemeCssText from './themes/theme-research-science.css?inline';
import zincThemeCssText from './themes/theme-zinc.css?inline';

const withShellStructure = (themeCssText: string): string => `${themeCssText}\n${shellStructureCssText}`;

export const THEME_STYLESHEET_TEXT = {
  'acid-etched': withShellStructure(acidEtchedThemeCssText),
  'anodized-billet': withShellStructure(anodizedBilletThemeCssText),
  default: withShellStructure(defaultThemeCssText),
  'ferrous-monolith': withShellStructure(ferrousMonolithThemeCssText),
  'heavy-gauge-tectonic': withShellStructure(heavyGaugeTectonicThemeCssText),
  'galvanized-cellular': withShellStructure(galvanizedCellularThemeCssText),
  'lander-dark': withShellStructure(landerDarkThemeCssText),
  'lander-light': withShellStructure(landerLightThemeCssText),
  micropress: withShellStructure(micropressThemeCssText),
  'optical-vellum-drafting-grid': withShellStructure(opticalVellumDraftingGridThemeCssText),
  'pressed-chromium': withShellStructure(pressedChromiumThemeCssText),
  'pneumatic-mycelial-scaffolding': withShellStructure(pneumaticMycelialScaffoldingThemeCssText),
  'tensioned-technical-skeleton': withShellStructure(tensionedTechnicalSkeletonThemeCssText),
  'research-science': withShellStructure(researchScienceThemeCssText),
  zinc: withShellStructure(zincThemeCssText)
} as const;

export const CORE_STYLESHEET_TEXT = coreCssText;
export const DEFAULT_THEME_STYLESHEET_TEXT = THEME_STYLESHEET_TEXT.micropress;
