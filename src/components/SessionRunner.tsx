import { useState } from "react";
import type { Quiz } from "../content/schema";
import type { AnswerResult } from "../features/training/logic";
import { QuizView } from "./QuizView";

export function SessionRunner({ quizzes, onAnswer, onFinish }: { quizzes: Quiz[]; onAnswer: (quiz: Quiz, result: AnswerResult) => void; onFinish: (answers: Record<string, string>) => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answered, setAnswered] = useState(false);
  const quiz = quizzes[index];

  if (!quiz) return <div className="empty-state"><h2>没有匹配的题目</h2><p>调整筛选条件后再试一次。</p></div>;

  const handleAnswer = (result: AnswerResult) => {
    const next = { ...answers, [quiz.id]: result.selectedOptionId };
    setAnswers(next);
    setAnswered(true);
    onAnswer(quiz, result);
  };
  const next = () => {
    if (index === quizzes.length - 1) onFinish(answers);
    else { setIndex((value) => value + 1); setAnswered(false); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  return <div className="session-runner"><div className="session-counter"><span>本组进度</span><strong>{index + 1} / {quizzes.length}</strong></div><QuizView key={quiz.id} quiz={quiz} onAnswered={handleAnswer} />{answered && <button type="button" className="button primary next-button" onClick={next}>{index === quizzes.length - 1 ? "查看结果" : "下一题"}</button>}</div>;
}
