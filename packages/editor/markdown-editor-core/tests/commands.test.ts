import { describe, expect, it } from "vitest";
import { applyBuiltinMarkdownCommand } from "../src/index.js";

describe("builtin markdown editor commands", () => {
  it("applies bold to the selected text", () => {
    const result = applyBuiltinMarkdownCommand("bold", "portable", { start: 0, end: 8 });
    expect(result.value).toBe("**portable**");
    expect(result.selection).toEqual({ start: 2, end: 10, direction: "none" });
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
});
