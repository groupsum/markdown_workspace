import { wrapSelection } from "./selection.js";
import { applyBulletListSelection, applyTaskListSelection, indentSelection, outdentSelection } from "./transforms.js";
export const BUILTIN_MARKDOWN_EDITOR_COMMANDS = [
    "bold",
    "italic",
    "strikethrough",
    "bullet-list",
    "task-list",
    "front-matter",
    "footnote",
    "inline-math",
    "block-math",
    "superscript",
    "subscript",
    "citation",
    "indent",
    "outdent",
    "undo",
    "redo",
    "insert-tab",
];
export function applyBuiltinMarkdownCommand(command, value, selection, options = {}) {
    switch (command) {
        case "bold":
            return wrapSelection(value, selection, "**", "**");
        case "italic":
            return wrapSelection(value, selection, "_", "_");
        case "strikethrough":
            return wrapSelection(value, selection, "~~", "~~");
        case "bullet-list":
            return applyBulletListSelection(value, selection);
        case "task-list":
            return applyTaskListSelection(value, selection);
        case "front-matter": {
            const frontMatter = "---\ntitle: \n---\n\n";
            if (String(value).startsWith("---\n")) {
                return { value, selection, changed: false };
            }
            return {
                value: `${frontMatter}${value}`,
                selection: {
                    start: 10,
                    end: 10,
                    direction: 'none',
                },
                changed: true,
            };
        }
        case "footnote":
            return wrapSelection(value, selection, "[^1]", "");
        case "inline-math":
            return wrapSelection(value, selection, "$", "$");
        case "block-math":
            return wrapSelection(value, selection, "$$\n", "\n$$");
        case "superscript":
            return wrapSelection(value, selection, "^", "^");
        case "subscript":
            return wrapSelection(value, selection, "~", "~");
        case "citation":
            return wrapSelection(value, selection, "[@", "]");
        case "indent":
        case "insert-tab":
            return indentSelection(value, selection, options.indentUnit ?? "\t");
        case "outdent":
            return outdentSelection(value, selection, options.indentUnit ?? "\t");
        case "undo":
        case "redo":
            return {
                value,
                selection,
                changed: false,
            };
        default: {
            const exhaustiveCheck = command;
            throw new Error(`Unsupported markdown editor command: ${String(exhaustiveCheck)}`);
        }
    }
}
//# sourceMappingURL=commands.js.map