import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const workspaceRoot = path.resolve(__dirname, '../..');

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
  return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        fs: {
          allow: [path.resolve(__dirname, '..')]
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: [
          {
            find: /^@mdwrk\/markdown-renderer-core$/,
            replacement: path.resolve(workspaceRoot, 'packages/renderer/markdown-renderer-core/dist/index.js'),
          },
          {
            find: '@mdwrk/markdown-renderer-react/styles/default.css',
            replacement: path.resolve(workspaceRoot, 'packages/renderer/markdown-renderer-react/src/styles/default.css'),
          },
          {
            find: /^@mdwrk\/markdown-renderer-react$/,
            replacement: path.resolve(workspaceRoot, 'packages/renderer/markdown-renderer-react/dist/index.js'),
          },
          {
            find: '@mdwrk/markdown-editor-react/styles/default.css',
            replacement: path.resolve(workspaceRoot, 'packages/editor/markdown-editor-react/src/styles/default.css'),
          },
          {
            find: /^@mdwrk\/markdown-editor-react$/,
            replacement: path.resolve(workspaceRoot, 'packages/editor/markdown-editor-react/dist/index.js'),
          },
          {
            find: '@mdwrk/lander-theme/styles/default.css',
            replacement: path.resolve(workspaceRoot, 'packages/lander/lander-theme/src/styles/default.css'),
          },
          {
            find: /^@mdwrk\/lander-content-contract$/,
            replacement: path.resolve(workspaceRoot, 'packages/lander/lander-content-contract/dist/index.js'),
          },
          {
            find: /^@mdwrk\/lander-core$/,
            replacement: path.resolve(workspaceRoot, 'packages/lander/lander-core/dist/index.js'),
          },
          {
            find: /^@mdwrk\/lander-schema$/,
            replacement: path.resolve(workspaceRoot, 'packages/lander/lander-schema/dist/index.js'),
          },
          {
            find: /^@mdwrk\/lander-seo$/,
            replacement: path.resolve(workspaceRoot, 'packages/lander/lander-seo/dist/index.js'),
          },
          {
            find: /^@mdwrk\/lander-react$/,
            replacement: path.resolve(workspaceRoot, 'packages/lander/lander-react/dist/index.js'),
          },
          {
            find: '@mdwrk/ui-tokens/styles/root.css',
            replacement: path.resolve(workspaceRoot, 'packages/shared/ui-tokens/src/styles/root.css'),
          },
          {
            find: '@mdwrk/ui-tokens/styles/markdown.css',
            replacement: path.resolve(workspaceRoot, 'packages/shared/ui-tokens/src/styles/markdown.css'),
          },
          {
            find: /^@mdwrk\/ui-tokens\/theme-map$/,
            replacement: path.resolve(workspaceRoot, 'packages/shared/ui-tokens/dist/theme-map.js'),
          },
          {
            find: /^@mdwrk\/ui-tokens$/,
            replacement: path.resolve(workspaceRoot, 'packages/shared/ui-tokens/dist/index.js'),
          },
          {
            find: '@',
            replacement: path.resolve(__dirname, '.'),
          },
        ]
      }
    };
});
