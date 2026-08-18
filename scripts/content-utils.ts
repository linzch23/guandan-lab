import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Value } from "@sinclair/typebox/value";
import { parseFrontmatter } from "../src/content/frontmatter.ts";
import {
  CardBlockSchema,
  LessonFrontmatterSchema,
  QuizSchema,
  SkillListSchema,
  SourceListSchema,
  TrackListSchema,
  type CardBlock,
  type Lesson,
  type LessonFrontmatter,
  type Quiz,
  type Skill,
  type Source,
  type Track,
} from "../src/content/schema.ts";

export interface LoadedContent {
  tracks: Track[];
  skills: Skill[];
  sources: Source[];
  lessons: Lesson[];
  quizzes: Quiz[];
}

function schemaErrors(schema: Parameters<typeof Value.Errors>[0], value: unknown) {
  return [...Value.Errors(schema, value)].map((error) => `${error.path || "/"}: ${error.message}`).join("; ");
}

function assertSchema<T>(schema: Parameters<typeof Value.Check>[0], value: unknown, label: string): asserts value is T {
  if (!Value.Check(schema, value)) throw new Error(`${label}: ${schemaErrors(schema, value)}`);
}

function parseCardBlocks(body: string, label: string): CardBlock[] {
  const blocks: CardBlock[] = [];
  const expression = /```cards\s*\n([\s\S]*?)```/g;
  for (const match of body.matchAll(expression)) {
    let value: unknown;
    try {
      value = JSON.parse(match[1]);
    } catch {
      throw new Error(`${label}: invalid JSON in cards block`);
    }
    assertSchema<CardBlock>(CardBlockSchema, value, `${label} cards block`);
    blocks.push(value);
  }
  return blocks;
}

async function json<T>(path: string, schema: Parameters<typeof Value.Check>[0]): Promise<T> {
  const value: unknown = JSON.parse(await readFile(path, "utf8"));
  assertSchema<T>(schema, value, path);
  return value;
}

export async function loadContentFiles(root: string): Promise<LoadedContent> {
  const catalog = resolve(root, "content/catalog");
  const tracks = await json<Track[]>(resolve(catalog, "tracks.json"), TrackListSchema);
  const skills = await json<Skill[]>(resolve(catalog, "skills.json"), SkillListSchema);
  const sources = await json<Source[]>(resolve(catalog, "sources.json"), SourceListSchema);
  const lessonDir = resolve(root, "content/lessons");
  const quizDir = resolve(root, "content/quizzes");
  const lessonFiles = (await readdir(lessonDir)).filter((name) => name.endsWith(".md")).sort();
  const quizFiles = (await readdir(quizDir)).filter((name) => name.endsWith(".json")).sort();

  const lessons = await Promise.all(lessonFiles.map(async (name) => {
    const path = resolve(lessonDir, name);
    const parsed = parseFrontmatter(await readFile(path, "utf8"));
    assertSchema<LessonFrontmatter>(LessonFrontmatterSchema, parsed.data, path);
    return { ...parsed.data, body: parsed.content, cards: parseCardBlocks(parsed.content, path) };
  }));

  const quizzes = await Promise.all(quizFiles.map(async (name) => json<Quiz>(resolve(quizDir, name), QuizSchema)));
  return { tracks, skills, sources, lessons, quizzes };
}
