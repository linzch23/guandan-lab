import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SessionRunner } from "../components/SessionRunner";
import { content } from "../content";
import type { TrackId } from "../content/schema";
import { useProgress } from "../features/progress/progress";
import { createSession, scoreAssessment, type AssessmentResult } from "../features/training/logic";

export function AssessmentPage() {
  const { trackId = "" } = useParams();
  const track = content.trackById.get(trackId);
  const { recordAnswer, recordAssessment, setLastLocation } = useProgress();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const quizzes = useMemo(() => track ? createSession(track.assessmentQuestionIds.map((id) => content.quizById.get(id)!).filter(Boolean), {}, 10) : [], [track]);
  useEffect(() => { if (track) setLastLocation("assessment", track.id); }, [track, setLastLocation]);
  if (!track) return <div className="page empty-state"><h1>没有找到这套测验</h1></div>;
  if (result) return <div className="page result-page"><span className={`result-number ${result.passed ? "pass" : ""}`}>{result.score}</span><h1>{result.passed ? "通过结业测验" : "还差一点"}</h1><p>答对 {result.correct} / {result.total}。{result.passed ? "达到 80% 通过线。" : "达到 8 题正确即可通过。"}</p>{result.weakSkillIds.length > 0 && <div className="weak-list"><strong>建议复习</strong>{result.weakSkillIds.map((id) => <span key={id}>{content.skillById.get(id)?.title}</span>)}</div>}<div className="result-actions"><Link className="button primary" to="/progress">查看路径进度</Link><Link className="button secondary" to={`/assessment/${track.id}`} onClick={() => window.location.reload()}>重新测验</Link></div></div>;
  return <div className="page session-page assessment-session-page"><header className="assessment-header"><span className="eyebrow">{track.title} · 结业测验</span><h1>10 道题，答对 8 道通过</h1><p>题目顺序每次打乱。未通过不会覆盖历史最佳成绩。</p></header><SessionRunner quizzes={quizzes} onAnswer={(quiz, answer) => recordAnswer(quiz.id, answer.selectedOptionId, answer.isRecommended)} onFinish={(answers) => { const next = scoreAssessment(track, content.quizzes, answers, content.skills); recordAssessment(track.id as TrackId, next.score); setResult(next); }} /></div>;
}
