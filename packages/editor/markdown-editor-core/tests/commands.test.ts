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

  it("upgrades an existing list item into an unchecked task item", () => {
    const result = applyBuiltinMarkdownCommand("task-list", "- alpha", { start: 2, end: 2 });
    expect(result.value).toBe("- [ ] alpha");
    expect(result.selection.start).toBe(6);
    expect(result.selection.end).toBe(6);
  });
});
