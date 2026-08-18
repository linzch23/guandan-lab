import type { ContentIndex, TrackId } from "../../content/schema";
import type { ProgressV1 } from "../progress/progress";

export function getNextLesson(content: ContentIndex, progress: ProgressV1, trackId: TrackId) {
  const track = content.trackById.get(trackId);
  if (!track) return undefined;
  const id = track.lessonIds.find((lessonId) => !progress.completedLessonIds.includes(lessonId)) ?? track.lessonIds[track.lessonIds.length - 1];
  return content.lessonById.get(id);
}

export function canCompleteLesson(checkpointQuestionIds: string[], progress: ProgressV1) {
  return checkpointQuestionIds.every((id) => Boolean(progress.questions[id]));
}
