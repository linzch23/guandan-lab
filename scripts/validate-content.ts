import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadContentFiles } from "./content-utils.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const modeArg = process.argv.find((arg) => arg.startsWith("--mode="));
const spacedMode = process.argv[process.argv.indexOf("--mode") + 1];
const mode = modeArg?.split("=")[1] ?? spacedMode ?? "development";
const production = mode === "production";
const errors: string[] = [];
const content = await loadContentFiles(root).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

function unique(label: string, values: string[]) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) errors.push(`${label}: duplicate id ${value}`);
    seen.add(value);
  }
}

function requireRef(kind: string, owner: string, refs: string[], known: Set<string>) {
  for (const ref of refs) if (!known.has(ref)) errors.push(`${owner}: unknown ${kind} ${ref}`);
}

unique("tracks", content.tracks.map((item) => item.id));
unique("skills", content.skills.map((item) => item.id));
unique("sources", content.sources.map((item) => item.id));
unique("lessons", content.lessons.map((item) => item.id));
unique("quizzes", content.quizzes.map((item) => item.id));

const skillIds = new Set(content.skills.map((item) => item.id));
const sourceIds = new Set(content.sources.map((item) => item.id));
const lessonIds = new Set(content.lessons.map((item) => item.id));
const quizIds = new Set(content.quizzes.map((item) => item.id));

for (const track of content.tracks) {
  requireRef("lesson", `track ${track.id}`, track.lessonIds, lessonIds);
  requireRef("quiz", `track ${track.id}`, track.assessmentQuestionIds, quizIds);
}
for (const lesson of content.lessons) {
  requireRef("skill", `lesson ${lesson.id}`, lesson.skillIds, skillIds);
  requireRef("source", `lesson ${lesson.id}`, lesson.sourceIds, sourceIds);
  requireRef("quiz", `lesson ${lesson.id}`, lesson.checkpointQuestionIds, quizIds);
  if (!lesson.cards.length) errors.push(`lesson ${lesson.id}: at least one cards block is required`);
  const bodyLength = lesson.body.replace(/```cards[\s\S]*?```/g, "").replace(/[`*_#>-]/g, "").trim().length;
  const minimum = lesson.trackId === "beginner" ? 800 : 1200;
  const maximum = lesson.trackId === "beginner" ? 1200 : 1800;
  if (bodyLength < minimum || bodyLength > maximum) errors.push(`lesson ${lesson.id}: body length must be ${minimum}-${maximum}, found ${bodyLength}`);
  const requiredQuizCount = lesson.trackId === "beginner" ? 3 : 4;
  if (lesson.checkpointQuestionIds.length < requiredQuizCount) errors.push(`lesson ${lesson.id}: at least ${requiredQuizCount} checkpoint quizzes required`);
}
for (const quiz of content.quizzes) {
  requireRef("skill", `quiz ${quiz.id}`, quiz.skillIds, skillIds);
  requireRef("source", `quiz ${quiz.id}`, quiz.sourceIds, sourceIds);
  requireRef("lesson", `quiz ${quiz.id}`, quiz.lessonIds, lessonIds);
  if (quiz.type === "choice" && !quiz.options.some((item) => item.id === quiz.correctOptionId)) errors.push(`quiz ${quiz.id}: correctOptionId is not an option`);
  if (quiz.type === "comparison" && !quiz.groups.some((item) => item.id === quiz.correctGroupId)) errors.push(`quiz ${quiz.id}: correctGroupId is not a group`);
  if (quiz.type === "decision" && !quiz.options.some((item) => item.id === quiz.recommendedOptionId)) errors.push(`quiz ${quiz.id}: recommendedOptionId is not an option`);
}

if (production) {
  if (content.lessons.length !== 10) errors.push(`production requires 10 lessons, found ${content.lessons.length}`);
  if (content.quizzes.length !== 36) errors.push(`production requires 36 quizzes, found ${content.quizzes.length}`);
  const beginner = content.lessons.filter((lesson) => lesson.trackId === "beginner").length;
  const skills = content.lessons.filter((lesson) => lesson.trackId === "skills").length;
  if (beginner !== 4 || skills !== 6) errors.push(`lesson distribution must be 4/6, found ${beginner}/${skills}`);
  const counts = { choice: 0, comparison: 0, decision: 0 };
  for (const quiz of content.quizzes) counts[quiz.type] += 1;
  if (counts.choice !== 14 || counts.comparison !== 10 || counts.decision !== 12) errors.push(`quiz distribution must be 14/10/12, found ${counts.choice}/${counts.comparison}/${counts.decision}`);
  const beginnerQuizzes = content.quizzes.filter((quiz) => quiz.trackId === "beginner").length;
  const skillQuizzes = content.quizzes.filter((quiz) => quiz.trackId === "skills").length;
  if (beginnerQuizzes !== 12 || skillQuizzes !== 24) errors.push(`quiz track distribution must be 12/24, found ${beginnerQuizzes}/${skillQuizzes}`);
  for (const track of content.tracks) {
    if (track.id === "beginner" && track.lessonIds.length !== 4) errors.push("beginner track must contain 4 lessons");
    if (track.id === "skills" && track.lessonIds.length !== 6) errors.push("skills track must contain 6 lessons");
    if (track.assessmentQuestionIds.length !== 10) errors.push(`track ${track.id}: assessment must contain 10 quizzes`);
  }
  for (const item of [...content.lessons, ...content.quizzes]) {
    if (item.review.status !== "approved" || !item.review.reviewer || !item.review.reviewedAt) errors.push(`${item.id}: production content is not approved`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Validated ${content.lessons.length} lessons and ${content.quizzes.length} quizzes in ${mode} mode.`);
