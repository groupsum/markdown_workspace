import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@mdwrk/lander-content-contract": "../../packages/lander/lander-content-contract/dist/index.js",
      "@mdwrk/lander-core": "../../packages/lander/lander-core/dist/index.js",
      "@mdwrk/lander-page-template-presets": "../../packages/lander/lander-page-template-presets/dist/index.js",
      "@mdwrk/lander-page-templates": "../../packages/lander/lander-page-templates/dist/index.js",
      "@mdwrk/lander-react": "../../packages/lander/lander-react/dist/index.js",
      "@mdwrk/page-template-demo-content-pack": "../../packages/content/page-template-demo-content-pack/dist/index.js",
      "@mdwrk/structured-data": "../../packages/shared/structured-data/dist/index.js",
    },
  },
});
