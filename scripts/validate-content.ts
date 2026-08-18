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
  if (content.lessons.length !== 14) errors.push(`production requires 14 lessons, found ${content.lessons.length}`);
  if (content.quizzes.length !== 36) errors.push(`production requires 36 quizzes, found ${content.quizzes.length}`);
  const counts = { choice: 0, comparison: 0, decision: 0 };
  for (const quiz of content.quizzes) counts[quiz.type] += 1;
  if (counts.choice !== 14 || counts.comparison !== 10 || counts.decision !== 12) errors.push(`quiz distribution must be 14/10/12, found ${counts.choice}/${counts.comparison}/${counts.decision}`);
  for (const item of [...content.lessons, ...content.quizzes]) {
    if (item.review.status !== "approved" || !item.review.reviewer || !item.review.reviewedAt) errors.push(`${item.id}: production content is not approved`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Validated ${content.lessons.length} lessons and ${content.quizzes.length} quizzes in ${mode} mode.`);
