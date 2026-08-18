import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Link, useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import { CardExample } from "../components/PlayingCard";
import { QuizView } from "../components/QuizView";
import { content } from "../content";
import { canCompleteLesson } from "../features/learning/logic";
import { useProgress } from "../features/progress/progress";

export function LessonPage() {
  const { lessonId = "" } = useParams();
  const lesson = content.lessonById.get(lessonId);
  const { progress, recordAnswer, completeLesson, setLastLocation } = useProgress();
  useEffect(() => { if (lesson) setLastLocation("lesson", lesson.id); }, [lesson, setLastLocation]);
  if (!lesson) return <NotFound title="没有找到这节课" />;
  const track = content.trackById.get(lesson.trackId)!;
  const position = track.lessonIds.indexOf(lesson.id);
  const previous = content.lessonById.get(track.lessonIds[position - 1]);
  const next = content.lessonById.get(track.lessonIds[position + 1]);
  const completable = canCompleteLesson(lesson.checkpointQuestionIds, progress);
  const completed = progress.completedLessonIds.includes(lesson.id);
  const cleanBody = lesson.body.replace(/```cards\s*\n[\s\S]*?```/g, "");
  return <article className="page lesson-page"><header className="lesson-header"><Link to="/learn" className="back-link"><ArrowLeft aria-hidden="true" />返回学习路径</Link><div className="lesson-kicker"><span>{track.title}</span><span>第 {position + 1} / {track.lessonIds.length} 课</span><span>{lesson.durationMinutes} 分钟</span></div><h1>{lesson.title}</h1><p>{lesson.summary}</p><div className="objective-list">{lesson.objectives.map((item) => <span key={item}>{item}</span>)}</div></header><div className="lesson-layout"><div className="lesson-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanBody}</ReactMarkdown>{lesson.cards.map((block, index) => <CardExample block={block} key={`${block.title}-${index}`} />)}<section className="checkpoint"><div className="section-heading"><div><span className="eyebrow">即时练习</span><h2>检查你的理解</h2></div><span>{lesson.checkpointQuestionIds.length} 题</span></div>{lesson.checkpointQuestionIds.map((id) => { const quiz = content.quizById.get(id)!; return <QuizView key={id} quiz={quiz} compact onAnswered={(result) => recordAnswer(id, result.selectedOptionId, result.isRecommended)} />; })}<button className="button primary complete-button" type="button" disabled={!completable || completed} onClick={() => completeLesson(lesson.id)}>{completed ? <><CheckCircle2 aria-hidden="true" />已完成本节</> : completable ? "完成本节" : "答完检查题后完成"}</button></section><section className="sources"><h2>依据与审核</h2>{lesson.sourceIds.map((id) => { const source = content.sourceById.get(id)!; return <a href={source.url} target="_blank" rel="noreferrer" key={id}>{source.title} · {source.publisher}<ExternalLink aria-hidden="true" /></a>; })}<p>状态：{lesson.review.status === "draft" ? "草稿，等待维护者审核" : `已由 ${lesson.review.reviewer} 审核`}</p></section></div><aside className="lesson-toc"><strong>本节目标</strong><ol>{lesson.objectives.map((item) => <li key={item}>{item}</li>)}</ol></aside></div><nav className="lesson-nav">{previous ? <Link to={`/learn/${previous.id}`}><ArrowLeft aria-hidden="true" /><span><small>上一课</small>{previous.title}</span></Link> : <span />}{next ? <Link to={`/learn/${next.id}`}><span><small>下一课</small>{next.title}</span><ArrowRight aria-hidden="true" /></Link> : <Link to={`/assessment/${lesson.trackId}`}><span><small>完成路径</small>参加结业测验</span><ArrowRight aria-hidden="true" /></Link>}</nav></article>;
}

function NotFound({ title }: { title: string }) { return <div className="page empty-state"><h1>{title}</h1><Link className="button primary" to="/learn">返回课程列表</Link></div>; }
