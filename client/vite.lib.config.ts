import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { commonVars } from '../env/common_vars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __PACKAGE_NAME__: JSON.stringify(commonVars.npmPackageName)
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/esm-entry.ts'),
      name: 'MarkSpace',
      formats: ['es'],
      fileName: 'markspace'
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-dom/client']
    }
  }
});
