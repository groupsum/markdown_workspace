// @ts-nocheck
import { DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES, resolveMarkdownRendererClassNames } from "./class-names.js";
import { getMarkdownOptionalProfileDefinition, resolveMarkdownOptionalProfiles } from "./profiles.js";
import { slugifyHeading } from "./slug.js";
const DEFAULT_HTML_HANDLING = "escape";
const DEFAULT_MARKDOWN_PROFILE = "gfm-default";
const EMPTY_EXTENSIONS = Object.freeze([]);
const NAMED_ENTITIES = Object.freeze({
    amp: "&",
    apos: "'",
    copy: "©",
    gt: ">",
    lt: "<",
    nbsp: "\u00A0",
    quot: '"',
    reg: "®",
    trade: "™",
    hellip: "…",
    mdash: "—",
    ndash: "–",
    lsquo: "‘",
    rsquo: "’",
    ldquo: "“",
    rdquo: "”",
    ouml: "ö",
    auml: "ä",
    uuml: "ü",
    euml: "ë",
});
function normalizeLineEndings(value) {
    return String(value ?? "").replace(/\r\n?/g, "\n");
}
function splitLines(markdown) {
    const text = normalizeLineEndings(markdown);
    const source = text.endsWith("\n") ? text.slice(0, -1) : text;
    const rawLines = source.length ? source.split("\n") : [""];
    return rawLines.map((raw, index) => ({ raw, number: index + 1 }));
}
function resolveEnabledExtensions(options) {
    return resolveMarkdownOptionalProfiles(options?.extensions ?? EMPTY_EXTENSIONS);
}
function hasExtension(extensions, extensionId) {
    return Array.isArray(extensions) && extensions.includes(extensionId);
}
function buildMarkdownWarnings(extensions, htmlHandling) {
    const warnings = [];
    for (const extension of extensions ?? EMPTY_EXTENSIONS) {
        const definition = getMarkdownOptionalProfileDefinition(extension);
        if (!definition)
            continue;
        if ((definition.previewRequiresTrustedHtml || definition.exportRequiresTrustedHtml) && htmlHandling !== "allow-trusted") {
            warnings.push({
                profileId: extension,
                severity: "warning",
                code: `${extension}-requires-trusted-html`,
                message: `${definition.name} requires trusted HTML mode for full preview/export behavior.`,
            });
        }
        if (definition.status === "experimental") {
            warnings.push({
                profileId: extension,
                severity: "info",
                code: `${extension}-experimental`,
                message: `${definition.name} is available as an experimental profile and remains outside the Phase 4 certification boundary.`,
            });
        }
    }
    return warnings;
}
function extractFrontmatter(raw) {
    const normalized = normalizeLineEndings(raw);
    if (!normalized.startsWith("---\n")) {
        return {
            raw: normalized,
            content: normalized,
            maskedContent: normalized,
            metadata: {},
            removedLineCount: 0,
        };
    }
    const closingIndex = normalized.indexOf("\n---\n", 4);
    if (closingIndex === -1) {
        return {
            raw: normalized,
            content: normalized,
            maskedContent: normalized,
            metadata: {},
            removedLineCount: 0,
        };
    }
    const frontmatter = normalized.slice(4, closingIndex);
    const content = normalized.slice(closingIndex + 5);
    const metadata = {};
    for (const line of frontmatter.split("\n")) {
        const match = /^([^:#]+):\s*(.*)$/.exec(line);
        if (!match)
            continue;
        metadata[match[1].trim()] = match[2].trim();
    }
    const removedLineCount = frontmatter.length === 0 ? 2 : frontmatter.split("\n").length + 2;
    const prefix = "\n".repeat(Math.max(0, removedLineCount));
    return {
        raw: normalized,
        content,
        maskedContent: `${prefix}${content}`,
        metadata,
        removedLineCount,
    };
}
function clonePosition(position) {
    return {
        start: { ...position.start },
        end: { ...position.end },
    };
}
function createPosition(startLine, startColumn, endLine, endColumn) {
    return {
        start: { line: startLine, column: startColumn, offset: undefined },
        end: { line: endLine, column: endColumn, offset: undefined },
    };
}
function formatSourcePosition(position) {
    return `${position.start.line}:${position.start.column}-${position.end.line}:${position.end.column}`;
}
function appendClassName(node, className) {
    if (!className)
        return;
    const properties = (node.properties ??= {});
    const current = properties.className;
    if (Array.isArray(current)) {
        if (!current.includes(className))
            current.push(className);
        return;
    }
    if (typeof current === "string" && current.length > 0) {
        properties.className = Array.from(new Set(`${current} ${className}`.split(/\s+/g))).filter(Boolean);
        return;
    }
    properties.className = [className];
}
function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
function escapeAttribute(value) {
    return escapeHtml(String(value)).replace(/'/g, "&#39;");
}
function decodeEntity(entity) {
    if (entity[1] === "#") {
        const isHex = entity[2] === "x" || entity[2] === "X";
        const digits = entity.slice(isHex ? 3 : 2, -1);
        const codePoint = Number.parseInt(digits, isHex ? 16 : 10);
        if (Number.isNaN(codePoint) || codePoint < 0 || codePoint > 0x10FFFF) {
            return entity;
        }
        try {
            return String.fromCodePoint(codePoint);
        }
        catch {
            return entity;
        }
    }
    const name = entity.slice(1, -1);
    return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, name) ? NAMED_ENTITIES[name] : entity;
}
function decodeEntities(value) {
    return String(value).replace(/&(?:#x?[0-9A-Fa-f]+|[A-Za-z][A-Za-z0-9]+);/g, decodeEntity);
}
function isBlank(line) {
    return /^[ \t]*$/.test(line.raw);
}
function countIndent(raw) {
    let column = 0;
    for (const char of raw) {
        if (char === " ") {
            column += 1;
            continue;
        }
        if (char === "\t") {
            column += 4 - (column % 4);
            continue;
        }
        break;
    }
    return column;
}
function stripIndent(raw, amount) {
    if (amount <= 0)
        return raw;
    let column = 0;
    let index = 0;
    while (index < raw.length && column < amount) {
        const char = raw[index];
        if (char === " ") {
            column += 1;
            index += 1;
            continue;
        }
        if (char === "\t") {
            column += 4 - (column % 4);
            index += 1;
            continue;
        }
        break;
    }
    return raw.slice(index);
}
function leadingSlice(raw, amount) {
    const consumed = raw.length - stripIndent(raw, amount).length;
    return raw.slice(0, consumed);
}
function classifyHtmlBlock(raw) {
    const trimmed = raw.trimStart();
    if (/^<https?:\/\//i.test(trimmed) || /^<[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}>$/.test(trimmed)) {
        return null;
    }
    if (/^<(?:pre|script|style|textarea)(?:[\t >]|$)/i.test(trimmed))
        return { kind: "rawTag" };
    if (/^<!--/.test(trimmed))
        return { kind: "comment" };
    if (/^<\?/.test(trimmed))
        return { kind: "processing" };
    if (/^<![A-Z]/.test(trimmed))
        return { kind: "declaration" };
    if (/^<!\[CDATA\[/i.test(trimmed))
        return { kind: "cdata" };
    if (/^<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^>]*)?>\s*$/.test(trimmed))
        return { kind: "generic" };
    return null;
}
function isThematicBreak(line) {
    const trimmed = stripIndent(line.raw, 3).trim();
    if (!trimmed)
        return false;
    if (!/^[*_ -]+$/.test(trimmed))
        return false;
    const withoutSpaces = trimmed.replace(/[ \t]/g, "");
    return withoutSpaces.length >= 3 && /^(\*+|-+|_+)$/.test(withoutSpaces);
}
function parseAtxHeading(line) {
    const match = /^(?: {0,3})(#{1,6})(?:[ \t]+|$)(.*)$/.exec(line.raw);
    if (!match)
        return null;
    let text = match[2] ?? "";
    text = text.replace(/[ \t]+#+[ \t]*$/, "").trim();
    return {
        depth: match[1].length,
        text,
        position: createPosition(line.number, 1, line.number, Math.max(1, line.raw.length)),
    };
}
function isSetextUnderline(line) {
    const trimmed = stripIndent(line.raw, 3).trim();
    if (!trimmed)
        return 0;
    if (/^=+$/.test(trimmed))
        return 1;
    if (/^-+$/.test(trimmed))
        return 2;
    return 0;
}
function parseFencedCode(lines, index) {
    const match = /^(?: {0,3})(`{3,}|~{3,})([^\n]*)$/.exec(lines[index].raw);
    if (!match)
        return null;
    const fence = match[1];
    const fenceChar = fence[0];
    const info = (match[2] ?? "").trim();
    const body = [];
    let i = index + 1;
    for (; i < lines.length; i += 1) {
        const line = lines[i].raw;
        const closing = new RegExp(`^(?: {0,3})${fenceChar}{${fence.length},}[ \t]*$`);
        if (closing.test(line)) {
            return {
                node: {
                    type: "codeBlock",
                    info,
                    value: body.join("\n"),
                    fenced: true,
                    position: createPosition(lines[index].number, 1, lines[i].number, Math.max(1, lines[i].raw.length)),
                },
                nextIndex: i + 1,
            };
        }
        body.push(line);
    }
    const last = lines[Math.max(index, lines.length - 1)];
    return {
        node: {
            type: "codeBlock",
            info,
            value: body.join("\n"),
            fenced: true,
            position: createPosition(lines[index].number, 1, last.number, Math.max(1, last.raw.length)),
        },
        nextIndex: lines.length,
    };
}
function isIndentedCode(line) {
    return countIndent(line.raw) >= 4 && !isBlank(line);
}
function parseIndentedCode(lines, index) {
    if (!isIndentedCode(lines[index]))
        return null;
    const body = [];
    let i = index;
    for (; i < lines.length; i += 1) {
        if (isBlank(lines[i])) {
            body.push("");
            continue;
        }
        if (countIndent(lines[i].raw) < 4)
            break;
        body.push(stripIndent(lines[i].raw, 4));
    }
    const last = lines[Math.max(index, i - 1)];
    return {
        node: {
            type: "codeBlock",
            info: "",
            value: body.join("\n").replace(/\n+$/, ""),
            fenced: false,
            position: createPosition(lines[index].number, 1, last.number, Math.max(1, last.raw.length)),
        },
        nextIndex: i,
    };
}
function parseReferenceDefinition(raw) {
    const match = /^(?: {0,3})\[([^\]]+)\]:[ \t]*(<[^>]+>|[^ \t]+)(?:[ \t]+(?:"([^"]*)"|'([^']*)'|\(([^)]*)\)))?[ \t]*$/.exec(raw);
    if (!match)
        return null;
    const label = normalizeReferenceLabel(match[1]);
    const url = match[2].startsWith("<") && match[2].endsWith(">") ? match[2].slice(1, -1) : match[2];
    const title = match[3] ?? match[4] ?? match[5] ?? undefined;
    return { label, url, title };
}
function normalizeReferenceLabel(label) {
    return decodeEntities(String(label)).trim().replace(/\s+/g, " ").toLowerCase();
}
function collectReferenceDefinitions(lines) {
    const references = Object.create(null);
    for (const line of lines) {
        const definition = parseReferenceDefinition(line.raw);
        if (definition && !Object.prototype.hasOwnProperty.call(references, definition.label)) {
            references[definition.label] = { url: definition.url, title: definition.title };
        }
    }
    return references;
}
function parseFootnoteDefinitionStart(raw) {
    const match = /^(?: {0,3})\[\^([^\]]+)\]:[ \t]*(.*)$/.exec(raw);
    if (!match)
        return null;
    return {
        identifier: normalizeReferenceLabel(match[1]),
        label: match[1],
        remainder: match[2] ?? "",
    };
}
function collectFootnoteDefinitions(lines, state) {
    if (!hasExtension(state.extensions, "footnotes")) {
        return { lines, footnotes: [] };
    }
    const maskedLines = lines.map((line) => ({ ...line }));
    const footnotes = [];
    let index = 0;
    while (index < lines.length) {
        const start = parseFootnoteDefinitionStart(lines[index].raw);
        if (!start) {
            index += 1;
            continue;
        }
        const bodyLines = [{ raw: start.remainder, number: lines[index].number }];
        const startIndex = index;
        maskedLines[index] = { ...maskedLines[index], raw: "" };
        index += 1;
        while (index < lines.length) {
            if (isBlank(lines[index])) {
                bodyLines.push({ raw: "", number: lines[index].number });
                maskedLines[index] = { ...maskedLines[index], raw: "" };
                index += 1;
                continue;
            }
            if (countIndent(lines[index].raw) >= 4) {
                bodyLines.push({ raw: stripIndent(lines[index].raw, 4), number: lines[index].number });
                maskedLines[index] = { ...maskedLines[index], raw: "" };
                index += 1;
                continue;
            }
            break;
        }
        const children = parseBlocks(bodyLines, {
            ...state,
            collectFootnotes: false,
        });
        const endLine = lines[Math.max(startIndex, index - 1)];
        footnotes.push({
            identifier: start.identifier,
            label: start.label,
            children,
            position: createPosition(lines[startIndex].number, 1, endLine.number, Math.max(1, endLine.raw.length)),
        });
    }
    return {
        lines: maskedLines,
        footnotes,
    };
}
function parseDefinitionList(lines, index, state) {
    if (!hasExtension(state.extensions, "definition-lists"))
        return null;
    if (index + 1 >= lines.length)
        return null;
    if (isBlank(lines[index]))
        return null;
    if (/^(?: {0,3})[:]/.test(lines[index].raw))
        return null;
    if (!/^(?: {0,3}):[ \t]+/.test(lines[index + 1].raw))
        return null;
    const items = [];
    let currentTerm = lines[index].raw.trim();
    let i = index + 1;
    if (!currentTerm)
        return null;
    while (i < lines.length) {
        if (!/^(?: {0,3}):[ \t]+/.test(lines[i].raw)) {
            break;
        }
        const definitionLines = [{ raw: lines[i].raw.replace(/^(?: {0,3}):[ \t]+/, ""), number: lines[i].number }];
        const definitionStart = i;
        i += 1;
        while (i < lines.length) {
            if (isBlank(lines[i])) {
                definitionLines.push({ raw: "", number: lines[i].number });
                i += 1;
                continue;
            }
            if (countIndent(lines[i].raw) >= 2) {
                definitionLines.push({ raw: stripIndent(lines[i].raw, 2), number: lines[i].number });
                i += 1;
                continue;
            }
            break;
        }
        const children = parseBlocks(definitionLines, { ...state, collectFootnotes: false });
        const definitionEnd = lines[Math.max(definitionStart, i - 1)];
        items.push({
            type: "definitionItem",
            term: currentTerm,
            children,
            position: createPosition(lines[index].number, 1, definitionEnd.number, Math.max(1, definitionEnd.raw.length)),
        });
        if (i + 1 < lines.length && !isBlank(lines[i]) && /^(?: {0,3}):[ \t]+/.test(lines[i + 1].raw)) {
            currentTerm = lines[i].raw.trim();
            i += 1;
            continue;
        }
        break;
    }
    if (items.length === 0)
        return null;
    const endLine = lines[Math.max(index, i - 1)];
    return {
        node: {
            type: "definitionList",
            items,
            position: createPosition(lines[index].number, 1, endLine.number, Math.max(1, endLine.raw.length)),
        },
        nextIndex: i,
    };
}
function parseMathBlock(lines, index, state) {
    if (!hasExtension(state.extensions, "math"))
        return null;
    const match = /^(?: {0,3})\$\$\s*$/.exec(lines[index].raw);
    if (!match)
        return null;
    const body = [];
    let i = index + 1;
    for (; i < lines.length; i += 1) {
        if (/^(?: {0,3})\$\$\s*$/.test(lines[i].raw)) {
            return {
                node: {
                    type: "mathBlock",
                    value: body.join("\n"),
                    position: createPosition(lines[index].number, 1, lines[i].number, Math.max(1, lines[i].raw.length)),
                },
                nextIndex: i + 1,
            };
        }
        body.push(lines[i].raw);
    }
    const last = lines[Math.max(index, lines.length - 1)];
    return {
        node: {
            type: "mathBlock",
            value: body.join("\n"),
            position: createPosition(lines[index].number, 1, last.number, Math.max(1, last.raw.length)),
        },
        nextIndex: lines.length,
    };
}
function applySmartPunctuation(value) {
    let source = String(value ?? "");
    source = source.replace(/\.\.\./g, "…");
    source = source.replace(/---/g, "—");
    source = source.replace(/--/g, "–");
    let result = "";
    let doubleOpen = true;
    let singleOpen = true;
    for (let index = 0; index < source.length; index += 1) {
        const char = source[index];
        const previous = source[index - 1];
        const next = source[index + 1];
        if (char === '"') {
            const opening = !previous || /[\s([<{—–]/.test(previous);
            result += opening || doubleOpen ? "“" : "”";
            doubleOpen = !(opening || doubleOpen);
            continue;
        }
        if (char === "'") {
            if (/[A-Za-z0-9]/.test(previous ?? "") && /[A-Za-z0-9]/.test(next ?? "")) {
                result += "’";
                continue;
            }
            const opening = !previous || /[\s([<{—–]/.test(previous);
            result += opening || singleOpen ? "‘" : "’";
            singleOpen = !(opening || singleOpen);
            continue;
        }
        result += char;
    }
    return result;
}
function applySmartPunctuationToNodes(nodes) {
    return nodes.map((node) => {
        if (node.type === "text") {
            return {
                ...node,
                value: applySmartPunctuation(node.value ?? ""),
            };
        }
        if (Array.isArray(node.children) && node.children.length > 0) {
            return {
                ...node,
                children: applySmartPunctuationToNodes(node.children),
            };
        }
        return node;
    });
}
function parseHtmlBlock(lines, index, options) {
    const classification = classifyHtmlBlock(lines[index].raw);
    if (!classification)
        return null;
    const body = [lines[index].raw];
    let i = index + 1;
    const trimmed = lines[index].raw.trimStart();
    let endMatcher = null;
    if (classification.kind === "rawTag") {
        if (/^<pre/i.test(trimmed))
            endMatcher = /<\/pre>/i;
        else if (/^<script/i.test(trimmed))
            endMatcher = /<\/script>/i;
        else if (/^<style/i.test(trimmed))
            endMatcher = /<\/style>/i;
        else if (/^<textarea/i.test(trimmed))
            endMatcher = /<\/textarea>/i;
    }
    else if (classification.kind === "comment") {
        endMatcher = /-->/;
    }
    else if (classification.kind === "processing") {
        endMatcher = /\?>/;
    }
    else if (classification.kind === "declaration") {
        endMatcher = />/;
    }
    else if (classification.kind === "cdata") {
        endMatcher = /\]\]>/;
    }
    if (endMatcher && endMatcher.test(trimmed)) {
        return {
            node: {
                type: "htmlBlock",
                value: body.join("\n"),
                position: createPosition(lines[index].number, 1, lines[index].number, Math.max(1, lines[index].raw.length)),
            },
            nextIndex: index + 1,
        };
    }
    for (; i < lines.length; i += 1) {
        const raw = lines[i].raw;
        if (classification.kind === "generic" && isBlank(lines[i])) {
            break;
        }
        body.push(raw);
        if (endMatcher && endMatcher.test(raw)) {
            i += 1;
            break;
        }
        if (!endMatcher && isBlank(lines[i + 1] ?? { raw: "" })) {
            i += 1;
            break;
        }
    }
    const lastLine = lines[Math.max(index, Math.min(lines.length - 1, i - 1))];
    return {
        node: {
            type: "htmlBlock",
            value: body.join("\n"),
            position: createPosition(lines[index].number, 1, lastLine.number, Math.max(1, lastLine.raw.length)),
        },
        nextIndex: i,
    };
}
function parseMarkdownHtmlContainerBlock(lines, index, state) {
    if (!hasExtension(state.extensions, 'markdown-in-html'))
        return null;
    const openMatch = /^(?: {0,3})<([A-Za-z][A-Za-z0-9-]*)([^>]*)\s(?:markdown|data-markdown)=(?:"(?:1|true|block|inline)"|'(?:1|true|block|inline)'|(?:1|true|block|inline))([^>]*)>(.*)$/.exec(lines[index].raw);
    if (!openMatch)
        return null;
    const tagName = openMatch[1];
    const body = [lines[index].raw];
    let i = index;
    if (new RegExp(`</${tagName}>\\s*$`, 'i').test(lines[index].raw)) {
        return {
            node: {
                type: 'htmlBlock',
                value: body.join('\n'),
                position: createPosition(lines[index].number, 1, lines[index].number, Math.max(1, lines[index].raw.length)),
            },
            nextIndex: index + 1,
        };
    }
    for (i = index + 1; i < lines.length; i += 1) {
        body.push(lines[i].raw);
        if (new RegExp(`</${tagName}>\\s*$`, 'i').test(lines[i].raw)) {
            return {
                node: {
                    type: 'htmlBlock',
                    value: body.join('\n'),
                    position: createPosition(lines[index].number, 1, lines[i].number, Math.max(1, lines[i].raw.length)),
                },
                nextIndex: i + 1,
            };
        }
    }
    const last = lines[Math.max(index, lines.length - 1)];
    return {
        node: {
            type: 'htmlBlock',
            value: body.join('\n'),
            position: createPosition(lines[index].number, 1, last.number, Math.max(1, last.raw.length)),
        },
        nextIndex: lines.length,
    };
}
function splitTableRow(raw) {
    let value = stripIndent(raw, 3).trim();
    if (value.startsWith("|"))
        value = value.slice(1);
    if (value.endsWith("|"))
        value = value.slice(0, -1);
    const cells = [];
    let current = "";
    let i = 0;
    let codeFence = null;
    while (i < value.length) {
        const char = value[i];
        if (char === "\\") {
            current += char;
            if (i + 1 < value.length) {
                current += value[i + 1];
                i += 2;
                continue;
            }
            i += 1;
            continue;
        }
        if (char === "`") {
            const run = /^`+/.exec(value.slice(i))?.[0] ?? "`";
            if (codeFence === run) {
                codeFence = null;
            }
            else if (codeFence === null) {
                codeFence = run;
            }
            current += run;
            i += run.length;
            continue;
        }
        if (char === "|" && codeFence === null) {
            cells.push(current.trim());
            current = "";
            i += 1;
            continue;
        }
        current += char;
        i += 1;
    }
    cells.push(current.trim());
    return cells;
}
function splitTableDividerRow(raw) {
    const cells = splitTableRow(raw).map((cell) => cell.trim());
    if (!cells.length || cells.every((cell) => cell.length === 0))
        return null;
    if (!cells.every((cell) => /^:?-{3,}:?$/.test(cell)))
        return null;
    return cells.map((cell) => {
        if (cell.startsWith(":") && cell.endsWith(":"))
            return "center";
        if (cell.endsWith(":"))
            return "right";
        if (cell.startsWith(":"))
            return "left";
        return undefined;
    });
}
function normalizeTableCells(cells, columnCount, fillValue = "") {
    const normalized = cells.slice(0, columnCount);
    while (normalized.length < columnCount) {
        normalized.push(fillValue);
    }
    return normalized;
}
function parseTable(lines, index, state) {
    if (state.profile !== DEFAULT_MARKDOWN_PROFILE)
        return null;
    if (index + 1 >= lines.length)
        return null;
    const header = lines[index].raw;
    const divider = lines[index + 1].raw;
    if (!/\|/.test(header))
        return null;
    const alignments = splitTableDividerRow(divider);
    if (!alignments)
        return null;
    const headerCells = splitTableRow(header);
    const columnCount = Math.max(headerCells.length, alignments.length);
    if (columnCount === 0)
        return null;
    const normalizedHeader = normalizeTableCells(headerCells, columnCount);
    const normalizedAlignments = normalizeTableCells(alignments, columnCount, undefined);
    const bodyRows = [];
    let i = index + 2;
    while (i < lines.length && /\|/.test(lines[i].raw) && !isBlank(lines[i])) {
        bodyRows.push(normalizeTableCells(splitTableRow(lines[i].raw), columnCount));
        i += 1;
    }
    const endLine = lines[Math.max(index, i - 1)];
    return {
        node: {
            type: "table",
            header: normalizedHeader.map((text, cellIndex) => ({
                text,
                align: normalizedAlignments[cellIndex],
            })),
            rows: bodyRows,
            position: createPosition(lines[index].number, 1, endLine.number, Math.max(1, endLine.raw.length)),
        },
        nextIndex: i,
    };
}
function parseListMarker(raw) {
    const match = /^( {0,3})([*+-]|\d+[.)])([ \t]+)(.*)$/.exec(raw);
    if (!match)
        return null;
    const ordered = /\d/.test(match[2][0]);
    return {
        indent: match[1].length,
        ordered,
        marker: match[2],
        start: ordered ? Number.parseInt(match[2], 10) : undefined,
        contentIndent: match[1].length + match[2].length + match[3].replace(/\t/g, "    ").length,
        remainder: match[4] ?? "",
    };
}
function stripTaskMarker(text) {
    const match = /^\[( |x|X)\][ \t]+(.*)$/.exec(text);
    if (!match)
        return null;
    return {
        checked: match[1].toLowerCase() === "x",
        text: match[2] ?? "",
    };
}
function parseList(lines, index, state) {
    const firstMarker = parseListMarker(lines[index].raw);
    if (!firstMarker)
        return null;
    const items = [];
    let i = index;
    let loose = false;
    while (i < lines.length) {
        const marker = parseListMarker(lines[i].raw);
        if (!marker || marker.indent !== firstMarker.indent || marker.ordered !== firstMarker.ordered) {
            break;
        }
        const itemLineIndexes = [i];
        i += 1;
        while (i < lines.length) {
            const nextMarker = parseListMarker(lines[i].raw);
            if (nextMarker && nextMarker.indent === firstMarker.indent && nextMarker.ordered === firstMarker.ordered) {
                break;
            }
            if (!isBlank(lines[i]) && countIndent(lines[i].raw) < firstMarker.contentIndent && !/^[ \t]*>/.test(lines[i].raw)) {
                break;
            }
            itemLineIndexes.push(i);
            i += 1;
        }
        const itemLines = [];
        let task = null;
        for (let itemIndex = 0; itemIndex < itemLineIndexes.length; itemIndex += 1) {
            const line = lines[itemLineIndexes[itemIndex]];
            if (itemIndex === 0) {
                const taskMarker = state.profile === DEFAULT_MARKDOWN_PROFILE ? stripTaskMarker(marker.remainder) : null;
                if (taskMarker) {
                    task = { checked: taskMarker.checked };
                    itemLines.push({ raw: taskMarker.text, number: line.number });
                }
                else {
                    itemLines.push({ raw: marker.remainder, number: line.number });
                }
                continue;
            }
            itemLines.push({ raw: stripIndent(line.raw, firstMarker.contentIndent), number: line.number });
        }
        if (itemLines.some((line) => isBlank(line)))
            loose = true;
        const children = parseBlocks(itemLines, { ...state, collectFootnotes: false });
        const startLine = lines[itemLineIndexes[0]];
        const endLine = lines[itemLineIndexes[itemLineIndexes.length - 1]];
        items.push({
            type: "listItem",
            task: Boolean(task),
            checked: task?.checked,
            children,
            position: createPosition(startLine.number, 1, endLine.number, Math.max(1, endLine.raw.length)),
        });
    }
    const endLine = lines[Math.max(index, i - 1)];
    return {
        node: {
            type: "list",
            ordered: firstMarker.ordered,
            start: firstMarker.start,
            tight: !loose && items.every((item) => item.children.length <= 1),
            items,
            position: createPosition(lines[index].number, 1, endLine.number, Math.max(1, endLine.raw.length)),
        },
        nextIndex: i,
    };
}
function parseBlockquote(lines, index, state) {
    if (!/^[ \t]{0,3}>/.test(lines[index].raw))
        return null;
    const quoted = [];
    let i = index;
    while (i < lines.length) {
        const raw = lines[i].raw;
        if (/^[ \t]{0,3}> ?/.test(raw)) {
            quoted.push({ raw: raw.replace(/^[ \t]{0,3}> ?/, ""), number: lines[i].number });
            i += 1;
            continue;
        }
        if (isBlank(lines[i])) {
            quoted.push({ raw: "", number: lines[i].number });
            i += 1;
            continue;
        }
        break;
    }
    const children = parseBlocks(quoted, { ...state, collectFootnotes: false });
    const endLine = lines[Math.max(index, i - 1)];
    return {
        node: {
            type: "blockquote",
            children,
            position: createPosition(lines[index].number, 1, endLine.number, Math.max(1, endLine.raw.length)),
        },
        nextIndex: i,
    };
}
function parseParagraphOrSetext(lines, index, state) {
    const paragraphLines = [];
    let i = index;
    while (i < lines.length) {
        if (isBlank(lines[i]))
            break;
        if (paragraphLines.length > 0) {
            if (isThematicBreak(lines[i]) || parseAtxHeading(lines[i]) || parseListMarker(lines[i].raw) || /^[ \t]{0,3}>/.test(lines[i].raw)) {
                break;
            }
            if (parseFencedCode(lines, i) || parseHtmlBlock(lines, i, state) || parseTable(lines, i, state)) {
                break;
            }
        }
        paragraphLines.push(lines[i]);
        if (i + 1 < lines.length && isSetextUnderline(lines[i + 1])) {
            const depth = isSetextUnderline(lines[i + 1]);
            const text = paragraphLines.map((line) => line.raw.trim()).join("\n");
            return {
                node: {
                    type: "heading",
                    depth,
                    text,
                    children: parseInline(text, state.references, {
                        line: paragraphLines[0].number,
                        column: 1,
                        htmlHandling: state.htmlHandling,
                        profile: state.profile,
                        extensions: state.extensions,
                    }),
                    position: createPosition(paragraphLines[0].number, 1, lines[i + 1].number, Math.max(1, lines[i + 1].raw.length)),
                },
                nextIndex: i + 2,
            };
        }
        i += 1;
    }
    const text = paragraphLines.map((line) => line.raw).join("\n");
    const startLine = paragraphLines[0] ?? lines[index];
    const endLine = paragraphLines[paragraphLines.length - 1] ?? lines[index];
    return {
        node: {
            type: "paragraph",
            text,
            children: parseInline(text, state.references, {
                line: startLine.number,
                column: 1,
                htmlHandling: state.htmlHandling,
                profile: state.profile,
                extensions: state.extensions,
            }),
            position: createPosition(startLine.number, 1, endLine.number, Math.max(1, endLine.raw.length)),
        },
        nextIndex: Math.max(index + 1, i),
    };
}
function pushTextNode(nodes, value, position) {
    if (!value)
        return;
    const last = nodes[nodes.length - 1];
    if (last && last.type === "text") {
        last.value += value;
        last.position.end = { ...position.end };
        return;
    }
    nodes.push({ type: "text", value, position: clonePosition(position) });
}
function trimTrailingText(nodes, count) {
    if (!count)
        return;
    const last = nodes[nodes.length - 1];
    if (!last || last.type !== "text")
        return;
    last.value = last.value.slice(0, Math.max(0, last.value.length - count));
}
function isWordCharacter(char) {
    return /[A-Za-z0-9]/.test(char ?? "");
}
function findClosingBracket(text, startIndex) {
    let depth = 0;
    for (let i = startIndex; i < text.length; i += 1) {
        const char = text[i];
        if (char === "\\") {
            i += 1;
            continue;
        }
        if (char === "[")
            depth += 1;
        if (char === "]") {
            depth -= 1;
            if (depth === 0)
                return i;
        }
    }
    return -1;
}
function parseLinkDestination(raw) {
    const trimmed = raw.trim();
    const match = /^(<[^>]+>|[^ \t]+)(?:[ \t]+(?:"([^"]*)"|'([^']*)'|\(([^)]*)\)))?$/.exec(trimmed);
    if (!match)
        return null;
    const url = match[1].startsWith("<") && match[1].endsWith(">") ? match[1].slice(1, -1) : match[1];
    return {
        url,
        title: match[2] ?? match[3] ?? match[4] ?? undefined,
    };
}
function parseAutolink(value) {
    if (/^https?:\/\//i.test(value)) {
        return { url: value, text: value };
    }
    if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) {
        return { url: `mailto:${value}`, text: value };
    }
    return null;
}
function countCharacter(value, target) {
    let count = 0;
    for (const char of String(value ?? "")) {
        if (char === target)
            count += 1;
    }
    return count;
}
function trimAutolinkLiteral(candidate) {
    let trimmed = String(candidate ?? "");
    while (trimmed.length > 0) {
        const last = trimmed[trimmed.length - 1];
        if (/[?!.,:;*_~]/.test(last)) {
            trimmed = trimmed.slice(0, -1);
            continue;
        }
        if (last === ")" && countCharacter(trimmed, ")") > countCharacter(trimmed, "(")) {
            trimmed = trimmed.slice(0, -1);
            continue;
        }
        break;
    }
    return trimmed;
}
function hasAutolinkLiteralBoundaryBefore(text, index) {
    const before = text[index - 1];
    return !before || /[\s(<[{"'`*_~]/.test(before);
}
function parseAutolinkLiteralAt(text, index) {
    if (!hasAutolinkLiteralBoundaryBefore(text, index))
        return null;
    const slice = text.slice(index);
    const urlMatch = /^(https?:\/\/[^\s<]+|www\.[^\s<]+)/i.exec(slice);
    if (urlMatch) {
        const literal = trimAutolinkLiteral(urlMatch[0]);
        if (!literal)
            return null;
        return {
            href: /^www\./i.test(literal) ? `http://${literal}` : literal,
            text: literal,
            length: literal.length,
        };
    }
    const emailMatch = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+/.exec(slice);
    if (emailMatch) {
        const literal = trimAutolinkLiteral(emailMatch[0]);
        if (!literal)
            return null;
        return {
            href: `mailto:${literal}`,
            text: literal,
            length: literal.length,
        };
    }
    return null;
}
function findClosingDelimiter(text, delimiter, fromIndex) {
    let index = fromIndex;
    while ((index = text.indexOf(delimiter, index)) !== -1) {
        const before = text[index - 1];
        if (before === "\\") {
            index += delimiter.length;
            continue;
        }
        return index;
    }
    return -1;
}
function maybeParseDelimited(text, index, delimiter, type, references, context) {
    const before = text[index - 1];
    const after = text[index + delimiter.length];
    if (delimiter === "_" && isWordCharacter(before) && isWordCharacter(after)) {
        return null;
    }
    const end = findClosingDelimiter(text, delimiter, index + delimiter.length);
    if (end === -1)
        return null;
    const inner = text.slice(index + delimiter.length, end);
    if (!inner)
        return null;
    return {
        node: {
            type,
            children: parseInline(inner, references, {
                line: context.line,
                column: context.column + index + delimiter.length,
                htmlHandling: context.htmlHandling,
                profile: context.profile,
                extensions: context.extensions,
            }),
            position: createPosition(context.line, context.column + index, context.line, context.column + end + delimiter.length - 1),
        },
        nextIndex: end + delimiter.length,
    };
}
function parseInline(text, references = {}, context = {}) {
    const source = String(text ?? "");
    const line = context.line ?? 1;
    const column = context.column ?? 1;
    const htmlHandling = context.htmlHandling ?? DEFAULT_HTML_HANDLING;
    const profile = context.profile ?? DEFAULT_MARKDOWN_PROFILE;
    const extensions = context.extensions ?? EMPTY_EXTENSIONS;
    const nodes = [];
    let i = 0;
    while (i < source.length) {
        const char = source[i];
        const position = createPosition(line, column + i, line, column + i);
        if (char === "\n") {
            const previous = source[i - 1];
            if (previous === "\\") {
                trimTrailingText(nodes, 1);
                nodes.push({ type: "hardBreak", position });
            }
            else if (source.slice(Math.max(0, i - 2), i) === "  ") {
                trimTrailingText(nodes, 2);
                nodes.push({ type: "hardBreak", position });
            }
            else {
                nodes.push({ type: "softBreak", position });
            }
            i += 1;
            continue;
        }
        if (char === "\\") {
            const escaped = source[i + 1];
            if (escaped && escaped !== "\n") {
                pushTextNode(nodes, escaped, createPosition(line, column + i, line, column + i + 1));
                i += 2;
                continue;
            }
        }
        if (char === "&") {
            const entityMatch = /^&(?:#x?[0-9A-Fa-f]+|[A-Za-z][A-Za-z0-9]+);/.exec(source.slice(i));
            if (entityMatch) {
                const decoded = decodeEntity(entityMatch[0]);
                pushTextNode(nodes, decoded, createPosition(line, column + i, line, column + i + entityMatch[0].length - 1));
                i += entityMatch[0].length;
                continue;
            }
        }
        if (char === "`") {
            const run = /^`+/.exec(source.slice(i))[0];
            const closing = source.indexOf(run, i + run.length);
            if (closing !== -1) {
                const code = source.slice(i + run.length, closing).replace(/\n/g, " ");
                nodes.push({
                    type: "code",
                    value: code,
                    position: createPosition(line, column + i, line, column + closing + run.length - 1),
                });
                i = closing + run.length;
                continue;
            }
        }
        if (hasExtension(extensions, "footnotes") && source.startsWith("[^", i)) {
            const close = source.indexOf("]", i + 2);
            if (close !== -1) {
                const identifier = normalizeReferenceLabel(source.slice(i + 2, close));
                if (identifier) {
                    nodes.push({
                        type: "footnoteReference",
                        identifier,
                        value: source.slice(i, close + 1),
                        position: createPosition(line, column + i, line, column + close),
                    });
                    i = close + 1;
                    continue;
                }
            }
        }
        if (hasExtension(extensions, "citations") && source.startsWith("[@", i)) {
            const citationMatch = /^\[@([A-Za-z0-9:_-]+(?:\s*;\s*@?[A-Za-z0-9:_-]+)*)\]/.exec(source.slice(i));
            if (citationMatch) {
                nodes.push({
                    type: "citation",
                    value: `[@${citationMatch[1]}]`,
                    position: createPosition(line, column + i, line, column + i + citationMatch[0].length - 1),
                });
                i += citationMatch[0].length;
                continue;
            }
        }
        if (char === "!" && source[i + 1] === "[") {
            const closeLabel = findClosingBracket(source, i + 1);
            if (closeLabel !== -1) {
                const alt = source.slice(i + 2, closeLabel);
                if (source[closeLabel + 1] === "(") {
                    const closeParen = findClosingDelimiter(source, ")", closeLabel + 2);
                    if (closeParen !== -1) {
                        const destination = parseLinkDestination(source.slice(closeLabel + 2, closeParen));
                        if (destination) {
                            nodes.push({
                                type: "image",
                                alt: decodeEntities(alt),
                                url: destination.url,
                                title: destination.title,
                                position: createPosition(line, column + i, line, column + closeParen),
                            });
                            i = closeParen + 1;
                            continue;
                        }
                    }
                }
                if (source[closeLabel + 1] === "[") {
                    const closeRef = source.indexOf("]", closeLabel + 2);
                    if (closeRef !== -1) {
                        const label = source.slice(closeLabel + 2, closeRef) || alt;
                        const definition = references[normalizeReferenceLabel(label)];
                        if (definition) {
                            nodes.push({
                                type: "image",
                                alt: decodeEntities(alt),
                                url: definition.url,
                                title: definition.title,
                                position: createPosition(line, column + i, line, column + closeRef),
                            });
                            i = closeRef + 1;
                            continue;
                        }
                    }
                }
            }
        }
        if (char === "[") {
            const closeLabel = findClosingBracket(source, i);
            if (closeLabel !== -1) {
                const labelText = source.slice(i + 1, closeLabel);
                const labelChildren = parseInline(labelText, references, {
                    line,
                    column: column + i + 1,
                    htmlHandling,
                    profile,
                    extensions,
                });
                if (source[closeLabel + 1] === "(") {
                    const closeParen = findClosingDelimiter(source, ")", closeLabel + 2);
                    if (closeParen !== -1) {
                        const destination = parseLinkDestination(source.slice(closeLabel + 2, closeParen));
                        if (destination) {
                            nodes.push({
                                type: "link",
                                url: destination.url,
                                title: destination.title,
                                children: labelChildren,
                                position: createPosition(line, column + i, line, column + closeParen),
                            });
                            i = closeParen + 1;
                            continue;
                        }
                    }
                }
                if (source[closeLabel + 1] === "[") {
                    const closeRef = source.indexOf("]", closeLabel + 2);
                    if (closeRef !== -1) {
                        const referenceLabel = source.slice(closeLabel + 2, closeRef) || labelText;
                        const definition = references[normalizeReferenceLabel(referenceLabel)];
                        if (definition) {
                            nodes.push({
                                type: "link",
                                url: definition.url,
                                title: definition.title,
                                children: labelChildren,
                                position: createPosition(line, column + i, line, column + closeRef),
                            });
                            i = closeRef + 1;
                            continue;
                        }
                    }
                }
                const shortcut = references[normalizeReferenceLabel(labelText)];
                if (shortcut) {
                    nodes.push({
                        type: "link",
                        url: shortcut.url,
                        title: shortcut.title,
                        children: labelChildren,
                        position: createPosition(line, column + i, line, column + closeLabel),
                    });
                    i = closeLabel + 1;
                    continue;
                }
            }
        }
        if (char === "<") {
            const end = source.indexOf(">", i + 1);
            if (end !== -1) {
                const raw = source.slice(i + 1, end);
                const autolink = parseAutolink(raw);
                if (autolink) {
                    nodes.push({
                        type: "link",
                        url: autolink.url,
                        title: undefined,
                        children: [{ type: "text", value: autolink.text, position: createPosition(line, column + i + 1, line, column + end - 1) }],
                        position: createPosition(line, column + i, line, column + end),
                    });
                    i = end + 1;
                    continue;
                }
                if (/^\/?[A-Za-z][^>]*$/.test(raw) || /^!--/.test(raw) || /^\?/.test(raw) || /^![A-Z]/.test(raw)) {
                    nodes.push({
                        type: "htmlInline",
                        value: source.slice(i, end + 1),
                        position: createPosition(line, column + i, line, column + end),
                    });
                    i = end + 1;
                    continue;
                }
            }
        }
        if (profile === DEFAULT_MARKDOWN_PROFILE) {
            const literalAutolink = parseAutolinkLiteralAt(source, i);
            if (literalAutolink) {
                nodes.push({
                    type: "link",
                    url: literalAutolink.href,
                    title: undefined,
                    children: [
                        {
                            type: "text",
                            value: literalAutolink.text,
                            position: createPosition(line, column + i, line, column + i + literalAutolink.length - 1),
                        },
                    ],
                    position: createPosition(line, column + i, line, column + i + literalAutolink.length - 1),
                });
                i += literalAutolink.length;
                continue;
            }
        }
        if (profile === DEFAULT_MARKDOWN_PROFILE && source.startsWith("~~", i)) {
            const parsed = maybeParseDelimited(source, i, "~~", "strikethrough", references, {
                line,
                column,
                htmlHandling,
                profile,
                extensions,
            });
            if (parsed) {
                nodes.push(parsed.node);
                i = parsed.nextIndex;
                continue;
            }
        }
        if (hasExtension(extensions, "math") && char === "$" && source[i + 1] !== "$" && source[i - 1] !== "\\") {
            const closing = findClosingDelimiter(source, "$", i + 1);
            if (closing !== -1) {
                const inner = source.slice(i + 1, closing);
                if (inner.trim().length > 0) {
                    nodes.push({
                        type: "mathInline",
                        value: inner,
                        position: createPosition(line, column + i, line, column + closing),
                    });
                    i = closing + 1;
                    continue;
                }
            }
        }
        if (source.startsWith("**", i) || source.startsWith("__", i)) {
            const parsed = maybeParseDelimited(source, i, source.slice(i, i + 2), "strong", references, {
                line,
                column,
                htmlHandling,
                profile,
                extensions,
            });
            if (parsed) {
                nodes.push(parsed.node);
                i = parsed.nextIndex;
                continue;
            }
        }
        if (char === "*" || char === "_") {
            const parsed = maybeParseDelimited(source, i, char, "emphasis", references, {
                line,
                column,
                htmlHandling,
                profile,
                extensions,
            });
            if (parsed) {
                nodes.push(parsed.node);
                i = parsed.nextIndex;
                continue;
            }
        }
        if (hasExtension(extensions, "superscript") && char === "^") {
            const parsed = maybeParseDelimited(source, i, "^", "superscript", references, {
                line,
                column,
                htmlHandling,
                profile,
                extensions,
            });
            if (parsed) {
                nodes.push(parsed.node);
                i = parsed.nextIndex;
                continue;
            }
        }
        if (hasExtension(extensions, "subscript") && char === "~" && !source.startsWith("~~", i)) {
            const parsed = maybeParseDelimited(source, i, "~", "subscript", references, {
                line,
                column,
                htmlHandling,
                profile,
                extensions,
            });
            if (parsed) {
                nodes.push(parsed.node);
                i = parsed.nextIndex;
                continue;
            }
        }
        pushTextNode(nodes, source[i], createPosition(line, column + i, line, column + i));
        i += 1;
    }
    return hasExtension(extensions, "smart-punctuation") ? applySmartPunctuationToNodes(nodes) : nodes;
}
function addSourcePositionAttribute(attributes, node, options) {
    if (!options.sourcePositionAttributes || !node.position)
        return attributes;
    return `${attributes} data-sourcepos="${escapeAttribute(formatSourcePosition(node.position))}"`;
}
function renderAttributes(attributes) {
    return Object.entries(attributes)
        .filter(([, value]) => value !== undefined && value !== null && value !== false)
        .map(([name, value]) => {
        if (value === true)
            return ` ${name}`;
        return ` ${name}="${escapeAttribute(value)}"`;
    })
        .join("");
}
function defaultLinkAttributes(href) {
    if (/^(https?:)?\/\//i.test(href ?? "")) {
        return { target: "_blank", rel: "noopener noreferrer" };
    }
    return undefined;
}
function renderInline(nodes, options, classNames) {
    return nodes.map((node) => {
        switch (node.type) {
            case "text":
                return escapeHtml(node.value);
            case "code": {
                let attributes = renderAttributes({ class: classNames.inlineCode });
                attributes = addSourcePositionAttribute(attributes, node, options);
                return `<code${attributes}>${escapeHtml(node.value)}</code>`;
            }
            case "strong": {
                let attributes = renderAttributes({ class: classNames.strong });
                attributes = addSourcePositionAttribute(attributes, node, options);
                return `<strong${attributes}>${renderInline(node.children ?? [], options, classNames)}</strong>`;
            }
            case "emphasis": {
                let attributes = renderAttributes({ class: classNames.emphasis });
                attributes = addSourcePositionAttribute(attributes, node, options);
                return `<em${attributes}>${renderInline(node.children ?? [], options, classNames)}</em>`;
            }
            case "strikethrough": {
                let attributes = renderAttributes({ class: classNames.strikethrough });
                attributes = addSourcePositionAttribute(attributes, node, options);
                return `<del${attributes}>${renderInline(node.children ?? [], options, classNames)}</del>`;
            }
            case "superscript": {
                let attributes = renderAttributes({ class: classNames.superscript });
                attributes = addSourcePositionAttribute(attributes, node, options);
                return `<sup${attributes}>${renderInline(node.children ?? [], options, classNames)}</sup>`;
            }
            case "subscript": {
                let attributes = renderAttributes({ class: classNames.subscript });
                attributes = addSourcePositionAttribute(attributes, node, options);
                return `<sub${attributes}>${renderInline(node.children ?? [], options, classNames)}</sub>`;
            }
            case "citation": {
                let attributes = renderAttributes({
                    class: classNames.citation,
                    'data-citation': node.value,
                });
                attributes = addSourcePositionAttribute(attributes, node, options);
                return `<cite${attributes}>${escapeHtml(node.value ?? '')}</cite>`;
            }
            case "footnoteReference": {
                const footnoteIndex = options.footnoteOrderMap?.get(node.identifier ?? '') ?? 0;
                let attributes = renderAttributes({
                    class: classNames.footnoteReference,
                    id: footnoteIndex ? `fnref-${escapeAttribute(node.identifier ?? '')}` : undefined,
                });
                attributes = addSourcePositionAttribute(attributes, node, options);
                const label = footnoteIndex || escapeHtml(node.identifier ?? '');
                return `<sup${attributes}><a href="#fn-${escapeAttribute(node.identifier ?? '')}" aria-label="Footnote ${label}">${label}</a></sup>`;
            }
            case "mathInline": {
                let attributes = renderAttributes({ class: classNames.mathInline, 'data-math': 'inline' });
                attributes = addSourcePositionAttribute(attributes, node, options);
                return `<span${attributes}><code>${escapeHtml(node.value ?? '')}</code></span>`;
            }
            case "link": {
                const resolved = options.getLinkAttributes?.(node.url) ?? defaultLinkAttributes(node.url) ?? {};
                let attributes = renderAttributes({
                    href: node.url,
                    title: node.title,
                    target: resolved.target,
                    rel: resolved.rel,
                    class: classNames.link,
                });
                attributes = addSourcePositionAttribute(attributes, node, options);
                return `<a${attributes}>${renderInline(node.children ?? [], options, classNames)}</a>`;
            }
            case "image": {
                let attributes = renderAttributes({
                    src: node.url,
                    alt: decodeEntities(node.alt ?? ""),
                    title: node.title,
                });
                attributes = addSourcePositionAttribute(attributes, node, options);
                return `<img${attributes} />`;
            }
            case "hardBreak":
                return `<br />`;
            case "softBreak":
                return "\n";
            case "htmlInline":
                return renderHtmlInline(node, options, classNames);
            default:
                return "";
        }
    }).join("");
}
function renderBlock(node, options, classNames) {
    switch (node.type) {
        case "heading": {
            const tag = `h${node.depth}`;
            let attributes = renderAttributes({
                class: classNames[`heading${node.depth}`],
                id: slugifyHeading(node.text ?? textFromInline(node.children ?? [])),
            });
            attributes = addSourcePositionAttribute(attributes, node, options);
            return `<${tag}${attributes}>${renderInline(node.children ?? [], options, classNames)}</${tag}>`;
        }
        case "paragraph": {
            let attributes = renderAttributes({ class: classNames.paragraph });
            attributes = addSourcePositionAttribute(attributes, node, options);
            return `<p${attributes}>${renderInline(node.children ?? [], options, classNames)}</p>`;
        }
        case "thematicBreak": {
            let attributes = renderAttributes({ class: classNames.hr });
            attributes = addSourcePositionAttribute(attributes, node, options);
            return `<hr${attributes} />`;
        }
        case "blockquote": {
            let attributes = renderAttributes({ class: classNames.blockquote });
            attributes = addSourcePositionAttribute(attributes, node, options);
            return `<blockquote${attributes}>${(node.children ?? []).map((child) => renderBlock(child, options, classNames)).join("")}</blockquote>`;
        }
        case "codeBlock": {
            const language = (node.info ?? "").split(/\s+/)[0];
            if (language) {
                let preAttributes = renderAttributes({ class: classNames.codeBlock });
                preAttributes = addSourcePositionAttribute(preAttributes, node, options);
                const header = `<div class="${escapeAttribute(classNames.codeHeader)}">${escapeHtml(language)}</div>`;
                const surface = `<div class="${escapeAttribute(classNames.codeSurface)}"><code class="language-${escapeAttribute(language)}">${escapeHtml(node.value)}</code></div>`;
                return `<pre${preAttributes}>${header}${surface}</pre>`;
            }
            let preAttributes = renderAttributes({ class: `${classNames.codeBlock} ${classNames.codeSurface}`.trim() });
            preAttributes = addSourcePositionAttribute(preAttributes, node, options);
            return `<pre${preAttributes}><code>${escapeHtml(node.value)}</code></pre>`;
        }
        case "list": {
            const tag = node.ordered ? "ol" : "ul";
            const containsTaskItems = (node.items ?? []).some((item) => Boolean(item.task));
            let attributes = renderAttributes({
                class: [node.ordered ? classNames.listOrdered : classNames.listUnordered, containsTaskItems ? "md-task-list" : undefined].filter(Boolean).join(" "),
                start: node.ordered && node.start && node.start !== 1 ? String(node.start) : undefined,
                "data-task-list": containsTaskItems ? "true" : undefined,
            });
            attributes = addSourcePositionAttribute(attributes, node, options);
            return `<${tag}${attributes}>${(node.items ?? []).map((item) => renderListItem(item, options, classNames, node.tight)).join("")}</${tag}>`;
        }
        case "definitionList": {
            let attributes = renderAttributes({ class: classNames.definitionList });
            attributes = addSourcePositionAttribute(attributes, node, options);
            const body = (node.items ?? []).map((item) => {
                const term = `<dt class="${escapeAttribute(classNames.definitionTerm)}">${renderInline(parseInline(item.term ?? '', options.references ?? {}, {
                    htmlHandling: options.htmlHandling,
                    profile: options.profile,
                    extensions: options.extensions,
                }), options, classNames)}</dt>`;
                const descriptionBody = (item.children ?? []).map((child) => renderBlock(child, options, classNames)).join('');
                const description = `<dd class="${escapeAttribute(classNames.definitionDescription)}">${descriptionBody}</dd>`;
                return `${term}${description}`;
            }).join('');
            return `<dl${attributes}>${body}</dl>`;
        }
        case "mathBlock": {
            let attributes = renderAttributes({ class: classNames.mathBlock, 'data-math': 'block' });
            attributes = addSourcePositionAttribute(attributes, node, options);
            return `<div${attributes}><pre><code>${escapeHtml(node.value ?? '')}</code></pre></div>`;
        }
        case "htmlBlock":
            return renderHtmlBlock(node, options, classNames);
        case "table": {
            let tableAttributes = renderAttributes({ class: classNames.table });
            tableAttributes = addSourcePositionAttribute(tableAttributes, node, options);
            const columnHtml = (node.header ?? []).length > 0
                ? `<colgroup class="${escapeAttribute(classNames.tableColumns)}">${(node.header ?? []).map((cell) => `<col class="${escapeAttribute(classNames.tableColumn)}"${cell.align ? ` style="text-align:${escapeAttribute(cell.align)}"` : ""} />`).join("")}</colgroup>`
                : "";
            const headerHtml = `<thead class="${escapeAttribute(classNames.tableHead)}"><tr class="${escapeAttribute(classNames.tableRow)}">${(node.header ?? []).map((cell) => {
                const cellAttributes = renderAttributes({
                    class: classNames.tableHeader,
                    align: cell.align,
                });
                return `<th${cellAttributes}>${renderInline(parseInline(cell.text ?? "", options.references ?? {}, { htmlHandling: options.htmlHandling, profile: options.profile, extensions: options.extensions }), options, classNames)}</th>`;
            }).join("")}</tr></thead>`;
            const bodyHtml = `<tbody class="${escapeAttribute(classNames.tableBody)}">${(node.rows ?? []).map((row) => `<tr class="${escapeAttribute(classNames.tableRow)}">${row.map((cell, cellIndex) => {
                const align = node.header?.[cellIndex]?.align;
                const attributes = renderAttributes({
                    class: classNames.tableCell,
                    align,
                });
                return `<td${attributes}>${renderInline(parseInline(cell ?? "", options.references ?? {}, { htmlHandling: options.htmlHandling, profile: options.profile, extensions: options.extensions }), options, classNames)}</td>`;
            }).join("")}</tr>`).join("")}</tbody>`;
            return `<table${tableAttributes}>${columnHtml}${headerHtml}${bodyHtml}</table>`;
        }
        default:
            return "";
    }
}
function renderListItem(node, options, classNames, tight) {
    let attributes = renderAttributes({
        class: [classNames.listItem, node.task ? classNames.taskListItem : undefined].filter(Boolean).join(" "),
        "data-task": node.task ? "true" : undefined,
        "data-checked": node.task ? String(Boolean(node.checked)) : undefined,
    });
    attributes = addSourcePositionAttribute(attributes, node, options);
    const children = node.children ?? [];
    if (tight && children.length === 1 && children[0].type === "paragraph") {
        const prefix = node.task
            ? `<input type="checkbox" class="${escapeAttribute(classNames.checkbox)}"${node.checked ? " checked" : ""} disabled aria-hidden="true" tabindex="-1" /> `
            : "";
        return `<li${attributes}>${prefix}${renderInline(children[0].children ?? [], options, classNames)}</li>`;
    }
    const renderedChildren = children.map((child, index) => {
        if (index === 0 && node.task && child.type === "paragraph") {
            const prefix = `<input type="checkbox" class="${escapeAttribute(classNames.checkbox)}"${node.checked ? " checked" : ""} disabled aria-hidden="true" tabindex="-1" /> `;
            let paragraphAttributes = renderAttributes({ class: classNames.paragraph });
            paragraphAttributes = addSourcePositionAttribute(paragraphAttributes, child, options);
            return `<p${paragraphAttributes}>${prefix}${renderInline(child.children ?? [], options, classNames)}</p>`;
        }
        return renderBlock(child, options, classNames);
    }).join("");
    return `<li${attributes}>${renderedChildren}</li>`;
}
function renderBlocks(children, options, classNames) {
    return (children ?? []).map((child) => renderBlock(child, options, classNames)).join("");
}
function renderHtmlBlock(node, options, classNames) {
    if (hasExtension(options.extensions, 'markdown-in-html') && options.htmlHandling === 'allow-trusted') {
        const rendered = renderMarkdownInsideHtmlContainer(node.value, options, classNames);
        if (rendered !== null) {
            return rendered;
        }
    }
    return options.htmlHandling === 'allow-trusted' ? node.value : `<p>${escapeHtml(node.value)}</p>`;
}
function renderHtmlInline(node, options, classNames) {
    if (hasExtension(options.extensions, 'markdown-in-html') && options.htmlHandling === 'allow-trusted') {
        const rendered = renderMarkdownInsideHtmlContainer(node.value, options, classNames, { inline: true });
        if (rendered !== null) {
            return rendered;
        }
    }
    return options.htmlHandling === 'allow-trusted' ? node.value : escapeHtml(node.value);
}
function renderMarkdownInsideHtmlContainer(rawHtml, options, classNames, mode = {}) {
    const match = /^<([A-Za-z][A-Za-z0-9-]*)([^>]*)\s(?:markdown|data-markdown)=(?:"(?:1|true|block|inline)"|'(?:1|true|block|inline)'|(?:1|true|block|inline))([^>]*)>([\s\S]*)<\/\1>$/.exec(String(rawHtml).trim());
    if (!match)
        return null;
    const tagName = match[1];
    const beforeAttributes = match[2] ?? '';
    const afterAttributes = match[3] ?? '';
    const inner = match[4] ?? '';
    const innerAst = parseMarkdownToAst(inner, {
        profile: options.profile,
        htmlHandling: options.htmlHandling,
        extensions: (options.extensions ?? EMPTY_EXTENSIONS).filter((extension) => extension !== 'markdown-in-html'),
    });
    const renderedInner = mode.inline
        ? renderInline(parseInline(inner, options.references ?? {}, {
            htmlHandling: options.htmlHandling,
            profile: options.profile,
            extensions: (options.extensions ?? EMPTY_EXTENSIONS).filter((extension) => extension !== 'markdown-in-html'),
        }), options, classNames)
        : renderBlocks(innerAst.children, options, classNames);
    return `<${tagName}${beforeAttributes}${afterAttributes}>${renderedInner}</${tagName}>`;
}
function collectFootnoteReferenceOrder(node, order = [], seen = new Set()) {
    if (!node || typeof node !== 'object')
        return order;
    if (node.type === 'footnoteReference' && node.identifier && !seen.has(node.identifier)) {
        seen.add(node.identifier);
        order.push(node.identifier);
    }
    if (Array.isArray(node.children)) {
        node.children.forEach((child) => collectFootnoteReferenceOrder(child, order, seen));
    }
    if (Array.isArray(node.items)) {
        node.items.forEach((child) => collectFootnoteReferenceOrder(child, order, seen));
    }
    return order;
}
function renderFootnotesSection(ast, options, classNames) {
    const footnotes = ast.footnotes ?? EMPTY_EXTENSIONS;
    if (!footnotes.length)
        return '';
    const order = collectFootnoteReferenceOrder(ast, []);
    if (!order.length)
        return '';
    const orderMap = new Map(order.map((identifier, index) => [identifier, index + 1]));
    const footnotesById = new Map(footnotes.map((footnote) => [footnote.identifier, footnote]));
    const listItems = order.map((identifier) => {
        const footnote = footnotesById.get(identifier);
        if (!footnote)
            return '';
        const renderedChildren = renderBlocks(footnote.children, { ...options, footnoteOrderMap: orderMap }, classNames);
        const backlink = `<a class="${escapeAttribute(classNames.footnoteBacklink)}" href="#fnref-${escapeAttribute(identifier)}" aria-label="Back to reference">↩</a>`;
        return `<li id="fn-${escapeAttribute(identifier)}">${renderedChildren}${backlink}</li>`;
    }).join('');
    return `<section class="${escapeAttribute(classNames.footnotes)}"><ol>${listItems}</ol></section>`;
}
function textFromInline(nodes) {
    return (nodes ?? []).map((node) => {
        switch (node.type) {
            case "text":
            case "code":
                return node.value ?? "";
            case "image":
                return node.alt ?? "";
            case "link":
            case "strong":
            case "emphasis":
            case "strikethrough":
            case "superscript":
            case "subscript":
                return textFromInline(node.children ?? []);
            case "citation":
            case "mathInline":
                return node.value ?? "";
            case "footnoteReference":
                return node.identifier ?? node.value ?? "";
            case "softBreak":
            case "hardBreak":
                return " ";
            default:
                return "";
        }
    }).join(" ").trim();
}
function parseBlocks(lines, state) {
    const prepared = state.collectFootnotes === false ? { lines, footnotes: [] } : collectFootnoteDefinitions(lines, state);
    lines = prepared.lines;
    const nodes = [];
    let index = 0;
    while (index < lines.length) {
        if (isBlank(lines[index])) {
            index += 1;
            continue;
        }
        const definition = parseReferenceDefinition(lines[index].raw);
        if (definition) {
            index += 1;
            continue;
        }
        const table = parseTable(lines, index, state);
        if (table) {
            nodes.push(table.node);
            index = table.nextIndex;
            continue;
        }
        const atx = parseAtxHeading(lines[index]);
        if (atx) {
            nodes.push({
                type: "heading",
                depth: atx.depth,
                text: atx.text,
                children: parseInline(atx.text, state.references, {
                    line: lines[index].number,
                    column: 1,
                    htmlHandling: state.htmlHandling,
                    profile: state.profile,
                    extensions: state.extensions,
                }),
                position: atx.position,
            });
            index += 1;
            continue;
        }
        if (isThematicBreak(lines[index])) {
            nodes.push({
                type: "thematicBreak",
                position: createPosition(lines[index].number, 1, lines[index].number, Math.max(1, lines[index].raw.length)),
            });
            index += 1;
            continue;
        }
        const mathBlock = parseMathBlock(lines, index, state);
        if (mathBlock) {
            nodes.push(mathBlock.node);
            index = mathBlock.nextIndex;
            continue;
        }
        const fenced = parseFencedCode(lines, index);
        if (fenced) {
            nodes.push(fenced.node);
            index = fenced.nextIndex;
            continue;
        }
        const markdownHtmlContainer = parseMarkdownHtmlContainerBlock(lines, index, state);
        if (markdownHtmlContainer) {
            nodes.push(markdownHtmlContainer.node);
            index = markdownHtmlContainer.nextIndex;
            continue;
        }
        const htmlBlock = parseHtmlBlock(lines, index, state);
        if (htmlBlock) {
            nodes.push(htmlBlock.node);
            index = htmlBlock.nextIndex;
            continue;
        }
        const blockquote = parseBlockquote(lines, index, state);
        if (blockquote) {
            nodes.push(blockquote.node);
            index = blockquote.nextIndex;
            continue;
        }
        const definitionList = parseDefinitionList(lines, index, state);
        if (definitionList) {
            nodes.push(definitionList.node);
            index = definitionList.nextIndex;
            continue;
        }
        const list = parseList(lines, index, state);
        if (list) {
            nodes.push(list.node);
            index = list.nextIndex;
            continue;
        }
        const indented = parseIndentedCode(lines, index);
        if (indented) {
            nodes.push(indented.node);
            index = indented.nextIndex;
            continue;
        }
        const paragraph = parseParagraphOrSetext(lines, index, state);
        nodes.push(paragraph.node);
        index = paragraph.nextIndex;
    }
    return state.collectFootnotes === false ? nodes : { nodes, footnotes: prepared.footnotes };
}
export function parseMarkdownToAst(markdown, options = {}) {
    const enabledExtensions = resolveEnabledExtensions(options);
    const frontmatter = hasExtension(enabledExtensions, 'front-matter')
        ? extractFrontmatter(markdown)
        : {
            raw: normalizeLineEndings(markdown),
            content: normalizeLineEndings(markdown),
            maskedContent: normalizeLineEndings(markdown),
            metadata: {},
            removedLineCount: 0,
        };
    const lines = splitLines(frontmatter.maskedContent);
    const references = collectReferenceDefinitions(lines);
    const htmlHandling = options.htmlHandling ?? DEFAULT_HTML_HANDLING;
    const profile = options.profile ?? DEFAULT_MARKDOWN_PROFILE;
    const parsed = parseBlocks(lines, { references, htmlHandling, profile, extensions: enabledExtensions, collectFootnotes: true });
    const children = Array.isArray(parsed) ? parsed : parsed.nodes;
    const lastLine = lines[lines.length - 1] ?? { number: 1, raw: "" };
    return {
        type: "root",
        children,
        references,
        metadata: Object.freeze(frontmatter.metadata),
        footnotes: Object.freeze(Array.isArray(parsed) ? [] : parsed.footnotes),
        activeExtensions: enabledExtensions,
        warnings: Object.freeze(buildMarkdownWarnings(enabledExtensions, htmlHandling)),
        position: createPosition(1, 1, lastLine.number, Math.max(1, lastLine.raw.length)),
    };
}
export function extractHeadingNodesFromAst(ast, options = {}) {
    const minimumDepth = options.minimumDepth ?? 1;
    const maximumDepth = options.maximumDepth ?? 6;
    const headings = [];
    function visit(node) {
        if (!node || typeof node !== "object")
            return;
        if (node.type === "heading" && node.depth >= minimumDepth && node.depth <= maximumDepth) {
            headings.push({
                depth: node.depth,
                text: node.text ?? textFromInline(node.children ?? []),
                slug: slugifyHeading(node.text ?? textFromInline(node.children ?? [])),
                index: headings.length,
            });
        }
        if (Array.isArray(node.children)) {
            node.children.forEach(visit);
        }
        if (Array.isArray(node.items)) {
            node.items.forEach(visit);
        }
    }
    visit(ast);
    return Object.freeze(headings);
}
export function parseSimpleFrontmatter(raw, options = {}) {
    const extracted = extractFrontmatter(raw);
    const content = extracted.content;
    const ast = parseMarkdownToAst(content, options);
    const excerpt = options.excerptSeparator
        ? content.split(options.excerptSeparator, 1)[0]
        : undefined;
    return Object.freeze({
        raw,
        content,
        metadata: Object.freeze(extracted.metadata),
        headings: extractHeadingNodesFromAst(ast),
        excerpt,
    });
}
export function renderAstToHtml(ast, options = {}) {
    const classNames = resolveMarkdownRendererClassNames(options.classNames);
    const extensions = resolveEnabledExtensions(options).length > 0
        ? resolveEnabledExtensions(options)
        : (ast.activeExtensions ?? EMPTY_EXTENSIONS);
    const footnoteOrder = new Map(collectFootnoteReferenceOrder(ast, []).map((identifier, index) => [identifier, index + 1]));
    const withResolvedOptions = {
        ...options,
        htmlHandling: options.htmlHandling ?? DEFAULT_HTML_HANDLING,
        profile: options.profile ?? DEFAULT_MARKDOWN_PROFILE,
        extensions,
        references: ast.references,
        footnoteOrderMap: footnoteOrder,
    };
    const innerHtml = (ast.children ?? []).map((node) => renderBlock(node, withResolvedOptions, classNames)).join("");
    const footnotesHtml = renderFootnotesSection(ast, withResolvedOptions, classNames);
    const rootAttributes = renderAttributes({
        class: classNames.root,
        'data-markdown-profile': withResolvedOptions.profile,
        'data-markdown-extensions': extensions.length ? extensions.join(' ') : undefined,
    });
    return `<div${rootAttributes}>${innerHtml}${footnotesHtml}</div>`;
}
export function renderMarkdownToHtmlSync(markdown, options = {}) {
    const ast = parseMarkdownToAst(markdown, options);
    return renderAstToHtml(ast, options);
}
export async function renderMarkdownToHtml(markdown, options = {}) {
    return renderMarkdownToHtmlSync(markdown, options);
}
export function createMarkdownProcessor(options = {}) {
    const classNames = resolveMarkdownRendererClassNames(options.classNames);
    return {
        classNames,
        processor: {
            async process(markdown) {
                return renderMarkdownToHtmlSync(String(markdown), options);
            },
            parse(markdown) {
                return parseMarkdownToAst(String(markdown), options);
            },
        },
    };
}
export function getDefaultMarkdownRemarkPlugins() {
    return [];
}
export function getDefaultMarkdownRendererClassNames() {
    return DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES;
}
//# sourceMappingURL=engine.js.map