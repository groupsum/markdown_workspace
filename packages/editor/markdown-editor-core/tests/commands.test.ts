import { describe, expect, it } from "vitest";
import { applyBuiltinMarkdownCommand } from "../src/index.js";

describe("builtin markdown editor commands", () => {
  it("applies bold to the selected text", () => {
    const result = applyBuiltinMarkdownCommand("bold", "portable", { start: 0, end: 8 });
    expect(result.value).toBe("**portable**");
    expect(result.selection).toEqual({ start: 2, end: 10, direction: "none" });
  });

  it("toggles unordered list prefixes for selected lines", () => {
    const result = applyBuiltinMarkdownCommand("bullet-list", "alpha\nbeta", { start: 0, end: 10 });
    expect(result.value).toBe("- alpha\n- beta");
    expect(result.selection.start).toBe(0);
    expect(result.selection.end).toBe(14);
  });

  it("indents multiple selected lines", () => {
    const result = applyBuiltinMarkdownCommand("indent", "a\nb", { start: 0, end: 3 });
    expect(result.value).toBe("\ta\n\tb");
    expect(result.selection.start).toBe(1);
    expect(result.selection.end).toBe(5);
  });

  it("outdents multiple selected lines", () => {
    const result = applyBuiltinMarkdownCommand("outdent", "\ta\n\tb", { start: 1, end: 5 });
    expect(result.value).toBe("a\nb");
  });

  it("creates task list items for the selected lines", () => {
    const result = applyBuiltinMarkdownCommand("task-list", "alpha\nbeta", { start: 0, end: 10 });
    expect(result.value).toBe("- [ ] alpha\n- [ ] beta");
    expect(result.selection.start).toBe(0);
    expect(result.selection.end).toBe(22);
  });

  it("wraps selected text as a markdown link and selects the URL", () => {
    const result = applyBuiltinMarkdownCommand("link", "MdWrk docs", { start: 0, end: 5 });
    expect(result.value).toBe("[MdWrk](https://example.com) docs");
    expect(result.selection).toEqual({ start: 8, end: 27, direction: "none" });
  });

  it("inserts an empty-selection link stub and selects the label", () => {
    const result = applyBuiltinMarkdownCommand("link", "See ", { start: 4, end: 4 });
    expect(result.value).toBe("See [link text](https://example.com)");
    expect(result.selection).toEqual({ start: 5, end: 14, direction: "none" });
  });

  it("updates an existing markdown link without nesting it", () => {
    const result = applyBuiltinMarkdownCommand(
      "link",
      "Read [docs](old.md) now",
      { start: 8, end: 12 },
      { linkUrl: "./guide.md#install" },
    );
    expect(result.value).toBe("Read [docs](./guide.md#install) now");
    expect(result.selection).toEqual({ start: 12, end: 30, direction: "none" });
  });

  it("updates an existing markdown link when the cursor is inside the URL", () => {
    const result = applyBuiltinMarkdownCommand(
      "link",
      "Read [docs](old.md) now",
      { start: 14, end: 14 },
      { linkUrl: "#usage" },
    );
    expect(result.value).toBe("Read [docs](#usage) now");
    expect(result.selection).toEqual({ start: 12, end: 18, direction: "none" });
  });

  it("wraps selected text with pasted internal file and hash URLs", () => {
    const fileLink = applyBuiltinMarkdownCommand(
      "link",
      "Project notes",
      { start: 0, end: 7 },
      { linkUrl: "notes.md#intro" },
    );
    expect(fileLink.value).toBe("[Project](notes.md#intro) notes");
    expect(fileLink.selection).toEqual({ start: 10, end: 24, direction: "none" });

    const hashLink = applyBuiltinMarkdownCommand(
      "link",
      "Jump section",
      { start: 5, end: 12 },
      { linkUrl: "#section" },
    );
    expect(hashLink.value).toBe("Jump [section](#section)");
    expect(hashLink.selection).toEqual({ start: 15, end: 23, direction: "none" });
  });

  it("upgrades an existing list item into an unchecked task item", () => {
    const result = applyBuiltinMarkdownCommand("task-list", "- alpha", { start: 2, end: 2 });
    expect(result.value).toBe("- [ ] alpha");
    expect(result.selection.start).toBe(6);
    expect(result.selection.end).toBe(6);
  });
});
