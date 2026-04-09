import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { commonVars } from './env/common_vars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));
const buildId = process.env.BUILD_ID || process.env.GITHUB_SHA || 'dev';

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __APP_BUILD_ID__: JSON.stringify(buildId),
    __PACKAGE_NAME__: JSON.stringify(commonVars.npmPackageName)
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@mdwrk/ui-tokens': path.resolve(__dirname, '../../packages/shared/ui-tokens/src'),
    }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/esm-entry.tsx'),
      name: 'MdWork',
      formats: ['es'],
      fileName: 'mdwrkspace'
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-dom/client']
    }
  }
});
