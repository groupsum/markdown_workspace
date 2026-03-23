import { describe, expect, it } from "vitest";
import { canRedoHistory, canUndoHistory, createHistoryState, pushHistoryEntry, redoHistory, undoHistory } from "../src/index.js";

describe("history state", () => {
  it("pushes history entries and supports undo/redo", () => {
    const initial = createHistoryState("one");
    const next = pushHistoryEntry(initial, "two", { start: 3, end: 3 });
    expect(canUndoHistory(next)).toBe(true);
    const undone = undoHistory(next);
    expect(undone.present.value).toBe("one");
    expect(canRedoHistory(undone)).toBe(true);
    const redone = redoHistory(undone);
    expect(redone.present.value).toBe("two");
  });

  it("honors history limits", () => {
    let state = createHistoryState("0", { start: 1, end: 1 }, 2);
    state = pushHistoryEntry(state, "1");
    state = pushHistoryEntry(state, "2");
    state = pushHistoryEntry(state, "3");
    expect(state.past).toHaveLength(2);
    expect(state.past[0].value).toBe("1");
  });
});
