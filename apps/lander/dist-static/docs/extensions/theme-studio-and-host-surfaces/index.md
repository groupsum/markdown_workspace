# Theme Studio And Host Surfaces

Theme Studio demonstrates how first-party extensions use host surfaces, theme contracts, workspace panes, and export flows inside the MdWrk extension model.

## Theme Studio

Theme Studio is the first-party extension surface for:

- inspecting formal theme tokens
- previewing token changes against editor and preview bridges
- applying and reverting draft theme changes
- exporting theme artifacts for host, renderer, or editor targets

## Shared contract

Theme compatibility is governed through `@mdwrk/theme-contract`. That contract allows:

- client built-in themes
- extension-authored themes
- renderer and editor bridge variables
- exportable CSS and preset payloads

## Why this matters

The lander now uses the same editor and renderer package family with lander light and dark themes, instead of documenting itself as if it were the main product.
