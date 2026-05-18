# Extension runtime

The MdWrk extension runtime gives package authors a documented way to add commands, panes, settings, and integrations.

The MdWrk extension runtime gives package authors a governed way to extend the workspace. Instead of patching the client directly, extensions describe their contribution through documented package and manifest surfaces.

This matters for trust and portability. Runtime lifecycle, compatibility metadata, installable artifacts, and host context stay explicit, which makes extension behavior easier to inspect and easier to verify.

The reusable lander package does not contain any MdWrk extension claim. MdWrk-specific extension facts live here in the content pack, while the lander packages render feature pages generically.

## Frequently Asked Questions

### What is the MdWrk extension runtime?

The extension runtime is the governed host surface for adding commands, panes, settings, and integrations to MdWrk.

### Do extensions patch the client directly?

No. Extensions are expected to use documented manifests, compatibility rules, lifecycle hooks, and trust boundaries.
