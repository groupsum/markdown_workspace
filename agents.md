Always use screenshots to show all views, modes, panes, and modals for each and every theme such that we can validate each and every theme for each and every view, mode, pane, modal.
Always increment the package version on every commit, using only minor or patch releases.
Docker Compose must never expose ports.
Viewport + aspect ratio breakpoints are defined once in client/public/css/base/viewports.css and must remain consistent across themes; themes are responsible for unique styling per band. The contract includes portrait, square/hybrid, landscape, wide, and ultra-wide aspect ratios plus XS/SM/MD/LG/XL/XXL width tiers, short/compact/tall/ultra-tall height tiers, and touch/precision device classes.
