# LATTICE ARCHITECT v2
## Deterministic Markdown Rack System

Lattice Architect is an offline-first, high-density Markdown workspace built on the **"Metallic Chassis Rack System"** philosophy. The interface is treated as a physical industrial console where functional surfaces (Plates) are slotted into a rigid structural grid (Chassis).

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