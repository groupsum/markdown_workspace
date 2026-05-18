# Page Template Demo Content Pack

Example content pack that demonstrates how downstream apps can consume `@mdwrk/lander-page-template-presets` and `@mdwrk/lander-page-templates`.

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
