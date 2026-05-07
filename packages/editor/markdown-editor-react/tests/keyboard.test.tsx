// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import "@mdwrk/testing/vitest-setup";
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

  it("does not consume Ctrl+Shift+B so the host can toggle the workspace panel", () => {
    render(<MarkdownSourceEditor defaultValue="hello" />);
    const editor = screen.getByTestId("markdown-source-editor") as HTMLTextAreaElement;
    editor.focus();
    editor.setSelectionRange(0, 5);
    fireEvent.keyDown(editor, { key: "b", ctrlKey: true, shiftKey: true });
    expect(editor.value).toBe("hello");
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

  it("continues list items on Enter", () => {
    render(<MarkdownSourceEditor defaultValue="- alpha" />);
    const editor = screen.getByTestId("markdown-source-editor") as HTMLTextAreaElement;
    editor.focus();
    editor.setSelectionRange(editor.value.length, editor.value.length);
    fireEvent.keyDown(editor, { key: "Enter" });
    expect(editor.value).toBe("- alpha\n- ");
  });

  it("terminates empty task list items on Enter", () => {
    render(<MarkdownSourceEditor defaultValue="- [ ] " />);
    const editor = screen.getByTestId("markdown-source-editor") as HTMLTextAreaElement;
    editor.focus();
    editor.setSelectionRange(editor.value.length, editor.value.length);
    fireEvent.keyDown(editor, { key: "Enter" });
    expect(editor.value).toBe("");
  });

  it("continues ordered and task list items on Enter", () => {
    render(<MarkdownSourceEditor defaultValue={"2. alpha\n- [x] done"} />);
    const editor = screen.getByTestId("markdown-source-editor") as HTMLTextAreaElement;
    editor.focus();
    editor.setSelectionRange(8, 8);
    fireEvent.keyDown(editor, { key: "Enter" });
    expect(editor.value).toBe("2. alpha\n3. \n- [x] done");

    editor.setSelectionRange(editor.value.length, editor.value.length);
    fireEvent.keyDown(editor, { key: "Enter" });
    expect(editor.value).toBe("2. alpha\n3. \n- [x] done\n- [ ] ");
  });

  it("does not consume Ctrl+U for Markdown underline", () => {
    render(<MarkdownSourceEditor defaultValue="hello" />);
    const editor = screen.getByTestId("markdown-source-editor") as HTMLTextAreaElement;
    editor.focus();
    editor.setSelectionRange(0, 5);
    const wasNotPrevented = fireEvent.keyDown(editor, { key: "u", ctrlKey: true });
    expect(wasNotPrevented).toBe(true);
    expect(editor.value).toBe("hello");
  });
});
