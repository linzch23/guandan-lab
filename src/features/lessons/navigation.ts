export interface LessonSection {
  id: string;
  title: string;
}

function slugify(title: string) {
  const slug = title.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\u4e00-\u9fff-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return slug || "section";
}

export function deriveLessonSections(body: string): LessonSection[] {
  const sections: LessonSection[] = [];
  for (const match of body.matchAll(/^##\s+(.+)$/gm)) {
    const title = match[1].trim();
    sections.push({ id: `lesson-section-${sections.length + 1}-${slugify(title)}`, title });
  }
  return sections;
}
