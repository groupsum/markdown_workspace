import { describe, expect, it } from "vitest";
import {
  computeSelectionFormatState,
  getListContinuationPrefix,
  insertListContinuation,
} from "../src/index.js";

describe("editor transforms", () => {
  it("computes continuation prefixes for unordered, ordered, and task lists", () => {
    expect(getListContinuationPrefix("- alpha")).toBe("- ");
    expect(getListContinuationPrefix("2. alpha")).toBe("3. ");
    expect(getListContinuationPrefix("- [x] alpha")).toBe("- [ ] ");
  });

  it("continues unordered list items on Enter", () => {
    const result = insertListContinuation("- alpha", { start: 7, end: 7 });
    expect(result.value).toBe("- alpha\n- ");
    expect(result.selection.start).toBe(result.selection.end);
  });

  it("terminates empty task list items on Enter", () => {
    const result = insertListContinuation("- [ ] ", { start: 6, end: 6 });
    expect(result.value).toBe("");
    expect(result.selection).toEqual({ start: 0, end: 0, direction: "none" });
  });

  it("computes inline wrapper and list-state selection metadata", () => {
    expect(computeSelectionFormatState("**bold**", { start: 2, end: 6 }).bold).toBe(true);
    expect(computeSelectionFormatState("_italic_", { start: 1, end: 7 }).italic).toBe(true);
    expect(computeSelectionFormatState("~~strike~~", { start: 2, end: 8 }).strikethrough).toBe(true);
    expect(computeSelectionFormatState("- item", { start: 2, end: 2 }).bulletList).toBe(true);
    expect(computeSelectionFormatState("- [ ] item", { start: 6, end: 6 }).taskList).toBe(true);
  });
});
