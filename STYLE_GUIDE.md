# STYLE GUIDE

## Supported aspect ratios and device sizes

This project supports the following presentation targets.

### Orientation + ratio targets
- Portrait
- Landscape
- Square / hybrid
- Wide desktop
- Ultra-wide desktop

### Product form-factor targets
- Mobile PWA
- Mobile web browser
- Tablet
- Half-screen desktop
- Full-screen desktop
- Ultra-wide desktop

### Width tiers (contract)
- XS: `<= 480px`
- SM: `<= 640px`
- MD: `<= 900px`
- LG: `<= 1200px`
- XL: `>= 1600px`
- XXL: `>= 1920px`

### Height tiers (contract)
- Short: `<= 520px`
- Compact: `<= 720px`
- Tall: `>= 900px`
- Ultra-tall: `>= 1200px`

### Input/device classes
- Touch (`hover: none`, `pointer: coarse`)
- Precision (`hover: hover`, `pointer: fine`)

## Source of truth
Viewport/aspect-ratio breakpoint variables are defined in:

- `client/public/css/base/viewports.css`

Themes must preserve this contract and only provide style differentiation per band.

## Markdown/editor alignment contract (strict)
- Editor line-height and rendered markdown line-height **must** use shared CSS tokens.
- Line number gutter rhythm **must** match editor line-height token so line bars align across themes.
- Tokens are defined in `client/styles/base/root.css` (`--editor-line-height`, `--markdown-line-height`, `--line-number-gutter-width`) and consumed by editor/markdown styles.
- Any theme-level override must preserve equal line-height values between editor and markdown.
