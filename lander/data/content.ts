import { privacyContent } from './markdown/legal/privacy';
import { termsContent } from './markdown/legal/terms';
import { githubSyncContent } from './markdown/docs/github-sync';
import { localFirstFutureContent } from './markdown/blog/local-first-future';
import { installationContent } from './markdown/docs/getting-started/installation';
import { configurationContent } from './markdown/docs/getting-started/configuration';
import { editorBasicsContent } from './markdown/docs/usage/editor-basics';
import { advancedFormattingContent } from './markdown/docs/usage/advanced-formatting';

export const contentFiles = {
  'legal/privacy': privacyContent,
  'legal/terms': termsContent,
  'docs/github-sync': githubSyncContent,
  'blog/local-first-future': localFirstFutureContent,
  'docs/getting-started/installation': installationContent,
  'docs/getting-started/configuration': configurationContent,
  'docs/usage/editor-basics': editorBasicsContent,
  'docs/usage/advanced-formatting': advancedFormattingContent,
};