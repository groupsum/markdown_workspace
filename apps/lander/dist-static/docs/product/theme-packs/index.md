# Theme Packs

MdWrk theme packs use a shared token and class-name contract so editor, renderer, extension, and workspace surfaces can be styled without private app selectors.

## Theme Contract

Theme packs target shared tokens, bridge variables, and class names. This keeps theme behavior portable across the editor, renderer, host, and extension views.

## Theme Studio

The Theme Studio extension provides a first-party authoring workflow for inspecting tokens, previewing editor and renderer changes, applying draft values, reverting them, and exporting theme artifacts.

## Viewport Contract

Viewport and aspect-ratio breakpoints stay defined once in the client viewport contract. Themes can style each band, but they do not redefine the responsive taxonomy.

## Related Docs

- [Theme Pack Authoring](/docs/authoring/theme-packs)
- [Theme Studio And Host Surfaces](/docs/extensions/theme-studio-and-host-surfaces)
- [Client Configuration](/docs/getting-started/configuration)

## Frequently Asked Questions

### What is Theme Packs?

MdWrk theme packs use a shared token and class-name contract so editor, renderer, extension, and workspace surfaces can be styled without private app selectors.

### When should I use Theme Packs?

Use this docs when you need direct MdWrk guidance for theme packs.
