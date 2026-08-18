import { Check, ChevronRight, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { content } from "../content";
import { useProgress } from "../features/progress/progress";

export function LearnPage() {
  const { progress } = useProgress();
  return <div className="page"><header className="page-header"><span className="eyebrow">学习路径</span><h1>按顺序搭好知识骨架</h1><p>课程不强制锁定。建议零基础按编号学习，已有经验的玩家可直接进入技巧路径。</p></header>{content.tracks.map((track) => <section className="track-section" key={track.id}><div className="track-title"><div><span>{track.id === "beginner" ? "基础" : "技巧"}</span><h2>{track.title}</h2></div><Link to={`/assessment/${track.id}`} className="button ghost">结业测验</Link></div><div className="lesson-list">{track.lessonIds.map((id, index) => { const lesson = content.lessonById.get(id)!; const completed = progress.completedLessonIds.includes(id); return <Link to={`/learn/${id}`} className="lesson-row" key={id}><span className={`lesson-index ${completed ? "completed" : ""}`}>{completed ? <Check aria-label="已完成" /> : String(index + 1).padStart(2, "0")}</span><span className="lesson-row-content"><strong>{lesson.title}</strong><small>{lesson.summary}</small></span><span className="lesson-duration"><Clock3 aria-hidden="true" />{lesson.durationMinutes} 分钟</span><ChevronRight aria-hidden="true" /></Link>; })}</div></section>)}</div>;
}
