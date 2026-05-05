# Build with the Same MdWrk Editor and Renderer the Client Ships

MdWrk packages its editor and renderer as reusable modules, giving product teams a direct path to embed the same authoring and preview surfaces the client uses every day.

## Why this matters

Reusable packages give teams a clear path to:

- ship MdWrk-powered editing inside internal tools
- reuse the same renderer in docs, apps, and examples
- keep extension work aligned with stable public package contracts
- move from first integration to broader adoption with a package set that already fits the live client

## What you can install today

The public package family starts here:

```bash
npm install @mdwrk/mdwrkspace @mdwrk/markdown-editor-react @mdwrk/markdown-renderer-react
```

These docs carry the current usage details:

- [Client installation](/docs/getting-started/installation)
- [Standalone modules](/docs/getting-started/standalone-modules)
- [Local setup](/docs/getting-started/local-setup)

## React example

```tsx
import { MarkdownEditor } from '@mdwrk/markdown-editor-react';
import { MarkdownViewer } from '@mdwrk/markdown-renderer-react';
import { useState } from 'react';

export function MdWrkDemo() {
  const [value, setValue] = useState('# Release Notes\n\nMdWrk packages travel well.');

  return (
    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
      <MarkdownEditor value={value} onChange={setValue} />
      <MarkdownViewer content={value} />
    </div>
  );
}
```

## Screenshot

![MdWrk editor and preview running side by side](/blog/media/mdwrk-workspace-split.png)

This split-view surface shows the kind of install target product teams get when they adopt the package family directly.

## Repository history that shapes the package surface

The package move sits inside a broader history arc:

- [Standalone modules](/docs/getting-started/standalone-modules)
- [Extension platform](/docs/extensions/extension-platform)
- [Repository history for package alignment](https://github.com/groupsum/markdown_workspace/commits/master/?since=2026-03-23T00:00:00Z&until=2026-03-24T00:00:00Z)

## Who should use this package family

This package family fits:

- React application teams that want a markdown editor and renderer with a shared visual contract
- platform teams building governed docs or knowledge surfaces
- extension teams that want their work to sit close to the live MdWrk runtime

MdWrk turns package reuse into a practical adoption path, and this post marks the point where that path becomes easier to install, easier to use, and easier to extend.

## Frequently Asked Questions

### What does this MdWrk update cover?

MdWrk packages its editor and renderer as reusable modules, giving product teams a direct path to embed the same authoring and preview surfaces the client uses every day.

### What should readers take away from this update?

This article explains the MdWrk product change, the workflow it affects, and where readers can continue in the related documentation.
