import { wrapSelection } from "./selection.js";
import { indentSelection, outdentSelection } from "./transforms.js";
export const BUILTIN_MARKDOWN_EDITOR_COMMANDS = [
    "bold",
    "italic",
    "strikethrough",
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