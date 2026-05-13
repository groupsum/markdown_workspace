# @mdwrk/markdown-renderer-core

Use the renderer core package when a product needs Markdown parsing and HTML rendering without adopting the full MdWrk client.

`@mdwrk/markdown-renderer-core` provides Markdown parsing and rendering utilities for package-level preview and HTML output. It is useful when a product needs MdWrk-aligned Markdown behavior without adopting the full workspace client.

Install:

```bash
npm install @mdwrk/markdown-renderer-core
```

The package belongs to the reusable renderer family. The lander presents it as part of MdWrk product truth, while the portable lander packages only render the package-page shape, metadata, FAQ, and schema.

Use this surface when the implementation needs Markdown behavior that can be tested, documented, and reused without importing the full client. The package keeps renderer adoption explicit, which helps product teams separate content parsing, HTML output, and application-specific presentation.

## Frequently Asked Questions

### What is @mdwrk/markdown-renderer-core?

It is the package-level Markdown parsing and rendering surface used by MdWrk renderer workflows.
