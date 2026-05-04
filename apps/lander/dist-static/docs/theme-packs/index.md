# Theme packs

MdWrk theme packs document the token and styling contract for workspace presentation so visual changes can be inspected without changing Markdown source content.

Theme packs describe how MdWrk presents the Markdown workspace without changing the underlying Markdown source. The documentation separates content, rendering, and theme behavior so users know what is styling and what is document data.

## Theme Contract

A theme should define visual tokens, layout behavior, syntax colors, and component styling boundaries. It should not rewrite public content or hide important text from crawlers and readers.

## Syntax Color

Code block syntax colors must be visible in generated HTML when the renderer emits token classes. Lander themes define different color variables for light and dark modes, while the static compiler keeps source content readable.

## Extension Relationship

Theme packs may be delivered through extension surfaces, but the documentation should explain which package owns the contract and how the workspace applies the visual layer.

## Frequently Asked Questions

### What will I learn from Theme packs?

MdWrk theme pack docs explain theme contracts, token surfaces, visual boundaries, and how Markdown workspace styling remains inspectable.

### Who should read Theme packs?

Read this page if you need practical MdWrk guidance for theme packs, including the relevant workflow, product surface, and follow-up documentation paths.
