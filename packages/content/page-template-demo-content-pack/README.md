# Page Template Demo Content Pack

Example content pack that demonstrates how downstream apps can consume `@mdwrk/lander-page-template-presets` and `@mdwrk/lander-page-templates`.

## Maintenance Status

This is a legacy bridge package in `groupsum/markdown_workspace`.

- Active maintenance moved to `groupsum/mdwrk-pages`.
- Install compatibility remains on the same npm package name: `@mdwrk/page-template-demo-content-pack`.
- Repository source of truth: [https://github.com/groupsum/mdwrk-pages/tree/master/packages/content/page-template-demo-content-pack](https://github.com/groupsum/mdwrk-pages/tree/master/packages/content/page-template-demo-content-pack)
- Bridge releases from this repo emit an install-time deprecation warning so downstream users can migrate without an immediate package rename.

```ts
import {
  getPageTemplateDemoHomeNavigation,
  pageTemplateDemoContentPack,
} from "@mdwrk/page-template-demo-content-pack";

for (const page of pageTemplateDemoContentPack.pages) {
  console.log(page.slug, page.title);
}

console.log(getPageTemplateDemoHomeNavigation().related);
```

The package builds a product-site preset with authored content overrides, compiles the graph to `PageSpec` objects, and exposes helper functions for page lookup, home navigation, and home link slots.
