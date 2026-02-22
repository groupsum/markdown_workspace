# UI/UX Implementation Checklist

## Requested items
- [ ] md line and editor width alignment and strict rule in style guide and tests. Use tokens to ensure alignment between the line height of these elements on all themes.
- [ ] on mobile uix, the view toolbar/editor tool bar shall be directly above the footer bar
- [ ] when create a checkbox, only create it, do not select it after creation, do not jump to the top of the file. After creating the type cursor should be ahead of the checkbox by one whitespace
- [x] on mobile uix, raise footer and page up with the keyboard
- [x] when making ul or ols, assume the next line is a li and typeahead on enter. On second enter, if no li content was included with the li, then assume next line is not an li.
- [x] Option to turn off line count bars.
- [ ] line count must be aligned with editor when y-scrolled.
- [x] on mobile uix, keep bars and panes in place. Panes shall be y scrollable.
- [x] ability to import markdown files
- [x] git ops' expandable rail on mobile uix shall have full width. Use css tokens to align expandable rails like git ops.
- [ ] file explorer expandable rail on mobile uix shall have full width. Use css tokens to align expandable rails like file explorer and git ops.
- [ ] when creating a new checkbox, maintain the focus on the line and line character. Do not move focus to the top of the editor.
- [ ] remove idb: persistent from the status bar footer.
- [ ] remove state: saved. From statis bar footer. Simply autosave everything.
- [ ] fix the header bar such that the install button is not present after pwa is installed. Also give the settings icon a very very small ampunt of extra top margin and right margin.
- [ ] reverse the action rail on mobile uix portrait. Add css token for this, implement same value on all themes.
- [ ] fix underlining
- [ ] make anondized billet the default theme
- [ ] fix filetabs on mobile uix portrait.
- [ ] hide the status bar on mobile uix landscape
- [ ] update the system config to show the pwa version there.
- [ ] hide the status footer bar on mobile uix portrait.
- [ ] hide keyboard mappings modal view tab on mobile uix
- [ ] show gesture mappings view tab on mobile uix
