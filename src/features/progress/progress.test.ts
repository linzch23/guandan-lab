import { describe, expect, it } from "vitest";
import { content } from "../../content";
import { deriveTrackStatus, emptyProgress, loadProgress, progressReducer, STORAGE_KEY } from "./progress";

describe("progress", () => {
  it("falls back when stored data is corrupted", () => {
    const storage = { getItem: (key: string) => key === STORAGE_KEY ? "not-json" : null };
    expect(loadProgress(storage as Storage)).toEqual(emptyProgress());
  });

  it("migrates old content by clearing assessments once", () => {
    const old = {
      schemaVersion: 1,
      completedLessonIds: ["b01-introduction"],
      questions: { "old-question": { attempts: 1, correctAttempts: 1, lastSelectedOptionId: "a", lastWasRecommended: true, lastAttemptedAt: "now" } },
      assessments: { beginner: { attempts: 2, bestScore: 90, latestScore: 90, passedAt: "now" } },
      lastLocation: { kind: "lesson", id: "b01-introduction" },
    };
    const storage = { getItem: () => JSON.stringify(old) };
    const migrated = loadProgress(storage as unknown as Storage);
    expect(migrated.contentRevision).toBe(2);
    expect(migrated.assessments).toEqual({});
    expect(migrated.completedLessonIds).toEqual(["b01-introduction"]);
    expect(migrated.questions["old-question"]).toBeDefined();
    expect(migrated.lastLocation).toEqual(old.lastLocation);
  });

  it("does not clear assessments for already migrated content", () => {
    const current = { ...emptyProgress(), assessments: { beginner: { attempts: 1, bestScore: 80, latestScore: 80, passedAt: "now" } } };
    const storage = { getItem: () => JSON.stringify(current) };
    expect(loadProgress(storage as unknown as Storage).assessments.beginner?.bestScore).toBe(80);
  });

  it("keeps latest answer and cumulative attempts", () => {
    const once = progressReducer(emptyProgress(), { type: "answer", questionId: "q", optionId: "a", correct: false, at: "now" });
    const twice = progressReducer(once, { type: "answer", questionId: "q", optionId: "b", correct: true, at: "later" });
    expect(twice.questions.q).toMatchObject({ attempts: 2, correctAttempts: 1, lastSelectedOptionId: "b", lastWasRecommended: true });
  });

  it("retains the best assessment score", () => {
    const passed = progressReducer(emptyProgress(), { type: "assessment", trackId: "beginner", score: 90, at: "now" });
    const retried = progressReducer(passed, { type: "assessment", trackId: "beginner", score: 60, at: "later" });
    expect(retried.assessments.beginner).toMatchObject({ attempts: 2, bestScore: 90, latestScore: 60, passedAt: "now" });
  });

  it("completes a track only after lessons and assessment are complete", () => {
    const track = content.trackById.get("beginner")!;
    const lessonOnly = { ...emptyProgress(), completedLessonIds: [...track.lessonIds] };
    expect(deriveTrackStatus(content, lessonOnly, "beginner").completed).toBe(false);
    const complete = { ...lessonOnly, assessments: { beginner: { attempts: 1, bestScore: 80, latestScore: 80, passedAt: "now" } } };
    expect(deriveTrackStatus(content, complete, "beginner").completed).toBe(true);
  });
});
