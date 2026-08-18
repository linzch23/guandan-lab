import type { Quiz, Skill, Track } from "../../content/schema";

export interface QuizFilters {
  trackId?: string;
  skillId?: string;
  difficulty?: number;
}

export interface AnswerResult {
  selectedOptionId: string;
  recommendedOptionId: string;
  isRecommended: boolean;
  feedback?: string;
  explanation: string;
}

export interface AssessmentResult {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  weakSkillIds: string[];
}

export function recommendedOptionId(quiz: Quiz) {
  if (quiz.type === "choice") return quiz.correctOptionId;
  if (quiz.type === "comparison") return quiz.correctGroupId;
  return quiz.recommendedOptionId;
}

export function createSession(quizzes: Quiz[], filters: QuizFilters, limit = 10, random: () => number = Math.random) {
  const matches = quizzes.filter((quiz) =>
    (!filters.trackId || quiz.trackId === filters.trackId) &&
    (!filters.skillId || quiz.skillIds.includes(filters.skillId)) &&
    (!filters.difficulty || quiz.difficulty === filters.difficulty),
  );
  const shuffled = [...matches];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled.slice(0, Math.min(limit, 10));
}

export function gradeAnswer(quiz: Quiz, selectedOptionId: string): AnswerResult {
  const recommended = recommendedOptionId(quiz);
  const feedback = quiz.type === "choice"
    ? quiz.feedbackByOption?.[selectedOptionId]
    : quiz.type === "decision"
      ? quiz.options.find((option) => option.id === selectedOptionId)?.feedback
      : undefined;
  return {
    selectedOptionId,
    recommendedOptionId: recommended,
    isRecommended: selectedOptionId === recommended,
    feedback,
    explanation: quiz.explanation,
  };
}

export function scoreAssessment(track: Track, quizzes: Quiz[], answers: Record<string, string>, skills: Skill[]): AssessmentResult {
  const assessmentQuizzes = track.assessmentQuestionIds.map((id) => quizzes.find((quiz) => quiz.id === id)).filter((quiz): quiz is Quiz => Boolean(quiz));
  let correct = 0;
  const missedSkillIds = new Set<string>();
  for (const quiz of assessmentQuizzes) {
    if (answers[quiz.id] === recommendedOptionId(quiz)) correct += 1;
    else quiz.skillIds.forEach((id) => missedSkillIds.add(id));
  }
  const total = assessmentQuizzes.length;
  const score = total ? Math.round((correct / total) * 100) : 0;
  return {
    score,
    correct,
    total,
    passed: score >= 80,
    weakSkillIds: skills.filter((skill) => missedSkillIds.has(skill.id)).map((skill) => skill.id),
  };
}
