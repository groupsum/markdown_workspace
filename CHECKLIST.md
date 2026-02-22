# UI/UX Implementation Checklist

## Requested items
- [x] md line and editor width alignment and strict rule in style guide and tests. Use tokens to ensure alignment between the line height of these elements on all themes.
- [ ] File explorer and git ops expandables must be 100% of the width on mobile UIX portrait mode.
- [ ] On mobile UIX portrait mode, the view toolbar with bold, italic, etc. shall be on the bottom of the screen above the action rail containing the file explorer and cloud sync buttons.
- [x] when create a checkbox, only create it, do not select it after creation.
- [x] on mobile UIX, raise footer and page up with the keyboard.
- [x] when making UL or OLs, assume the next line is an LI and typeahead on enter. On second enter, if no LI content was included with the LI, then assume next line is not an LI.
- [x] Option to turn off line count bars.
- [x] line count must be aligned with editor when y-scrolled.
- [x] on mobile UIX, keep bars and panes in place. Panes shall be y-scrollable.
- [x] ability to import markdown files.
- [ ] On mobile UIX portrait mode, the file tabs bar shall be above the workspace pane and shall be 100% width.
- [x] when creating a new checkbox, maintain the focus on the line and line character. Do not move focus to the top of the editor.

## What remains to do
- Mobile UIX portrait: make file explorer and git ops expandables 100% width.
- Mobile UIX portrait: move the view toolbar above the action rail at the bottom.
- Mobile UIX portrait: place file tabs bar above the workspace pane at 100% width.
