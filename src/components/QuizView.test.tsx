import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { ChoiceQuiz } from "../content/schema";
import { QuizView } from "./QuizView";

const quiz: ChoiceQuiz = {
  schemaVersion: 1,
  id: "sample-quiz",
  type: "choice",
  trackId: "beginner",
  difficulty: 1,
  prompt: "哪一个答案正确？",
  skillIds: ["game-goal"],
  lessonIds: ["b01-introduction"],
  sourceIds: ["national-rules"],
  explanation: "这是解释。",
  review: { status: "draft" },
  options: [{ id: "right", label: "正确选项" }, { id: "wrong", label: "错误选项" }],
  correctOptionId: "right",
};

describe("QuizView", () => {
  it("requires a selection and announces feedback", () => {
    const onAnswered = vi.fn();
    render(<MemoryRouter><QuizView quiz={quiz} onAnswered={onAnswered} /></MemoryRouter>);
    expect(screen.getByRole("button", { name: "提交答案" })).toBeDisabled();
    fireEvent.click(screen.getByLabelText("正确选项"));
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));
    expect(screen.getByRole("status")).toHaveTextContent("判断正确");
    expect(onAnswered).toHaveBeenCalledWith(expect.objectContaining({ isRecommended: true }));
  });
});
