import { CheckCircle2, CircleAlert } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { CardCode, Quiz } from "../content/schema";
import { gradeAnswer, type AnswerResult } from "../features/training/logic";
import { CardGroup } from "./PlayingCard";

export function QuizView({ quiz, onAnswered, compact = false }: { quiz: Quiz; onAnswered?: (result: AnswerResult) => void; compact?: boolean }) {
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState<AnswerResult | null>(null);

  const submit = () => {
    if (!selected || result) return;
    const next = gradeAnswer(quiz, selected);
    setResult(next);
    onAnswered?.(next);
  };

  return <section className={`quiz ${compact ? "quiz-compact" : ""}`} data-quiz-id={quiz.id} aria-labelledby={`quiz-${quiz.id}`}>
    <QuestionContent quiz={quiz} selectedOptionId={selected} submitted={Boolean(result)} onSelect={setSelected} onSubmit={submit} />
    {result && <QuizFeedback quiz={quiz} result={result} />}
  </section>;
}

export function QuizQuestion({ quiz, selectedOptionId, result, onSelect, onSubmit }: { quiz: Quiz; selectedOptionId: string; result: AnswerResult | null; onSelect: (optionId: string) => void; onSubmit: () => void }) {
  return <section className="quiz session-quiz" data-quiz-id={quiz.id} aria-labelledby={`quiz-${quiz.id}`}>
    <QuestionContent quiz={quiz} selectedOptionId={selectedOptionId} submitted={Boolean(result)} onSelect={onSelect} onSubmit={onSubmit} />
  </section>;
}

function QuestionContent({ quiz, selectedOptionId, submitted, onSelect, onSubmit }: { quiz: Quiz; selectedOptionId: string; submitted: boolean; onSelect: (optionId: string) => void; onSubmit: () => void }) {
  const options: { id: string; label: string; cards?: CardCode[] }[] = quiz.type === "comparison"
    ? quiz.groups.map((group) => ({ id: group.id, label: group.label, cards: group.cards }))
    : quiz.options.map((option) => ({ id: option.id, label: option.label, cards: "cards" in option ? option.cards : undefined }));

  return <>
    <div className="quiz-meta"><span>难度 {quiz.difficulty}</span><span>{quiz.type === "choice" ? "选择判断" : quiz.type === "comparison" ? "牌型比较" : "局面决策"}</span></div>
    <h3 id={`quiz-${quiz.id}`}>{quiz.prompt}</h3>
    {quiz.type === "decision" && <div className="situation"><CardGroup cards={quiz.situation.yourHand} label="你的手牌" levelRank={quiz.situation.levelRank} />{quiz.situation.previousPlay?.length ? <CardGroup cards={quiz.situation.previousPlay} label="上一手" levelRank={quiz.situation.levelRank} /> : null}<ul>{quiz.situation.notes.map((note) => <li key={note}>{note}</li>)}</ul></div>}
    <fieldset disabled={submitted}><legend className="sr-only">选择一个答案</legend><div className="option-list">{options.map((option) => <label className={`quiz-option ${selectedOptionId === option.id ? "selected" : ""}`} key={option.id}><input type="radio" name={`answer-${quiz.id}`} value={option.id} checked={selectedOptionId === option.id} onChange={() => onSelect(option.id)} /><span>{option.label}</span>{option.cards?.length ? <CardGroup cards={option.cards} levelRank={quiz.type === "comparison" ? quiz.levelRank : quiz.type === "decision" ? quiz.situation.levelRank : undefined} /> : null}</label>)}</div></fieldset>
    {!submitted && <button className="button primary" type="button" disabled={!selectedOptionId} onClick={onSubmit}>提交答案</button>}
  </>;
}

export function QuizFeedback({ quiz, result }: { quiz: Quiz; result: AnswerResult }) {
  return <div className={`feedback ${result.isRecommended ? "correct" : "incorrect"}`} role="status" aria-live="polite"><div className="feedback-title">{result.isRecommended ? <CheckCircle2 aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}<strong>{result.isRecommended ? "判断正确" : "再想一步"}</strong></div>{result.feedback && <p>{result.feedback}</p>}<p>{result.explanation}</p>{quiz.type === "decision" && <div><strong>推荐成立条件</strong><ul>{quiz.conditions.map((item) => <li key={item}>{item}</li>)}</ul></div>}<div className="tag-row">{quiz.skillIds.map((id) => <span className="tag" key={id}>{id}</span>)}</div><Link to={`/learn/${quiz.lessonIds[0]}`} className="text-link">回到相关课程</Link></div>;
}
