import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ChoiceQuiz } from "../content/schema";
import { SessionRunner } from "./SessionRunner";

const makeQuiz = (id: string, prompt: string): ChoiceQuiz => ({
  schemaVersion: 1,
  id,
  type: "choice",
  trackId: "beginner",
  difficulty: 1,
  prompt,
  skillIds: ["game-goal"],
  lessonIds: ["b01-introduction"],
  sourceIds: ["national-rules"],
  explanation: `${prompt}的解释。`,
  review: { status: "draft" },
  options: [{ id: "right", label: `${prompt}正确选项` }, { id: "wrong", label: `${prompt}错误选项` }],
  correctOptionId: "right",
});

const quizzes = [makeQuiz("q1", "第一题"), makeQuiz("q2", "第二题")];

afterEach(cleanup);

function renderSession(onAnswer = vi.fn(), onFinish = vi.fn()) {
  render(<MemoryRouter><SessionRunner quizzes={quizzes} onAnswer={onAnswer} onFinish={onFinish} /></MemoryRouter>);
  return { onAnswer, onFinish };
}

describe("SessionRunner", () => {
  it("retains an unsubmitted selection while switching freely", () => {
    renderSession();
    fireEvent.click(screen.getByLabelText("第一题正确选项"));
    fireEvent.click(screen.getByRole("button", { name: "第 2 题，未作答" }));
    fireEvent.click(screen.getByRole("button", { name: "第 1 题，待提交" }));
    expect(screen.getByLabelText("第一题正确选项")).toBeChecked();
  });

  it("retains submitted feedback and records an answer once", () => {
    const { onAnswer } = renderSession();
    fireEvent.click(screen.getByLabelText("第一题正确选项"));
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));
    expect(screen.getByRole("status")).toHaveTextContent("判断正确");
    fireEvent.click(screen.getByRole("button", { name: "第 2 题，未作答" }));
    fireEvent.click(screen.getByRole("button", { name: "第 1 题，正确" }));
    expect(screen.getByRole("status")).toHaveTextContent("第一题的解释");
    expect(screen.queryByRole("button", { name: "提交答案" })).not.toBeInTheDocument();
    expect(onAnswer).toHaveBeenCalledTimes(1);
  });

  it("only enables the result action after every question is submitted", () => {
    const { onFinish } = renderSession();
    fireEvent.click(screen.getByRole("button", { name: "第 2 题，未作答" }));
    expect(screen.getByRole("button", { name: "查看结果" })).toBeDisabled();
    fireEvent.click(screen.getByLabelText("第二题错误选项"));
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));
    expect(screen.getByRole("button", { name: "查看结果" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "第 1 题，未作答" }));
    fireEvent.click(screen.getByLabelText("第一题正确选项"));
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));
    fireEvent.click(screen.getByRole("button", { name: "第 2 题，待复习" }));
    fireEvent.click(screen.getByRole("button", { name: "查看结果" }));

    expect(onFinish).toHaveBeenCalledWith({ q1: "right", q2: "wrong" });
  });
});
