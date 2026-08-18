import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LessonToc } from "./LessonToc";

afterEach(cleanup);

describe("LessonToc", () => {
  it("navigates to a section and marks it active", () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });
    document.body.innerHTML = '<h2 id="lesson-section-2-second">第二节</h2>';
    render(<LessonToc sections={[{ id: "lesson-section-1-first", title: "第一节" }, { id: "lesson-section-2-second", title: "第二节" }]} />);
    fireEvent.click(screen.getByRole("link", { name: "第二节" }));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(screen.getByRole("link", { name: "第二节" })).toHaveClass("active");
  });
});
