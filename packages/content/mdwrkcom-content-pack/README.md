# @mdwrk/mdwrkcom-content-pack

[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages.content.mdwrkcom_content_pack.readme&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/content/mdwrkcom-content-pack/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fmdwrkcom-content-pack?label=downloads)](https://www.npmjs.com/package/@mdwrk/mdwrkcom-content-pack)

`@mdwrk/mdwrkcom-content-pack` packages the public MdWrk lander content as a reusable lander content pack.

It vendors the current `apps/mdwrkcom` content corpus:

- `content/` for authored route pages.
- `data/markdown/` for markdown docs, blog, legal, and supporting content.
- `data/content-sitemap.yaml` for non-doc markdown registration.
- `public/` for public content assets and AI/search discovery files.
- `generated/` for generated content indexes and discovery artifacts that are available in the current static build output.

Consumers can import the package metadata:

```ts
import {
  mdwrkcomContentPack,
  resolveMdwrkcomContentPackPath,
} from "@mdwrk/mdwrkcom-content-pack";

const sitemapPath = resolveMdwrkcomContentPackPath(mdwrkcomContentPack.sitemapPath);
```

Static content files are exposed through package subpaths:

```ts
const quickstartUrl = new URL(
  "@mdwrk/mdwrkcom-content-pack/content/pages/docs/quickstart.md",
  import.meta.url,
);
```

The package smoke test checks that the vendored content mirrors `apps/mdwrkcom` in this repository.
