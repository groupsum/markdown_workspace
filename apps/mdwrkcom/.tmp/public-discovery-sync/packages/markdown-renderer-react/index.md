# @mdwrk/markdown-renderer-react

Use the React renderer package when a product needs MdWrk-aligned Markdown rendering inside React.

`@mdwrk/markdown-renderer-react` gives React applications a package-level route into MdWrk-aligned Markdown rendering. It pairs with the renderer core package and keeps rendering behavior reusable outside the full workspace client.

Install:

```bash
npm install @mdwrk/markdown-renderer-react
```

Use this package when a product needs a React Markdown preview surface that can stay aligned with MdWrk examples, docs, and client behavior.

The React package is intentionally described as a reusable surface instead of a hidden implementation detail. That makes package adoption clear for teams that need preview behavior inside another application while keeping MdWrk-specific product positioning in the content pack.

## Frequently Asked Questions

### What is @mdwrk/markdown-renderer-react?

It is the React binding package for rendering Markdown through MdWrk's renderer family.
