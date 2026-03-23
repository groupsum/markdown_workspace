import { describe, expect, it } from "vitest";
import { computeCursorPosition, normalizeSelection, wrapSelection } from "../src/index.js";

describe("selection transforms", () => {
  it("normalizes reversed selections", () => {
    expect(normalizeSelection({ start: 8, end: 2 }, 10)).toEqual({ start: 2, end: 8, direction: "none" });
  });

  it("wraps a selection with markdown markers", () => {
    const result = wrapSelection("hello world", { start: 0, end: 5 }, "**", "**");
    expect(result.value).toBe("**hello** world");
    expect(result.selection).toEqual({ start: 2, end: 7, direction: "none" });
  });

  it("computes line and column", () => {
    expect(computeCursorPosition("one\ntwo", 5)).toEqual({ offset: 5, line: 2, column: 2 });
  });
});
