// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import "@mdwrk/testing/vitest-setup";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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
});
