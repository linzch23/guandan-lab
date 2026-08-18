import { describe, expect, it } from "vitest";
import type { Quiz, Skill, Track } from "../../content/schema";
import { createSession, gradeAnswer, scoreAssessment } from "./logic";

const quiz = (id: string, skillIds = ["control"]): Quiz => ({
  schemaVersion: 1,
  id,
  type: "choice",
  trackId: "skills",
  difficulty: 1,
  prompt: "test",
  skillIds,
  lessonIds: ["lesson"],
  sourceIds: ["source"],
  explanation: "because",
  review: { status: "draft" },
  options: [{ id: "yes", label: "yes" }, { id: "no", label: "no" }],
  correctOptionId: "yes",
});

describe("training logic", () => {
  it("filters and caps sessions without duplicates", () => {
    const quizzes = Array.from({ length: 12 }, (_, index) => quiz(`q-${index}`));
    const session = createSession(quizzes, { trackId: "skills" }, 10, () => 0.4);
    expect(session).toHaveLength(10);
    expect(new Set(session.map((item) => item.id)).size).toBe(10);
  });

  it("grades against the recommended option", () => {
    expect(gradeAnswer(quiz("q-one"), "yes").isRecommended).toBe(true);
    expect(gradeAnswer(quiz("q-one"), "no").isRecommended).toBe(false);
  });

  it("uses the 80 percent assessment boundary", () => {
    const quizzes = Array.from({ length: 10 }, (_, index) => quiz(`q-${index}`, [`skill-${index}`]));
    const track: Track = { id: "skills", title: "t", description: "d", lessonIds: ["lesson"], assessmentQuestionIds: quizzes.map((item) => item.id) };
    const skills = quizzes.map((_, index) => ({ id: `skill-${index}`, title: `s${index}`, group: "basic-strategy", description: "d", order: index + 1, availability: "available" })) as Skill[];
    const seven = Object.fromEntries(quizzes.map((item, index) => [item.id, index < 7 ? "yes" : "no"]));
    const eight = { ...seven, "q-7": "yes" };
    expect(scoreAssessment(track, quizzes, seven, skills).passed).toBe(false);
    expect(scoreAssessment(track, quizzes, eight, skills).passed).toBe(true);
  });
});
