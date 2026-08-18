import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LessonFrontmatterSchema,
  QuizSchema,
  SkillListSchema,
  SourceListSchema,
  TrackListSchema,
} from "../src/content/schema.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = resolve(root, "content/schemas");
const check = process.argv.includes("--check");
const schemas = {
  "lesson.schema.json": LessonFrontmatterSchema,
  "quiz.schema.json": QuizSchema,
  "skills.schema.json": SkillListSchema,
  "sources.schema.json": SourceListSchema,
  "tracks.schema.json": TrackListSchema,
};

await mkdir(outputDir, { recursive: true });
let hasMismatch = false;

for (const [name, schema] of Object.entries(schemas)) {
  const path = resolve(outputDir, name);
  const next = `${JSON.stringify({ $schema: "https://json-schema.org/draft/2020-12/schema", ...schema }, null, 2)}\n`;
  if (check) {
    const current = await readFile(path, "utf8").catch(() => "");
    if (current !== next) {
      console.error(`${name} is out of date. Run npm run schema:generate.`);
      hasMismatch = true;
    }
  } else {
    await writeFile(path, next, "utf8");
  }
}

if (hasMismatch) process.exitCode = 1;
