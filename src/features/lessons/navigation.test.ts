import { describe, expect, it } from "vitest";
import { deriveLessonSections } from "./navigation";

describe("lesson navigation", () => {
  it("derives stable ids from level-two markdown headings", () => {
    expect(deriveLessonSections("## 先看结构\n正文\n### 子标题\n## 什么时候过牌")).toEqual([
      { id: "lesson-section-1-先看结构", title: "先看结构" },
      { id: "lesson-section-2-什么时候过牌", title: "什么时候过牌" },
    ]);
  });

  it("keeps duplicate headings addressable", () => {
    const sections = deriveLessonSections("## 复盘\n## 复盘");
    expect(sections.map((section) => section.id)).toEqual(["lesson-section-1-复盘", "lesson-section-2-复盘"]);
  });
});
