export const advancedFormattingContent = `---
title: Advanced Formatting
toc: true
---
# Advanced Formatting

Beyond basic bold and italic, MarkSpace supports extensive formatting options.

## Tables
Create tables using pipes \`|\` and dashes \`-\`.

\`\`\`markdown
| Feature | Supported |
| :--- | :---: |
| Tables | Yes |
| Alignment | Yes |
\`\`\`

## Code Blocks
Syntax highlighting is supported for most major languages.

\`\`\`typescript
function hello() {
  console.log("MarkSpace");
}
\`\`\`

## Task Lists
Great for tracking to-do items.
- [x] Install MarkSpace
- [ ] Write first document
- [ ] Sync to GitHub

## Footnotes
You can add footnotes like this[^1].

[^1]: This is the footnote text.

## Strikethrough & Superscript
- ~~Strikethrough~~: \`~~text~~\`
- Superscript: \`^text^\`
- Subscript: \`~text~\``;