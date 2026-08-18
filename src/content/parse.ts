import type { CardBlock, Lesson, LessonFrontmatter } from "./schema";
import { parseFrontmatter } from "./frontmatter";

export function parseLesson(raw: string): Lesson {
  const parsed = parseFrontmatter(raw);
  const metadata = parsed.data as LessonFrontmatter;
  const cards: CardBlock[] = [];
  for (const match of parsed.content.matchAll(/```cards\s*\n([\s\S]*?)```/g)) {
    const value: unknown = JSON.parse(match[1]);
    cards.push(value as CardBlock);
  }
  return { ...metadata, body: parsed.content, cards };
}
