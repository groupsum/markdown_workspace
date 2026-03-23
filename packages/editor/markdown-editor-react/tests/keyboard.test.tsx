// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import "@markdown-workspace/testing/vitest-setup";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MarkdownSourceEditor } from "../src/index.js";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("MarkdownSourceEditor keyboard behavior", () => {
  it("applies bold formatting with the keyboard shortcut", () => {
    render(<MarkdownSourceEditor defaultValue="hello" />);
    const editor = screen.getByTestId("markdown-source-editor") as HTMLTextAreaElement;
    editor.focus();
    editor.setSelectionRange(0, 5);
    fireEvent.keyDown(editor, { key: "b", ctrlKey: true });
    expect(editor.value).toBe("**hello**");
  });

  it("indents and outdents with Tab and Shift+Tab", () => {
    render(<MarkdownSourceEditor defaultValue={"alpha\nbeta"} />);
    const editor = screen.getByTestId("markdown-source-editor") as HTMLTextAreaElement;
    editor.focus();
    editor.setSelectionRange(0, editor.value.length);
    fireEvent.keyDown(editor, { key: "Tab" });
    expect(editor.value).toBe("\talpha\n\tbeta");
    editor.setSelectionRange(1, editor.value.length);
    fireEvent.keyDown(editor, { key: "Tab", shiftKey: true });
    expect(editor.value).toBe("alpha\nbeta");
  });
});
