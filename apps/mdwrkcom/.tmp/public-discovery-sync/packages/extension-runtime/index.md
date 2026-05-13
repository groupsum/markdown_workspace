# @mdwrk/extension-runtime

Use the extension runtime package when building governed commands, panes, settings, and integration surfaces.

`@mdwrk/extension-runtime` provides portable runtime utilities for governed MdWrk extension behavior. It supports the package-level extension model behind commands, panes, settings, and integrations.

Install:

```bash
npm install @mdwrk/extension-runtime
```

Use this package when extension behavior needs to stay explicit, inspectable, and compatible with MdWrk host surfaces.

The runtime package keeps extension behavior out of undocumented client patches. A package author can reason about lifecycle, host context, compatibility, and trust policy as stable surfaces that can be documented, validated, and reused across delivery targets.

## Frequently Asked Questions

### What is @mdwrk/extension-runtime?

It is the portable package for MdWrk extension runtime behavior, lifecycle, and host-facing contracts.
