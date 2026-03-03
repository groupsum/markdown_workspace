# Theme Screenshot Checklist

Use this checklist for every visual QA run.

## Required coverage

For **every supported aspect ratio class**, capture **at least 5 screenshots** that show meaningful state progression (different views, panes, modes, or interactions), not duplicate frames.

### Aspect ratio classes

- Portrait
- Square / Hybrid
- Landscape
- Wide
- Ultra-wide

### Minimum screenshot count per class

- Portrait: 5+
- Square / Hybrid: 5+
- Landscape: 5+
- Wide: 5+
- Ultra-wide: 5+

## Theme coverage

For each screenshot set above, verify all shipped themes are represented during review:

- acid-etched
- zinc
- anodized-billet
- micropress
- default

These captures are required for validating responsive behavior and theme rendering consistency after UI or stylesheet changes.

## Mobile landscape markdown-editor capture protocol

When a request asks for mobile landscape editor QA (excluding project selection), include an editor-only capture set that keeps **width > height** for every frame:

- Enter a workspace/project first, then switch away from project selection before the first capture.
- Capture markdown editor states (split, editor-only, preview-only) with active document content visible.
- Include at least 3 keyboard-active states by keeping editor focus and reducing viewport height while still in landscape orientation.
- Do not substitute project grid screenshots for editor workflow screenshots.
