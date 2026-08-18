import { CheckCircle2, ChevronLeft, ChevronRight, Circle, CircleAlert, Clock3 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Quiz } from "../content/schema";
import { gradeAnswer, type AnswerResult } from "../features/training/logic";
import { QuizFeedback, QuizQuestion } from "./QuizView";

export interface SessionQuestionState {
  selectedOptionId: string;
  result: AnswerResult | null;
}

type SessionState = Record<string, SessionQuestionState>;

const emptyQuestionState = (): SessionQuestionState => ({ selectedOptionId: "", result: null });

export function SessionRunner({ quizzes, onAnswer, onFinish }: { quizzes: Quiz[]; onAnswer: (quiz: Quiz, result: AnswerResult) => void; onFinish: (answers: Record<string, string>) => void }) {
  const [index, setIndex] = useState(0);
  const [session, setSession] = useState<SessionState>(() => Object.fromEntries(quizzes.map((item) => [item.id, emptyQuestionState()])));
  const submittedIds = useRef(new Set<string>());
  const questionPane = useRef<HTMLDivElement>(null);
  const feedbackPane = useRef<HTMLElement>(null);
  const quiz = quizzes[index];

  useEffect(() => {
    if (questionPane.current) questionPane.current.scrollTop = 0;
    if (feedbackPane.current) feedbackPane.current.scrollTop = 0;
  }, [index]);

  if (!quiz) return <div className="empty-state"><h2>没有匹配的题目</h2><p>调整筛选条件后再试一次。</p></div>;

  const current = session[quiz.id] ?? emptyQuestionState();
  const answeredCount = quizzes.filter((item) => session[item.id]?.result).length;
  const allAnswered = answeredCount === quizzes.length;

  const selectAnswer = (selectedOptionId: string) => {
    if (current.result) return;
    setSession((value) => ({ ...value, [quiz.id]: { ...current, selectedOptionId } }));
  };

  const submitAnswer = () => {
    if (!current.selectedOptionId || current.result || submittedIds.current.has(quiz.id)) return;
    submittedIds.current.add(quiz.id);
    const result = gradeAnswer(quiz, current.selectedOptionId);
    setSession((value) => ({ ...value, [quiz.id]: { selectedOptionId: current.selectedOptionId, result } }));
    onAnswer(quiz, result);
  };

  const finish = () => {
    if (!allAnswered) return;
    onFinish(Object.fromEntries(quizzes.map((item) => [item.id, session[item.id].selectedOptionId])));
  };

  return <div className="session-runner">
    <aside className="question-index" aria-label="题目列表">
      <div className="question-index-heading"><span>题目列表</span><strong>{answeredCount} / {quizzes.length}</strong></div>
      <div className="question-index-list">{quizzes.map((item, itemIndex) => {
        const state = session[item.id] ?? emptyQuestionState();
        const status = getQuestionStatus(state);
        const StatusIcon = status.icon;
        return <button type="button" className={`question-index-item ${itemIndex === index ? "active" : ""} ${status.className}`} aria-current={itemIndex === index ? "step" : undefined} aria-label={`第 ${itemIndex + 1} 题，${status.label}`} onClick={() => setIndex(itemIndex)} key={item.id}><span className="question-index-number">{String(itemIndex + 1).padStart(2, "0")}</span><span className="question-index-copy"><strong>{item.prompt}</strong><small><StatusIcon aria-hidden="true" />{status.label}</small></span></button>;
      })}</div>
    </aside>

    <div className="session-content">
      <div className="session-question-pane" ref={questionPane}>
        <QuizQuestion quiz={quiz} selectedOptionId={current.selectedOptionId} result={current.result} onSelect={selectAnswer} onSubmit={submitAnswer} />
      </div>

      <aside className="session-feedback-pane" ref={feedbackPane} aria-label="答案解析">
        <div className="feedback-pane-heading"><span className="eyebrow">答案区域</span><strong>第 {index + 1} 题解析</strong></div>
        {current.result ? <QuizFeedback quiz={quiz} result={current.result} /> : <div className="feedback-placeholder"><Circle aria-hidden="true" /><strong>{current.selectedOptionId ? "答案尚未提交" : "等待作答"}</strong><p>{current.selectedOptionId ? "确认选择后提交，即可查看逐项反馈。" : "选择并提交答案后，这里会显示推荐答案和解释。"}</p></div>}
      </aside>
    </div>

    <nav className="session-controls" aria-label="题目切换">
      <button type="button" className="button secondary" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}><ChevronLeft aria-hidden="true" />上一题</button>
      <span className="session-counter"><strong>{index + 1} / {quizzes.length}</strong><small>{allAnswered ? "全部完成" : `还剩 ${quizzes.length - answeredCount} 题`}</small></span>
      {index === quizzes.length - 1
        ? <button type="button" className="button primary" disabled={!allAnswered} onClick={finish}>查看结果<CheckCircle2 aria-hidden="true" /></button>
        : <button type="button" className="button primary" onClick={() => setIndex((value) => value + 1)}>下一题<ChevronRight aria-hidden="true" /></button>}
    </nav>
  </div>;
}

function getQuestionStatus(state: SessionQuestionState) {
  if (state.result?.isRecommended) return { label: "正确", className: "correct", icon: CheckCircle2 };
  if (state.result) return { label: "待复习", className: "review", icon: CircleAlert };
  if (state.selectedOptionId) return { label: "待提交", className: "selected", icon: Clock3 };
  return { label: "未作答", className: "unanswered", icon: Circle };
}
