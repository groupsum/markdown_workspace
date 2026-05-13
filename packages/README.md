# packages/

[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages.readme&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/README.md)
[![Downloads](https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads)](https://github.com/groupsum/markdown_workspace/releases)

This directory contains the reusable MdWrk workspace packages.

## Package Families

- `packages/contracts/*` - extension, host, and theme contracts
- `packages/shared/*` - reusable tokens, icons, i18n, and testing helpers
- `packages/renderer/*` - portable Markdown renderer packages
- `packages/editor/*` - portable Markdown editor packages
- `packages/extensions/*` - extension runtime and first-party extension packages

Package build output is generated into each package's `dist/` directory by the relevant build script. Those generated directories are intentionally ignored by Git and should be regenerated from source.
