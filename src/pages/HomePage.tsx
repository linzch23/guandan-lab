import { ArrowRight, BookOpen, Dumbbell, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { content } from "../content";
import type { TrackId } from "../content/schema";
import { getNextLesson } from "../features/learning/logic";
import { deriveTrackStatus, useProgress } from "../features/progress/progress";
import { ProgressBar } from "../components/ProgressBar";

export function HomePage() {
  return <div className="page home-page">
    <section className="home-intro"><div><span className="eyebrow">GUANDANLAB / 掼蛋实验室</span><h1>从看懂规则，到做出有理由的选择。</h1><p>两条学习路径，14 节短课，36 道可解释训练。进度只保存在你的浏览器。</p></div><div className="suit-board" aria-label="扑克牌花色装饰"><span className="black">♠</span><span className="red">♥</span><span className="red">♦</span><span className="black">♣</span></div></section>
    <section className="section-block" aria-labelledby="paths-heading"><div className="section-heading"><div><span className="eyebrow">继续学习</span><h2 id="paths-heading">选择你的路径</h2></div><Link className="text-link" to="/learn">查看全部课程 <ArrowRight aria-hidden="true" /></Link></div><div className="path-grid">{content.tracks.map((track) => <TrackPanel key={track.id} trackId={track.id} />)}</div></section>
    <section className="quick-actions"><Link to="/train"><Dumbbell aria-hidden="true" /><span><strong>开始一组训练</strong><small>按主题与难度筛选</small></span><ArrowRight aria-hidden="true" /></Link><Link to="/skills"><BookOpen aria-hidden="true" /><span><strong>浏览知识地图</strong><small>从规则连接到技巧</small></span><ArrowRight aria-hidden="true" /></Link><Link to="/progress"><RotateCcw aria-hidden="true" /><span><strong>查看学习记录</strong><small>掌握度按最近作答计算</small></span><ArrowRight aria-hidden="true" /></Link></section>
  </div>;
}

function TrackPanel({ trackId }: { trackId: TrackId }) {
  const { progress } = useProgress();
  const track = content.trackById.get(trackId)!;
  const status = deriveTrackStatus(content, progress, trackId);
  const next = getNextLesson(content, progress, trackId);
  const destination = status.completedLessons === status.totalLessons && !status.assessmentPassed ? `/assessment/${trackId}` : next ? `/learn/${next.id}` : "/learn";
  const action = status.completed ? "复习课程" : status.completedLessons === status.totalLessons ? "参加结业测验" : status.completedLessons ? "继续学习" : "开始路径";
  return <article className={`path-panel path-${trackId}`}><div className="path-number">{trackId === "beginner" ? "01" : "02"}</div><div><h3>{track.title}</h3><p>{track.description}</p><ProgressBar value={status.completedLessons} max={status.totalLessons} label="课程完成" /><Link className="button secondary" to={destination}>{action}<ArrowRight aria-hidden="true" /></Link></div></article>;
}
