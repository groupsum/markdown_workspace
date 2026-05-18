// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import "@mdwrk/testing/vitest-setup";
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MarkdownSourceEditor } from "../src/index.js";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("MarkdownSourceEditor", () => {
  it("renders an uncontrolled editor with the provided default value", () => {
    render(<MarkdownSourceEditor defaultValue="initial text" />);
    const editor = screen.getByTestId("markdown-source-editor") as HTMLTextAreaElement;
    expect(editor).toHaveValue("initial text");
  });

  it("renders a controlled editor and reflects the current value", () => {
    function Harness(): React.JSX.Element {
      const [value, setValue] = React.useState("controlled text");
      return (
        <div>
          <MarkdownSourceEditor value={value} onChange={setValue} />
          <button onClick={() => setValue("external update")}>swap</button>
        </div>
      );
    }

    render(<Harness />);
    const editor = screen.getByTestId("markdown-source-editor") as HTMLTextAreaElement;
    expect(editor).toHaveValue("controlled text");
    fireEvent.click(screen.getByRole("button", { name: "swap" }));
    expect(editor).toHaveValue("external update");
  });

  it("can suppress the gutter when line numbers are disabled", () => {
    const { container } = render(<MarkdownSourceEditor defaultValue="alpha" showLineNumbers={false} />);
    expect(container.querySelector('.editor-gutter')).toBeNull();
    expect(container.querySelector(".editor-stage")).toHaveAttribute("data-line-numbers", "hidden");
  });

  it("renders line numbers by default", () => {
    const { container } = render(<MarkdownSourceEditor defaultValue={"alpha\nbeta"} />);
    expect(container.querySelectorAll(".line-num")).toHaveLength(2);
    expect(container.querySelector(".editor-stage")).toHaveAttribute("data-line-numbers", "visible");
  });

  it("can turn source text wrapping off", () => {
    render(<MarkdownSourceEditor defaultValue="alpha beta gamma" textWrap={false} />);
    const editor = screen.getByTestId("markdown-source-editor") as HTMLTextAreaElement;
    expect(editor).toHaveAttribute("wrap", "off");
    expect(editor).toHaveAttribute("data-wrap-mode", "off");
    expect(editor).toHaveClass("editor-textarea--nowrap");
  });

  it("emits selection format state when the current selection changes", () => {
    const onSelectionFormatChange = vi.fn();
    render(
      <MarkdownSourceEditor
        defaultValue="**bold**"
        onSelectionFormatChange={onSelectionFormatChange}
      />,
    );
    const editor = screen.getByTestId("markdown-source-editor") as HTMLTextAreaElement;
    editor.focus();
    editor.setSelectionRange(2, 6);
    fireEvent.select(editor);
    const lastCall = onSelectionFormatChange.mock.calls.at(-1)?.[0];
    expect(lastCall?.bold).toBe(true);
  });

  it("preserves focus and character position when creating a checkbox item", async () => {
    const ref = React.createRef<React.ElementRef<typeof MarkdownSourceEditor>>();
    render(<MarkdownSourceEditor ref={ref} defaultValue="alpha" />);
    const editor = screen.getByTestId("markdown-source-editor") as HTMLTextAreaElement;
    editor.focus();
    editor.setSelectionRange(2, 2);
    ref.current?.setSelection({ start: 2, end: 2 });

    await act(async () => {
      ref.current?.executeCommand("task-list");
    });

    expect(document.activeElement).toBe(editor);
    expect(editor.value).toBe("- [ ] alpha");
    expect(editor.selectionStart).toBe(8);
    expect(editor.selectionEnd).toBe(8);
  });

  it("passes command options through toolbar-safe imperative dispatch", async () => {
    const ref = React.createRef<React.ElementRef<typeof MarkdownSourceEditor>>();
    render(<MarkdownSourceEditor ref={ref} defaultValue="Read docs" />);
    const editor = screen.getByTestId("markdown-source-editor") as HTMLTextAreaElement;
    editor.focus();
    editor.setSelectionRange(5, 9);
    ref.current?.setSelection({ start: 5, end: 9 });

    await act(async () => {
      ref.current?.executeCommand("link", { linkUrl: "./guide.md" });
    });

    expect(document.activeElement).toBe(editor);
    expect(editor.value).toBe("Read [docs](./guide.md)");
    expect(editor.selectionStart).toBe(12);
    expect(editor.selectionEnd).toBe(22);
  });
});
