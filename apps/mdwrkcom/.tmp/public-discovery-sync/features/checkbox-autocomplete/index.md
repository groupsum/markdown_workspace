# Checkbox Autocomplete

Checkbox autocomplete documents how MdWrk turns list authoring into task-list Markdown while preserving plain-text portability.

## What Checkbox Autocomplete Is For

Checkbox autocomplete helps writers create task lists without memorizing every Markdown marker. MdWrk keeps the source document portable by writing normal task-list syntax such as `- [ ] Task` and `- [x] Done`.

Use this page when you want the current checklist behavior for notes, issue plans, release checklists, and documentation tasks.

## Supported Markdown Shape

MdWrk treats these forms as task-list rows:

```markdown
- [ ] Draft the doc
- [x] Review the change
1. [ ] Verify the build
```

The editor command layer can convert a plain line, bullet line, or ordered-list line into a task-list item. The renderer then displays the checkbox state while keeping the original Markdown available for export, Git, and copy/paste.

## Authoring Flow

1. Put the cursor on a line or select multiple lines.
2. Use the task-list toolbar action.
3. Continue writing the task text.
4. Press `Enter` to continue the checklist.
5. Press `Enter` on an empty checklist row to leave the list.

The behavior is implemented in the editor command and list-continuation pipeline, so toolbar and keyboard entry stay aligned.

## Focus Behavior

Checkbox rows remain part of the source editor document. Toggling or continuing a checklist should keep the writing flow in the editor instead of forcing the user to recover focus from the preview.

## Related Docs

- [Editor Basics](/features/editor-basics)
- [Advanced Markdown Formatting](/features/advanced-formatting)
- [View Toolbar](/features/view-toolbar/)

## Frequently Asked Questions

### What will I learn from Checkbox Autocomplete?

Checkbox autocomplete documents how MdWrk turns list authoring into task-list Markdown while preserving plain-text portability.

### Who should read Checkbox Autocomplete?

Read this page if you need practical MdWrk guidance for checkbox autocomplete, including the relevant workflow, product surface, and follow-up documentation paths.
