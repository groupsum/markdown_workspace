# UI/UX Implementation Checklist

## Requested items
- [x] md line and editor width alignment and strict rule in style guide and tests. Use tokens to ensure alignment between the line height of these elements on all themes.
- [x] on mobile UIX, the view toolbar/editor tool bar shall be directly above the footer bar.
- [x] when create a checkbox, only create it, do not select it after creation.
- [x] on mobile UIX, raise footer and page up with the keyboard.
- [x] when making UL or OLs, assume the next line is an LI and typeahead on enter. On second enter, if no LI content was included with the LI, then assume next line is not an LI.
- [ ] Option to turn off line count bars.
- [ ] line count must be aligned with editor when y-scrolled.
- [x] on mobile UIX, keep bars and panes in place. Panes shall be y-scrollable.
- [ ] ability to import markdown files.
- [ ] file explorer and git ops expandable rail on mobile UIX shall have full width. Use CSS tokens to align expandable rails like file explorer and git ops.
- [x] when creating a new checkbox, maintain the focus on the line and line character. Do not move focus to the top of the editor.

## What remains to do
- Add or verify full support for line count bar visibility toggles in all required contexts.
- Verify and, if needed, tighten line count alignment with editor content while vertically scrolling.
- Add markdown file import capability.
- Ensure mobile expandable rails for file explorer and git ops are full-width and token-aligned.
