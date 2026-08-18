import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SessionRunner } from "../components/SessionRunner";
import { content } from "../content";
import { useProgress } from "../features/progress/progress";
import { createSession } from "../features/training/logic";

export function TrainingSessionPage() {
  const [params] = useSearchParams();
  const [done, setDone] = useState(false);
  const { recordAnswer, setLastLocation } = useProgress();
  const query = params.toString();
  const quizzes = useMemo(() => { const current = new URLSearchParams(query); return createSession(content.quizzes, { trackId: current.get("trackId") || undefined, skillId: current.get("skillId") || undefined, difficulty: current.get("difficulty") ? Number(current.get("difficulty")) : undefined }); }, [query]);
  useEffect(() => setLastLocation("training"), [setLastLocation]);
  if (done) return <div className="page result-page"><span className="result-number">完成</span><h1>这一组已经练完</h1><p>结果已写入当前浏览器。技巧统计采用每道题最近一次结果。</p><div className="result-actions"><Link className="button primary" to="/progress">查看进度</Link><Link className="button secondary" to="/train">再选一组</Link></div></div>;
  return <div className="page session-page training-session-page"><Link to="/train" className="back-link">退出本组</Link><SessionRunner quizzes={quizzes} onAnswer={(quiz, result) => recordAnswer(quiz.id, result.selectedOptionId, result.isRecommended)} onFinish={() => setDone(true)} /></div>;
}
