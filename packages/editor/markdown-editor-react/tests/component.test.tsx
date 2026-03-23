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
});
