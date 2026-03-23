import type {
  EXTENSION_HOST_API_BASELINE,
  EXTENSION_MANIFEST_VERSION,
  EXTENSION_RUNTIME_API_BASELINE,
  THEME_CONTRACT_BASELINE,
} from "./version.js";

export type SemverRange = string;

export interface ExtensionCompatibility {
  readonly manifestVersion: typeof EXTENSION_MANIFEST_VERSION | number;
  readonly hostApi: typeof EXTENSION_HOST_API_BASELINE | SemverRange;
  readonly runtime: typeof EXTENSION_RUNTIME_API_BASELINE | SemverRange;
  readonly app?: SemverRange;
  readonly themeContract?: typeof THEME_CONTRACT_BASELINE | SemverRange;
  readonly renderer?: SemverRange;
  readonly editor?: SemverRange;
}
