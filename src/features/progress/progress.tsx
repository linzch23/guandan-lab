/* eslint-disable react-refresh/only-export-components -- progress contract intentionally co-locates provider, hook, and pure derivations */
import { Value } from "@sinclair/typebox/value";
import { Type, type Static } from "@sinclair/typebox";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import type { ContentIndex, TrackId } from "../../content/schema";

export const STORAGE_KEY = "guandan-lab.progress.v1";
export const CONTENT_REVISION = 2;

const QuestionProgressSchema = Type.Object({
  attempts: Type.Integer({ minimum: 1 }),
  correctAttempts: Type.Integer({ minimum: 0 }),
  lastSelectedOptionId: Type.String(),
  lastWasRecommended: Type.Boolean(),
  lastAttemptedAt: Type.String(),
});
const AssessmentProgressSchema = Type.Object({ attempts: Type.Integer({ minimum: 1 }), bestScore: Type.Number({ minimum: 0, maximum: 100 }), latestScore: Type.Number({ minimum: 0, maximum: 100 }), passedAt: Type.Optional(Type.String()) });
const ProgressSchema = Type.Object({
  schemaVersion: Type.Literal(1),
  contentRevision: Type.Optional(Type.Literal(2)),
  completedLessonIds: Type.Array(Type.String(), { uniqueItems: true }),
  questions: Type.Record(Type.String(), QuestionProgressSchema),
  assessments: Type.Partial(Type.Object({ beginner: AssessmentProgressSchema, skills: AssessmentProgressSchema })),
  lastLocation: Type.Optional(Type.Object({ kind: Type.Union([Type.Literal("lesson"), Type.Literal("training"), Type.Literal("assessment")]), id: Type.Optional(Type.String()) })),
});

export type ProgressV1 = Static<typeof ProgressSchema>;
type Action =
  | { type: "answer"; questionId: string; optionId: string; correct: boolean; at: string }
  | { type: "completeLesson"; lessonId: string }
  | { type: "assessment"; trackId: TrackId; score: number; at: string }
  | { type: "location"; kind: "lesson" | "training" | "assessment"; id?: string }
  | { type: "reset" };

export const emptyProgress = (): ProgressV1 => ({ schemaVersion: 1, contentRevision: CONTENT_REVISION, completedLessonIds: [], questions: {}, assessments: {} });

export function loadProgress(storage: Pick<Storage, "getItem"> = localStorage): ProgressV1 {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed: unknown = JSON.parse(raw);
    if (!Value.Check(ProgressSchema, parsed)) return emptyProgress();
    if (parsed.contentRevision === CONTENT_REVISION) return parsed;
    return { ...parsed, contentRevision: CONTENT_REVISION, assessments: {} };
  } catch {
    return emptyProgress();
  }
}

export function progressReducer(state: ProgressV1, action: Action): ProgressV1 {
  if (action.type === "reset") return emptyProgress();
  if (action.type === "completeLesson") return { ...state, completedLessonIds: [...new Set([...state.completedLessonIds, action.lessonId])] };
  if (action.type === "location") return { ...state, lastLocation: { kind: action.kind, id: action.id } };
  if (action.type === "answer") {
    const previous = state.questions[action.questionId];
    return {
      ...state,
      questions: {
        ...state.questions,
        [action.questionId]: {
          attempts: (previous?.attempts ?? 0) + 1,
          correctAttempts: (previous?.correctAttempts ?? 0) + (action.correct ? 1 : 0),
          lastSelectedOptionId: action.optionId,
          lastWasRecommended: action.correct,
          lastAttemptedAt: action.at,
        },
      },
    };
  }
  const previous = state.assessments[action.trackId];
  const passed = action.score >= 80;
  return {
    ...state,
    assessments: {
      ...state.assessments,
      [action.trackId]: {
        attempts: (previous?.attempts ?? 0) + 1,
        bestScore: Math.max(previous?.bestScore ?? 0, action.score),
        latestScore: action.score,
        passedAt: passed ? (previous?.passedAt ?? action.at) : previous?.passedAt,
      },
    },
  };
}

export function deriveSkillStats(content: ContentIndex, progress: ProgressV1) {
  return content.skills.filter((skill) => skill.availability === "available").map((skill) => {
    const relevant = content.quizzes.filter((quiz) => quiz.skillIds.includes(skill.id) && progress.questions[quiz.id]);
    const correct = relevant.filter((quiz) => progress.questions[quiz.id].lastWasRecommended).length;
    return { skill, attempted: relevant.length, correct, percent: relevant.length >= 3 ? Math.round((correct / relevant.length) * 100) : null };
  });
}

export function deriveTrackStatus(content: ContentIndex, progress: ProgressV1, trackId: TrackId) {
  const track = content.trackById.get(trackId);
  if (!track) return { completedLessons: 0, totalLessons: 0, assessmentPassed: false, completed: false };
  const completedLessons = track.lessonIds.filter((id) => progress.completedLessonIds.includes(id)).length;
  const assessmentPassed = Boolean(progress.assessments[trackId]?.passedAt);
  return { completedLessons, totalLessons: track.lessonIds.length, assessmentPassed, completed: completedLessons === track.lessonIds.length && assessmentPassed };
}

interface ProgressContextValue {
  progress: ProgressV1;
  recordAnswer: (questionId: string, optionId: string, correct: boolean) => void;
  completeLesson: (lessonId: string) => void;
  recordAssessment: (trackId: TrackId, score: number) => void;
  setLastLocation: (kind: "lesson" | "training" | "assessment", id?: string) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, dispatchBase] = useReducer(progressReducer, undefined, () => loadProgress());
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);
  const recordAnswer = useCallback((questionId: string, optionId: string, correct: boolean) => dispatchBase({ type: "answer", questionId, optionId, correct, at: new Date().toISOString() }), []);
  const completeLesson = useCallback((lessonId: string) => dispatchBase({ type: "completeLesson", lessonId }), []);
  const recordAssessment = useCallback((trackId: TrackId, score: number) => dispatchBase({ type: "assessment", trackId, score, at: new Date().toISOString() }), []);
  const setLastLocation = useCallback((kind: "lesson" | "training" | "assessment", id?: string) => dispatchBase({ type: "location", kind, id }), []);
  const resetProgress = useCallback(() => dispatchBase({ type: "reset" }), []);
  const value = useMemo<ProgressContextValue>(() => ({ progress, recordAnswer, completeLesson, recordAssessment, setLastLocation, resetProgress }), [progress, recordAnswer, completeLesson, recordAssessment, setLastLocation, resetProgress]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error("useProgress must be used inside ProgressProvider");
  return value;
}
