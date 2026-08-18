import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { content } from "../content";

interface LessonDirectoryProps {
  currentLessonId: string;
  completedLessonIds: string[];
  onNavigate?: () => void;
}

export function LessonDirectory({ currentLessonId, completedLessonIds, onNavigate }: LessonDirectoryProps) {
  return <nav className="lesson-directory" aria-label="课程目录">
    <div className="lesson-directory-heading"><span className="eyebrow">课程目录</span><strong>全部课程</strong></div>
    {content.tracks.map((track) => <section className="lesson-directory-group" key={track.id}>
      <h2>{track.title}</h2>
      <div className="lesson-directory-list">
        {track.lessonIds.map((id, index) => {
          const lesson = content.lessonById.get(id)!;
          const active = id === currentLessonId;
          const completed = completedLessonIds.includes(id);
          return <Link
            className={`lesson-directory-item${active ? " active" : ""}`}
            to={`/learn/${id}`}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            key={id}
          >
            <span className={`lesson-directory-index${completed ? " completed" : ""}`}>{completed ? <Check aria-label="已完成" /> : String(index + 1).padStart(2, "0")}</span>
            <span className="lesson-directory-copy"><strong>{lesson.title}</strong><small>{lesson.durationMinutes} 分钟</small></span>
          </Link>;
        })}
      </div>
    </section>)}
  </nav>;
}
