# MdWork Client
## Deterministic Markdown Rack System

MdWork is an offline-first, high-density Markdown workspace built on the **"Metallic Chassis Rack System"** philosophy. The interface is treated as a physical industrial console where functional surfaces (Plates) are slotted into a rigid structural grid (Chassis).

---

### 1. Structural Mental Model (ASCII)

The application follows a monolithic chassis partitioned by heavy divides and crisp optical alignment. Every component is a "Plate" that fits into the "Rack".

```text
_______________________________________________________________________
| [H] APP_HEADER (Tabs, System Status, Global Scaling)               |
|_____________________________________________________________________|
| [A] | [W] WORK_PANE (Structural Manifold)                          |
|     |_______________________________________________________________|
| ACT | [E] EXPLORER    | [S] SPLIT_STAGE (EDITOR / PREVIEW)          |
| ION |                 |                                             |
|     | (Registry Tree) | (Execution Core)    | (Render Output)       |
| RAI |                 |                     |                       |
| L   |                 |                     |                       |
|_____|_________________|_____________________|_______________________|
| [F] STATUS_BAR (Telemetry, Storage Health, PWA Version)             |
|_____________________________________________________________________|
```

---

### 2. Component System Architecture

#### [H] App Header (The Control Deck)
The primary system navigation and identity layer.
- **Context Tabs**: Zero-navigation switching between active buffers using a physical tab-strip metaphor.
- **Brand/Project**: Quick context switching via the Project Selector.
- **System Controls**: Global UI density scaling and direct access to systemic settings.

#### [A] Action Rail (Atomic I/O)
The high-frequency vertical strip designed for "one-click" deterministic operations.
- **Mode Toggle**: Switches between Workspace (Manifold) and Git/Sync views.
- **Structure Controls**: Collapse/Expand the Registry (Explorer).
- **Physical Actions**: Instant File/Folder creation and data persistence triggers.

#### [W] Work Pane (The Manifold)
The main structural container that orchestrates the relationship between the file system and the execution stage.
- **Heavy Divide**: Manages the 2px-4px "gap" or contact points between the Sidebar and the Stage.
- **Transition Logic**: Animates the sliding "Plates" when the explorer is toggled.

#### [E] Explorer (The Registry)
A dense, scan-optimized hierarchical tree structure for navigating the IndexedDB node-set.
- **State Awareness**: Highlights the active document and handles drag-and-drop structural reorganization.
- **Materiality**: Uses high-contrast backgrounds to differentiate from the editing surface.

#### [S] Split Stage (The Execution Core)
The primary functional surface for data entry and visualization.
- **Deterministic Split**: A resizable divide between raw Markdown input and the GFM rendered output.
- **GFM Engine**: Full support for tables, task lists, and syntax-highlighted code blocks.
- **Telemetry**: Sends real-time LN/COL coordinates to the Status Bar.

#### [F] Status Bar (Telemetry Surface)
The always-available strip for environment awareness and health monitoring.
- **Caret Tracking**: Precision cursor positioning.
- **Persistence Health**: Explicit visibility of IndexedDB stability (Synced/Dirty states).
- **PWA Awareness**: Online/Offline status and version telemetry.

---

### 3. Technical Principles (Brutahaus Logic)

- **Offline-First**: Powered by a service worker and IndexedDB primary storage. 
- **Deterministic UI**: State is persisted locally so the app resumes exactly where you left off.
- **Milled Zinc Aesthetic**: Utilizing high-contrast borders and radial microgrids to simulate physical materiality.
- **Optical Type**: Typefaces are selected and scaled for maximum legibility in high-density, low-chrome environments.

> "Structure is the only truth in a digital layout."

---

### 4. Viewport + Aspect Ratio Matrix

MdWork defines a shared breakpoint contract in the core stylesheet so every theme responds to the same aspect ratios, viewboxes, and device classes while still styling them uniquely. The canonical definitions live in `apps/client/styles/base/viewports.css`.【F:apps/client/styles/base/viewports.css†L1-L120】

**Aspect Ratio Bands (aspect first)**
- **Portrait**: `max-aspect-ratio: 3/4`
- **Square/Hybrid**: `min-aspect-ratio: 3/4` and `max-aspect-ratio: 4/3`
- **Landscape**: `min-aspect-ratio: 4/3` and `max-aspect-ratio: 16/9`
- **Wide**: `min-aspect-ratio: 16/9` and `max-aspect-ratio: 21/9`
- **Ultra-wide**: `min-aspect-ratio: 21/9`

**Viewbox Size Bands (viewbox second)**
- **XXS**: `max-width: 359px`
- **XS**: `min-width: 360px` and `max-width: 479px`
- **SM**: `min-width: 480px` and `max-width: 599px`
- **MD**: `min-width: 600px` and `max-width: 767px`
- **LG**: `min-width: 768px` and `max-width: 1023px`
- **XL**: `min-width: 1024px` and `max-width: 1439px`
- **XXL**: `min-width: 1440px` and `max-width: 1919px`
- **XXXL**: `min-width: 1920px`
- **XX-short height**: `max-height: 359px`
- **X-short height**: `min-height: 360px` and `max-height: 479px`
- **Short height**: `min-height: 480px` and `max-height: 599px`
- **Compact height**: `min-height: 600px` and `max-height: 719px`
- **Medium height**: `min-height: 720px` and `max-height: 899px`
- **Tall height**: `min-height: 900px` and `max-height: 1079px`
- **X-tall height**: `min-height: 1080px` and `max-height: 1279px`
- **Ultra-tall height**: `min-height: 1280px`

**Device Bands (device third)**
- **Touch**: `(hover: none) and (pointer: coarse)`
- **Precision**: `(hover: hover) and (pointer: fine)`

Themes may reinterpret spacing, shadows, and toolbar layouts at each breakpoint, but they must use the same breakpoint definitions to preserve the shared viewport contract. The Micropress theme uses these bands to keep its floating view toolbar aligned with the editor body corner while other themes interpret the bands with their own visual treatments.【F:apps/client/styles/themes/theme-micropress.css†L66-L149】
