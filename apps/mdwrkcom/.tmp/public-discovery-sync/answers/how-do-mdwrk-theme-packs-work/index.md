# How do MdWrk theme packs work?

A direct answer about MdWrk theme pack contracts and portable styling.

MdWrk theme packs target governed token and surface contracts so styling can travel across editor, preview, and lander surfaces. The goal is to keep visual customization portable instead of tying every theme to private implementation details.

That contract-based approach helps package authors, extension authors, and product contributors work against stable styling surfaces. A theme can express product identity while the underlying reusable packages keep their generic behavior.

In practice, theme packs make it easier to change appearance without rewriting renderer, editor, or extension logic.

## Frequently Asked Questions

### How do MdWrk theme packs work?

MdWrk theme packs target governed token and surface contracts instead of patching product internals.
