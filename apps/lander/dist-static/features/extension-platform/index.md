# Extension platform for Markdown workflows

MdWrk includes an extension platform model for Markdown workflows, with public documentation covering host boundaries, manifests, runtime expectations, trust policy, and related package surfaces.

The MdWrk extension platform gives developers a governed way to reason about workspace extensions. Rather than presenting extension behavior as an informal plugin story, MdWrk documents host boundaries, manifest metadata, compatibility checks, and runtime expectations.

## Host Boundary

The extension host is the product surface that coordinates extension behavior. Public documentation explains which capabilities belong to the host, which belong to a specific extension package, and which workflows remain out of scope.

## Manifest And Trust

Extension manifests provide a visible contract for identity, capabilities, compatibility, and package expectations. Trust is not assumed only because a package exists. The lander should describe what the user or operator can inspect before enabling extension behavior.

## Runtime Documentation

Runtime documentation should be practical. It should show what an extension can render, which settings or workspace surfaces it uses, and how it participates in a local-first Markdown workflow without hiding data movement.

## Related Developer Docs

Use the extension docs for host behavior, the theme pack docs for theme extension surfaces, and the quickstart for first-time workspace context.

## Frequently Asked Questions

### What is the MdWrk extension platform?

It is the governed package and runtime surface used to describe how extensions integrate with the Markdown workspace.

### Are extensions automatically trusted?

No. The documentation should describe manifest metadata, compatibility checks, and explicit trust boundaries instead of implying automatic trust.
