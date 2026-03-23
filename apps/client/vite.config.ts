
import path from 'path';
import { readFileSync } from 'fs';
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
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        __APP_VERSION__: JSON.stringify(packageJson.version),
        __PACKAGE_NAME__: JSON.stringify(commonVars.npmPackageName),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@markdown-workspace/ui-tokens': path.resolve(__dirname, '../../packages/shared/ui-tokens/src'),
          '@markdown-workspace/i18n': path.resolve(__dirname, '../../packages/shared/i18n/src'),
          '@markdown-workspace/icons': path.resolve(__dirname, '../../packages/shared/icons/src'),
          '@markdown-workspace/extension-manifest': path.resolve(__dirname, '../../packages/contracts/extension-manifest/src'),
          '@markdown-workspace/extension-host': path.resolve(__dirname, '../../packages/contracts/extension-host/src'),
          '@markdown-workspace/theme-contract': path.resolve(__dirname, '../../packages/contracts/theme-contract/src'),
        }
      }
    };
});
