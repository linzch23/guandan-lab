import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { LessonDirectory } from "./LessonDirectory";

afterEach(cleanup);

describe("LessonDirectory", () => {
  it("marks the current and completed lessons", () => {
    render(<MemoryRouter><LessonDirectory currentLessonId="b01-introduction" completedLessonIds={["b02-deck-level-card"]} /></MemoryRouter>);
    expect(screen.getByRole("link", { name: /快速认识掼蛋/ })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /牌型与大小/ }).querySelector("svg")).not.toBeNull();
    expect(screen.getByText("常用技巧提升")).toBeInTheDocument();
  });
});
