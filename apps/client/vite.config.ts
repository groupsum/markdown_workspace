
import path from 'path';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { commonVars } from './env/common_vars';

// Derive __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));
    const buildSeed = env.BUILD_ID || env.GITHUB_SHA || `${packageJson.version}:${new Date().toISOString()}`;
    const buildId = createHash('sha256').update(buildSeed).digest('hex').slice(0, 12);
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      test: {
        include: ['**/*.{test,spec}.{ts,tsx}'],
        exclude: ['**/node_modules/**', 'tests/playwright/**', 'tests/playwright-*/**'],
      },
      plugins: [react()],
      define: {
        __APP_VERSION__: JSON.stringify(packageJson.version),
        __APP_BUILD_ID__: JSON.stringify(buildId),
        __PACKAGE_NAME__: JSON.stringify(commonVars.npmPackageName),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@mdwrk/ui-tokens': path.resolve(__dirname, '../../packages/shared/ui-tokens/src'),
          '@mdwrk/i18n': path.resolve(__dirname, '../../packages/shared/i18n/src'),
          '@mdwrk/icons': path.resolve(__dirname, '../../packages/shared/icons/src'),
          '@mdwrk/extension-manifest': path.resolve(__dirname, '../../packages/contracts/extension-manifest/src'),
          '@mdwrk/extension-host': path.resolve(__dirname, '../../packages/contracts/extension-host/src'),
          '@mdwrk/theme-contract': path.resolve(__dirname, '../../packages/contracts/theme-contract/src'),
          '@mdwrk/extension-runtime': path.resolve(__dirname, '../../packages/extensions/extension-runtime/src'),
          '@mdwrk/extension-manager': path.resolve(__dirname, '../../packages/extensions/extension-manager/src'),
          '@mdwrk/extension-language-pack-studio': path.resolve(__dirname, '../../packages/extensions/extension-language-pack-studio/src'),
          '@mdwrk/extension-theme-studio': path.resolve(__dirname, '../../packages/extensions/extension-theme-studio/src'),
          '@mdwrk/markdown-renderer-react': path.resolve(__dirname, '../../packages/renderer/markdown-renderer-react/src'),
          '@mdwrk/markdown-editor-react': path.resolve(__dirname, '../../packages/editor/markdown-editor-react/src'),
          '@mdwrk/markdown-renderer-core': path.resolve(__dirname, '../../packages/renderer/markdown-renderer-core/src'),
          '@mdwrk/markdown-editor-core': path.resolve(__dirname, '../../packages/editor/markdown-editor-core/src'),
        }
      }
    };
});
